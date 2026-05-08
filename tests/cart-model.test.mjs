import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addCartItem,
  clearCart,
  getCartSummary,
  removeCartItem,
  updateCartQuantity,
} from '../app/cart/cart-model.js';

const blackGranite = {
  id: 'black-granite',
  name: 'Black Granite',
  slug: 'black-granite',
  priceCents: 1200,
  image: '/black-granite.jpg',
};

const stoneForge = {
  id: 'stone-forge',
  name: 'Stone Forge',
  slug: 'stone-forge',
  priceCents: 1400,
  image: '/stone-forge.jpg',
};

test('addCartItem adds a new product and merges duplicate quantities', () => {
  const first = addCartItem([], blackGranite, 1);
  const second = addCartItem(first, blackGranite, 2);

  assert.equal(second.length, 1);
  assert.equal(second[0].quantity, 3);
  assert.equal(second[0].productId, 'black-granite');
});

test('updateCartQuantity clamps low quantities and removes zero quantity items', () => {
  const cart = addCartItem([], blackGranite, 2);
  const updated = updateCartQuantity(cart, 'black-granite', 0);

  assert.deepEqual(updated, []);
});

test('removeCartItem removes only the selected product', () => {
  const cart = addCartItem(addCartItem([], blackGranite, 1), stoneForge, 1);
  const updated = removeCartItem(cart, 'black-granite');

  assert.equal(updated.length, 1);
  assert.equal(updated[0].productId, 'stone-forge');
});

test('getCartSummary totals item count and subtotal', () => {
  const cart = addCartItem(addCartItem([], blackGranite, 2), stoneForge, 1);
  const summary = getCartSummary(cart);

  assert.equal(summary.itemCount, 3);
  assert.equal(summary.subtotalCents, 3800);
});

test('clearCart returns an empty cart', () => {
  const cart = addCartItem([], blackGranite, 1);

  assert.deepEqual(clearCart(cart), []);
});
