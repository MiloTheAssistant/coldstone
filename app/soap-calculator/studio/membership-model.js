const TRIAL_DAYS = 7;
const FREE_RECIPE_LIMIT = 5;
const BILLING_INTERVALS = {
  monthly: 'monthly',
  annual: 'annual',
};

const SOAP_ABACUS_PRICING = {
  plus: {
    monthly: { amount: 799, label: '$7.99/mo' },
    annual: { amount: 8789, label: '$87.89/yr', savings: '1 month free' },
  },
  pro: {
    monthly: { amount: 1799, label: '$17.99/mo' },
    annual: { amount: 19789, label: '$197.89/yr', savings: '1 month free' },
  },
};

const TIERS = {
  free: 'free',
  plus: 'plus',
  pro: 'pro',
};

const FEATURE_KEYS = {
  RECIPE_DESIGNER_EASY: 'recipe-designer:easy',
  RECIPE_DESIGNER_INTERMEDIATE: 'recipe-designer:intermediate',
  RECIPE_DESIGNER_EXPERT: 'recipe-designer:expert',
  NAOH_BASIC: 'lye:naoh-basic',
  WATER_METHODS_FULL: 'water:full-methods',
  ADVANCED_LYE: 'lye:advanced',
  INGREDIENTS_DB_READ: 'ingredients-db:read',
  INGREDIENT_COSTS: 'ingredients-db:costs',
  RECIPE_CACHE: 'recipe-cache:basic',
  UNLIMITED_RECIPE_CACHE: 'recipe-cache:unlimited',
  SHARE_LINKS: 'recipe-cache:share-links',
  JSON_IMPORT_EXPORT: 'recipe-cache:json-import-export',
  PDF_EXPORT: 'recipe-cache:pdf-export',
  VERSION_HISTORY: 'recipe-cache:version-history',
  SRC_STAMPING: 'recipe-cache:src-stamping',
  SRC_REVISION_UPDATE: 'recipe-cache:src-revision-update',
  BASIC_PRINT: 'export:basic-print',
  AI_RECIPE_BLENDER: 'recipe-blender:ai',
  TEMPLATE_RECIPE_BLENDER: 'recipe-blender:templates',
  ADVANCED_PRICING: 'costing:advanced-pricing',
};

const TIER_FEATURES = {
  free: [
    FEATURE_KEYS.RECIPE_DESIGNER_EASY,
    FEATURE_KEYS.NAOH_BASIC,
    FEATURE_KEYS.INGREDIENTS_DB_READ,
    FEATURE_KEYS.RECIPE_CACHE,
    FEATURE_KEYS.BASIC_PRINT,
    FEATURE_KEYS.TEMPLATE_RECIPE_BLENDER,
  ],
  plus: [
    FEATURE_KEYS.RECIPE_DESIGNER_EASY,
    FEATURE_KEYS.RECIPE_DESIGNER_INTERMEDIATE,
    FEATURE_KEYS.NAOH_BASIC,
    FEATURE_KEYS.WATER_METHODS_FULL,
    FEATURE_KEYS.INGREDIENTS_DB_READ,
    FEATURE_KEYS.INGREDIENT_COSTS,
    FEATURE_KEYS.RECIPE_CACHE,
    FEATURE_KEYS.UNLIMITED_RECIPE_CACHE,
    FEATURE_KEYS.SHARE_LINKS,
    FEATURE_KEYS.JSON_IMPORT_EXPORT,
    FEATURE_KEYS.SRC_STAMPING,
    FEATURE_KEYS.BASIC_PRINT,
    FEATURE_KEYS.TEMPLATE_RECIPE_BLENDER,
  ],
  pro: [
    FEATURE_KEYS.RECIPE_DESIGNER_EASY,
    FEATURE_KEYS.RECIPE_DESIGNER_INTERMEDIATE,
    FEATURE_KEYS.RECIPE_DESIGNER_EXPERT,
    FEATURE_KEYS.NAOH_BASIC,
    FEATURE_KEYS.WATER_METHODS_FULL,
    FEATURE_KEYS.ADVANCED_LYE,
    FEATURE_KEYS.INGREDIENTS_DB_READ,
    FEATURE_KEYS.INGREDIENT_COSTS,
    FEATURE_KEYS.RECIPE_CACHE,
    FEATURE_KEYS.UNLIMITED_RECIPE_CACHE,
    FEATURE_KEYS.SHARE_LINKS,
    FEATURE_KEYS.JSON_IMPORT_EXPORT,
    FEATURE_KEYS.PDF_EXPORT,
    FEATURE_KEYS.VERSION_HISTORY,
    FEATURE_KEYS.SRC_STAMPING,
    FEATURE_KEYS.SRC_REVISION_UPDATE,
    FEATURE_KEYS.BASIC_PRINT,
    FEATURE_KEYS.AI_RECIPE_BLENDER,
    FEATURE_KEYS.TEMPLATE_RECIPE_BLENDER,
    FEATURE_KEYS.ADVANCED_PRICING,
  ],
};

