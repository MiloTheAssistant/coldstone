import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import test from 'node:test';

import { blogPosts } from '../app/data/blog-content.js';
import { products } from '../app/data/products.ts';

test('public-facing blog imagery uses the soap-bar visual direction', () => {
  for (const post of blogPosts) {
    assert.notEqual(post.heroImage, '/black-granite.jpg', `${post.slug} still uses the rejected black logo graphic`);
    assert.equal(post.heroImage, '/stone-forge.jpg');
  }
});

test('product catalog does not use the rejected black logo graphic', async () => {
  const productSource = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../app/data/products.ts', import.meta.url), 'utf8'),
  );

  assert.equal(productSource.includes("image: '/black-granite.jpg'"), false);
});

test('Black Granite has a distinct charcoal granite soap image', () => {
  const blackGranite = products.find((product) => product.slug === 'black-granite');
  const stoneForge = products.find((product) => product.slug === 'stone-forge');

  assert.ok(blackGranite, 'Black Granite product is missing');
  assert.ok(stoneForge, 'Stone Forge product is missing');
  assert.notEqual(blackGranite.image, stoneForge.image);
  assert.equal(blackGranite.image, '/black-granite-soap.jpg');

  const imagePath = new URL(`../public${blackGranite.image}`, import.meta.url);
  assert.equal(existsSync(imagePath), true, 'Black Granite soap image is missing');
  assert.ok(statSync(imagePath).size > 40_000, 'Black Granite soap image is too small');
});

test('product catalog exposes campaign imagery for website integration', () => {
  for (const product of products) {
    assert.match(product.campaignImage, /^\/brand\/campaign\/.+-post\.png$/);
    assert.match(product.storyImage, /^\/brand\/campaign\/.+-story\.png$/);

    for (const image of [product.campaignImage, product.storyImage]) {
      const imagePath = new URL(`../public${image}`, import.meta.url);
      assert.equal(existsSync(imagePath), true, `${image} is missing`);
      assert.ok(statSync(imagePath).size > 40_000, `${image} is too small`);
    }
  }
});
