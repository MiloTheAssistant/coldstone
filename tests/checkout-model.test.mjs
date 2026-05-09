import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCheckoutLineItems,
  getRequiredStripePriceEnvVars,
  isAutomaticTaxEnabled,
  validateCheckoutCart,
} from '../app/checkout/checkout-model.js';

const catalog = [
  {
    id: 'black-granite',
    name: 'Black Granite',
    stripePriceEnvVar: 'STRIPE_PRICE_BLACK_GRANITE',
    inventoryStatus: 'in-stock',
  },
  {
    id: 'stone-forge',
    name: 'Stone Forge',
    stripePriceEnvVar: 'STRIPE_PRICE_STONE_FORGE',
    inventoryStatus: 'out-of-stock',
  },
];

test('validateCheckoutCart rejects empty carts', () => {
  const result = validateCheckoutCart([], catalog, {});

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test('validateCheckoutCart rejects unknown products', () => {
  const result = validateCheckoutCart([{ productId: 'fake', quantity: 1 }], catalog, {});

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test('validateCheckoutCart rejects out-of-stock products', () => {
  const result = validateCheckoutCart([{ productId: 'stone-forge', quantity: 1 }], catalog, {
    STRIPE_PRICE_STONE_FORGE: 'price_stone',
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 409);
});

test('validateCheckoutCart rejects missing Stripe price configuration', () => {
  const result = validateCheckoutCart([{ productId: 'black-granite', quantity: 1 }], catalog, {});

  assert.equal(result.ok, false);
  assert.equal(result.status, 503);
});

test('buildCheckoutLineItems uses trusted catalog price ids and quantities', () => {
  const result = validateCheckoutCart([{ productId: 'black-granite', quantity: 2, priceCents: 1 }], catalog, {
    STRIPE_PRICE_BLACK_GRANITE: 'price_black',
  });

  assert.equal(result.ok, true);
  assert.deepEqual(buildCheckoutLineItems(result.items), [{ price: 'price_black', quantity: 2 }]);
});

test('getRequiredStripePriceEnvVars lists all catalog price variables', () => {
  assert.deepEqual(getRequiredStripePriceEnvVars(catalog), [
    'STRIPE_PRICE_BLACK_GRANITE',
    'STRIPE_PRICE_STONE_FORGE',
  ]);
});

test('isAutomaticTaxEnabled requires explicit opt-in', () => {
  assert.equal(isAutomaticTaxEnabled({}), false);
  assert.equal(isAutomaticTaxEnabled({ STRIPE_AUTOMATIC_TAX_ENABLED: 'false' }), false);
  assert.equal(isAutomaticTaxEnabled({ STRIPE_AUTOMATIC_TAX_ENABLED: 'true' }), true);
});
