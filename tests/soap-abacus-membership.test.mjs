import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  FEATURE_KEYS,
  SOAP_ABACUS_PRICING,
  buildCheckoutSessionOptions,
  canSaveRecipe,
  getEffectiveMembership,
  getFeatureListForTier,
  hasFeature,
  membershipFromStripeSubscription,
  normalizeBillingInterval,
} from '../app/soap-calculator/studio/membership-model.js';

const calculatorSource = readFileSync(new URL('../app/soap-calculator/page.tsx', import.meta.url), 'utf8');
const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
const webhookSource = readFileSync(new URL('../app/api/webhooks/stripe/route.ts', import.meta.url), 'utf8');

test('Soap Abacus tiers expose the planned feature sets', () => {
  assert.equal(hasFeature({ tier: 'free' }, FEATURE_KEYS.RECIPE_DESIGNER_EASY), true);
  assert.equal(hasFeature({ tier: 'free' }, FEATURE_KEYS.INGREDIENT_COSTS), false);
  assert.equal(hasFeature({ tier: 'plus' }, FEATURE_KEYS.INGREDIENT_COSTS), true);
  assert.equal(hasFeature({ tier: 'plus' }, FEATURE_KEYS.AI_RECIPE_BLENDER), false);
  assert.equal(hasFeature({ tier: 'pro' }, FEATURE_KEYS.AI_RECIPE_BLENDER), true);
  assert.equal(hasFeature({ tier: 'pro' }, FEATURE_KEYS.PDF_EXPORT), true);

  assert.ok(getFeatureListForTier('free').some((feature) => /Recipe Designer/.test(feature)));
  assert.ok(getFeatureListForTier('plus').some((feature) => /ingredient cost/i.test(feature)));
  assert.ok(getFeatureListForTier('pro').some((feature) => /AI Recipe Blender/.test(feature)));
});

test('trial memberships resolve to Pro while active and Free after expiry', () => {
  const active = getEffectiveMembership({
    tier: 'pro',
    status: 'trialing',
    trialEndsAt: '2026-05-14T12:00:00.000Z',
  }, '2026-05-10T12:00:00.000Z');

  const expired = getEffectiveMembership({
    tier: 'pro',
    status: 'trialing',
    trialEndsAt: '2026-05-14T12:00:00.000Z',
  }, '2026-05-15T12:00:00.000Z');

  assert.equal(active.tier, 'pro');
  assert.equal(active.status, 'trialing');
  assert.equal(expired.tier, 'free');
  assert.equal(expired.status, 'expired_trial');
});

test('free recipe cache is limited while Plus and Pro are unlimited', () => {
  assert.equal(canSaveRecipe({ tier: 'free' }, 4).ok, true);
  assert.equal(canSaveRecipe({ tier: 'free' }, 5).ok, false);
  assert.equal(canSaveRecipe({ tier: 'plus' }, 500).ok, true);
  assert.equal(canSaveRecipe({ tier: 'pro' }, 500).ok, true);
});

test('Stripe subscription state maps to Soap Abacus membership state', () => {
  const membership = membershipFromStripeSubscription({
    id: 'sub_123',
    customer: 'cus_123',
    status: 'trialing',
    metadata: { clerk_user_id: 'user_123', soap_abacus_tier: 'pro' },
    trial_end: 1778198400,
    items: { data: [{ price: { id: 'price_pro' } }] },
  }, { proPriceId: 'price_pro', plusPriceId: 'price_plus' });

  assert.equal(membership.userId, 'user_123');
  assert.equal(membership.tier, 'pro');
  assert.equal(membership.status, 'trialing');
  assert.equal(membership.stripeCustomerId, 'cus_123');
  assert.equal(membership.stripeSubscriptionId, 'sub_123');
  assert.equal(membership.trialEndsAt, '2026-05-08T00:00:00.000Z');
});

