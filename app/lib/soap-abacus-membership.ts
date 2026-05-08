import { NextResponse } from 'next/server';
import { getCurrentUserId, isClerkConfigured } from './auth';
import {
  getSoapAbacusMembershipForUser,
  isRecipeVaultConfigured,
  upsertSoapAbacusMembership,
  type SoapAbacusMembershipRecord,
} from './recipe-vault';
import {
  FEATURE_KEYS,
  canSaveRecipe,
  createNoCardTrialMembership,
  getEffectiveMembership,
  getFeatureListForTier,
  hasFeature,
  normalizeTier,
} from '@/app/soap-calculator/studio/membership-model';

export type SoapAbacusTier = 'free' | 'plus' | 'pro';

export interface SoapAbacusMembership extends SoapAbacusMembershipRecord {
  tier: SoapAbacusTier;
  effectiveTier: SoapAbacusTier;
  features: string[];
  featureLabels: string[];
  isPaid: boolean;
}

export function defaultFreeMembership(userId: string): SoapAbacusMembership {
  const effective = getEffectiveMembership({ userId, tier: 'free', status: 'free' });
  return decorateMembership(effective);
}

export function decorateMembership(record: Record<string, unknown> | SoapAbacusMembershipRecord): SoapAbacusMembership {
  const effective = getEffectiveMembership(record as Record<string, unknown>) as Record<string, unknown>;
  const tier = normalizeTier(effective.tier) as SoapAbacusTier;
  const features = (Object.values(FEATURE_KEYS) as string[]).filter((feature) => hasFeature(effective, feature));
  return {
    ...(effective as unknown as SoapAbacusMembershipRecord),
    userId: String(effective.userId || ''),
    tier,
    effectiveTier: normalizeTier(effective.effectiveTier || tier) as SoapAbacusTier,
    status: String(effective.status || 'free'),
    features,
    featureLabels: getFeatureListForTier(tier),
    isPaid: Boolean(effective.isPaid),
  };
}

export async function getCurrentSoapAbacusMembership() {
  if (!isClerkConfigured()) {
    return { ok: false as const, response: NextResponse.json({ error: 'Clerk is not configured.' }, { status: 503 }) };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false as const, response: NextResponse.json({ error: 'Sign in to use Soap Abacus Studio.' }, { status: 401 }) };
  }

  if (!isRecipeVaultConfigured()) {
    return { ok: true as const, userId, membership: defaultFreeMembership(userId), databaseReady: false };
  }

  const stored = await getSoapAbacusMembershipForUser(userId);
  return {
    ok: true as const,
    userId,
    membership: decorateMembership(stored || { userId, tier: 'free', status: 'free' }),
    databaseReady: true,
  };
}

export async function requireSoapAbacusFeature(feature: string) {
  const setup = await getCurrentSoapAbacusMembership();
  if (!setup.ok) return setup;

  if (!hasFeature(setup.membership, feature)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: 'Upgrade your Soap Abacus membership to use this feature.',
          feature,
          membership: setup.membership,
        },
        { status: 402 },
      ),
    };
  }

  return setup;
}

export async function startNoCardProTrial(userId: string) {
  if (!isRecipeVaultConfigured()) {
    throw new Error('DATABASE_URL is required to start a no-card Pro trial.');
  }

  const existing = await getSoapAbacusMembershipForUser(userId);
  if (existing?.trialUsedAt) {
    return decorateMembership(existing);
  }

  const trial = createNoCardTrialMembership(userId);
  const stored = await upsertSoapAbacusMembership({
    ...trial,
    userId,
    tier: 'pro',
    status: 'trialing',
    metadata: { trial_source: 'no-card' },
  });
  const membership = decorateMembership(stored || trial);
  await mirrorMembershipToClerk(membership);
  return membership;
}

export async function persistSoapAbacusMembership(record: SoapAbacusMembershipRecord) {
  if (!isRecipeVaultConfigured()) return decorateMembership(record);
  const stored = await upsertSoapAbacusMembership(record);
  const membership = decorateMembership(stored || record);
  await mirrorMembershipToClerk(membership);
  return membership;
}

export function canSaveRecipeForMembership(membership: SoapAbacusMembership, currentRecipeCount: number) {
  return canSaveRecipe(membership, currentRecipeCount);
}

export async function mirrorMembershipToClerk(membership: SoapAbacusMembership) {
  if (!isClerkConfigured() || !membership.userId) return;

  try {
    const clerkModule = await import('@clerk/nextjs/server');
    const maybeClient = clerkModule.clerkClient;
    const client = typeof maybeClient === 'function' ? await maybeClient() : maybeClient;
    await client.users.updateUserMetadata(membership.userId, {
      privateMetadata: {
        soapAbacus: {
          tier: membership.effectiveTier,
          status: membership.status,
          stripeCustomerId: membership.stripeCustomerId || null,
          stripeSubscriptionId: membership.stripeSubscriptionId || null,
          trialEndsAt: membership.trialEndsAt || null,
        },
      },
    });
  } catch (error) {
    console.warn('Unable to mirror Soap Abacus membership to Clerk metadata.', error);
  }
}

export { FEATURE_KEYS };