const TIER_FEATURE_LABELS = {
  free: [
    'Recipe Designer Easy mode',
    'NaOH bar soap basics',
    'Read-only Ingredients DB with SAP values, fatty acids, and Cost Tier',
    'Recipe Workbench guided process',
    `Recipe Cache up to ${FREE_RECIPE_LIMIT} recipes`,
    'Basic print',
  ],
  plus: [
    'Everything in Free',
    'Intermediate Recipe Designer controls',
    'Full water methods',
    'Paid ingredient cost entry and supplier fields',
    'Batch COGS and cost per bar',
    'Unlimited Recipe Cache',
    'Share links',
    'JSON import/export',
    'Stamp Soap Recipe Codes',
  ],
  pro: [
    'Everything in Plus',
    'Expert Recipe Designer controls',
    'AI Recipe Blender',
    'PDF export',
    'Recipe version history',
    'Update existing SRC releases with revision notes',
    'Advanced pricing and margin tools',
    'Advanced lye controls',
    'Full cost propagation across the Abacus',
  ],
};

function normalizeTier(tier) {
  return tier === TIERS.plus || tier === TIERS.pro ? tier : TIERS.free;
}

function normalizeBillingInterval(interval) {
  return interval === BILLING_INTERVALS.annual ? BILLING_INTERVALS.annual : BILLING_INTERVALS.monthly;
}

function normalizeStatus(status, tier) {
  if (tier === TIERS.free) return status === 'expired_trial' ? 'expired_trial' : 'free';
  if (['active', 'trialing', 'past_due', 'canceled', 'incomplete'].includes(status)) return status;
  return 'active';
}