test('Pro card trial checkout uses Stripe subscription mode and a 7 day trial', () => {
  const options = buildCheckoutSessionOptions({
    tier: 'pro',
    userId: 'user_123',
    customerId: 'cus_123',
    priceId: 'price_pro',
    origin: 'https://www.soapabacus.com',
    trial: 'card',
    billingInterval: 'monthly',
  });

  assert.equal(options.mode, 'subscription');
  assert.equal(options.customer, 'cus_123');
  assert.equal(options.line_items[0].price, 'price_pro');
  assert.equal(options.subscription_data.trial_period_days, 7);
  assert.equal(options.metadata.project, 'soap-abacus');
  assert.equal(options.metadata.soap_abacus_tier, 'pro');
  assert.equal(options.metadata.soap_abacus_billing_interval, 'monthly');
});

test('Soap Abacus annual pricing gives one month free', () => {
  assert.equal(SOAP_ABACUS_PRICING.plus.monthly.amount, 799);
  assert.equal(SOAP_ABACUS_PRICING.plus.annual.amount, 8789);
  assert.equal(SOAP_ABACUS_PRICING.pro.monthly.amount, 1799);
  assert.equal(SOAP_ABACUS_PRICING.pro.annual.amount, 19789);
  assert.equal(normalizeBillingInterval('annual'), 'annual');
  assert.equal(normalizeBillingInterval('unexpected'), 'monthly');
});

test('annual checkout records annual billing interval metadata', () => {
  const options = buildCheckoutSessionOptions({
    tier: 'plus',
    userId: 'user_123',
    customerId: 'cus_123',
    priceId: 'price_plus_annual',
    origin: 'https://www.soapabacus.com/',
    billingInterval: 'annual',
  });

  assert.equal(options.line_items[0].price, 'price_plus_annual');
  assert.equal(options.success_url, 'https://www.soapabacus.com/soap-calculator/account?checkout=success');
  assert.equal(options.metadata.soap_abacus_billing_interval, 'annual');
  assert.equal(options.subscription_data.metadata.soap_abacus_billing_interval, 'annual');
});

test('Soap Abacus UI and environment declare Studio tier concepts', () => {
  assert.match(calculatorSource, /Soap Abacus Studio/);
  assert.match(calculatorSource, /Recipe Designer/);
  assert.match(calculatorSource, /Recipe Blender/);
  assert.match(calculatorSource, /Ingredients DB/);
  assert.match(calculatorSource, /Recipe Cache/);
  assert.match(calculatorSource, /Soap Designer/);
  assert.match(calculatorSource, /Recipe Console/);
  assert.match(calculatorSource, /Recipe Workbench/);
  assert.match(calculatorSource, /Cost Tier/);

  assert.match(envExample, /STRIPE_PRICE_SOAP_ABACUS_PLUS_MONTHLY=/);
  assert.match(envExample, /STRIPE_PRICE_SOAP_ABACUS_PLUS_ANNUAL=/);
  assert.match(envExample, /STRIPE_PRICE_SOAP_ABACUS_PRO_MONTHLY=/);
  assert.match(envExample, /STRIPE_PRICE_SOAP_ABACUS_PRO_ANNUAL=/);
  assert.match(webhookSource, /soap-abacus/);
});

test('signed-out visitors see a read-only Studio preview instead of a hard paywall', () => {
  assert.match(calculatorSource, /isReadOnlyPreview/);
  assert.match(calculatorSource, /Studio Preview/);
  assert.match(calculatorSource, /Create a Free Account to Unlock Soap Abacus/);
  assert.match(calculatorSource, /Log In \/ Sign Up/);
  assert.match(calculatorSource, /ReadOnlyPreviewBanner/);
  assert.match(calculatorSource, /<ReadOnlyPreviewShell/);
  assert.match(calculatorSource, /<PreviewAuthActions \/>/);
  assert.equal((calculatorSource.match(/<PreviewAuthActions \/>/g) || []).length, 1);
  assert.doesNotMatch(calculatorSource, /<SignInButton mode="modal">\s*<button[^>]*>\s*Log In\s*<\/button>\s*<\/SignInButton>\s*<SignUpButton mode="modal">/);
  assert.doesNotMatch(calculatorSource, /Membership Required/);
});