function toIso(secondsOrDate) {
  if (!secondsOrDate) return null;
  if (typeof secondsOrDate === 'number') return new Date(secondsOrDate * 1000).toISOString();
  const date = new Date(secondsOrDate);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getEffectiveMembership(raw = {}, now = new Date()) {
  const nowMs = new Date(now).getTime();
  const originalTier = normalizeTier(raw.tier);
  const status = normalizeStatus(raw.status, originalTier);
  const trialEndsAt = toIso(raw.trialEndsAt || raw.trial_ends_at);
  const trialExpired = status === 'trialing' && trialEndsAt && new Date(trialEndsAt).getTime() <= nowMs;
  const paidInactive = originalTier !== TIERS.free && ['canceled', 'incomplete'].includes(status);

  if (trialExpired) {
    return {
      ...raw,
      tier: TIERS.free,
      status: 'expired_trial',
      effectiveTier: TIERS.free,
      trialEndsAt,
      isPaid: false,
    };
  }

  if (paidInactive) {
    return {
      ...raw,
      tier: TIERS.free,
      status,
      effectiveTier: TIERS.free,
      trialEndsAt,
      isPaid: false,
    };
  }

  return {
    ...raw,
    tier: originalTier,
    status,
    effectiveTier: originalTier,
    trialEndsAt,
    isPaid: originalTier !== TIERS.free,
  };
}

function hasFeature(membership = {}, featureKey) {
  const tier = normalizeTier(membership.effectiveTier || membership.tier);
  return TIER_FEATURES[tier].includes(featureKey);
}

function getFeatureListForTier(tier) {
  return TIER_FEATURE_LABELS[normalizeTier(tier)];
}

function getRecipeLimit(membership = {}) {
  return hasFeature(membership, FEATURE_KEYS.UNLIMITED_RECIPE_CACHE) ? Number.POSITIVE_INFINITY : FREE_RECIPE_LIMIT;
}

function canSaveRecipe(membership = {}, currentRecipeCount = 0) {
  const limit = getRecipeLimit(membership);
  if (currentRecipeCount < limit) return { ok: true, limit };
  return {
    ok: false,
    limit,
    reason: `Free accounts can save up to ${FREE_RECIPE_LIMIT} recipes. Upgrade to Plus for unlimited Recipe Cache.`,
  };
}

function buildCheckoutSessionOptions({ tier, userId, customerId, priceId, origin, trial, billingInterval }) {
  const normalizedTier = normalizeTier(tier);
  const normalizedInterval = normalizeBillingInterval(billingInterval);
  if (normalizedTier === TIERS.free) {
    throw new Error('Free does not require Stripe Checkout.');
  }
  if (!priceId) {
    throw new Error(`Missing Stripe price id for Soap Abacus ${normalizedTier}.`);
  }

  const baseUrl = (origin || 'https://www.soapabacus.com').replace(/\/$/, '');
  const options = {
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/soap-calculator/account?checkout=success`,
    cancel_url: `${baseUrl}/soap-calculator/account?checkout=cancel`,
    client_reference_id: userId,
    metadata: {
      project: 'soap-abacus',
      clerk_user_id: userId,
      soap_abacus_tier: normalizedTier,
      soap_abacus_billing_interval: normalizedInterval,
    },
    subscription_data: {
      metadata: {
        project: 'soap-abacus',
        clerk_user_id: userId,
        soap_abacus_tier: normalizedTier,
        soap_abacus_billing_interval: normalizedInterval,
      },
    },
  };

  if (trial === 'card' && normalizedTier === TIERS.pro) {
    options.subscription_data.trial_period_days = TRIAL_DAYS;
  }

  return options;
}

function membershipFromStripeSubscription(subscription, priceConfig = {}) {
  const firstItem = subscription?.items?.data?.[0];
  const priceId = firstItem?.price?.id || subscription?.plan?.id || null;
  const metadataTier = subscription?.metadata?.soap_abacus_tier;
  let tier = normalizeTier(metadataTier);
  const proPriceIds = [
    priceConfig.proPriceId,
    priceConfig.proMonthlyPriceId,
    priceConfig.proAnnualPriceId,
    ...(priceConfig.proPriceIds || []),
  ].filter(Boolean);
  const plusPriceIds = [
    priceConfig.plusPriceId,
    priceConfig.plusMonthlyPriceId,
    priceConfig.plusAnnualPriceId,
    ...(priceConfig.plusPriceIds || []),
  ].filter(Boolean);

  if (tier === TIERS.free && priceId) {
    if (proPriceIds.includes(priceId)) tier = TIERS.pro;
    if (plusPriceIds.includes(priceId)) tier = TIERS.plus;
  }

  const status = subscription?.status === 'trialing'
    ? 'trialing'
    : subscription?.status === 'active'
      ? 'active'
      : subscription?.status === 'past_due'
        ? 'past_due'
        : subscription?.status === 'canceled'
          ? 'canceled'
          : 'incomplete';

  return {
    userId: subscription?.metadata?.clerk_user_id || subscription?.metadata?.user_id || null,
    tier,
    status,
    stripeCustomerId: typeof subscription?.customer === 'string' ? subscription.customer : subscription?.customer?.id || null,
    stripeSubscriptionId: subscription?.id || null,
    stripePriceId: priceId,
    trialEndsAt: toIso(subscription?.trial_end),
    currentPeriodEndsAt: toIso(subscription?.current_period_end),
    source: 'stripe',
  };
}

function createNoCardTrialMembership(userId, now = new Date()) {
  const start = new Date(now);
  const end = new Date(start.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  return {
    userId,
    tier: TIERS.pro,
    status: 'trialing',
    trialType: 'no-card',
    trialStartedAt: start.toISOString(),
    trialEndsAt: end.toISOString(),
    trialUsedAt: start.toISOString(),
    source: 'clerk-trial',
  };
}

module.exports = {
  FEATURE_KEYS,
  BILLING_INTERVALS,
  FREE_RECIPE_LIMIT,
  SOAP_ABACUS_PRICING,
  TIERS,
  TRIAL_DAYS,
  buildCheckoutSessionOptions,
  canSaveRecipe,
  createNoCardTrialMembership,
  getEffectiveMembership,
  getFeatureListForTier,
  getRecipeLimit,
  hasFeature,
  membershipFromStripeSubscription,
  normalizeBillingInterval,
  normalizeTier,
};
