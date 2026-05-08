import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildRecipeSnapshot,
  buildRecipeVaultPayloadFromSavedRecipe,
  calculateAdvancedLye,
  createRecipeVersion,
  createShareLink,
  getModeProcess,
  validateRecipeAccess,
} from '../app/soap-calculator/studio/recipe-studio-model.js';

const oils = [
  { oilId: 'olive', name: 'Olive Oil', weight: 10, sapNaOH: 0.1353, sapKOH: 190 },
  { oilId: 'coconut-76', name: 'Coconut Oil 76', weight: 5, sapNaOH: 0.1783, sapKOH: 250 },
];

test('calculateAdvancedLye supports all SoapCalc-style water methods', () => {
  const ratio = calculateAdvancedLye(oils, {
    lyeType: 'NaOH',
    superfatPercent: 5,
    waterMethod: 'water-lye-ratio',
    waterValue: 2,
    unit: 'oz',
  });

  const concentration = calculateAdvancedLye(oils, {
    lyeType: 'NaOH',
    superfatPercent: 5,
    waterMethod: 'lye-concentration',
    waterValue: 33,
    unit: 'oz',
  });

  const percentOfOils = calculateAdvancedLye(oils, {
    lyeType: 'NaOH',
    superfatPercent: 5,
    waterMethod: 'water-as-percent-of-oils',
    waterValue: 38,
    unit: 'oz',
  });

  assert.equal(ratio.lyeWeight, 2.13);
  assert.equal(ratio.waterWeight, 4.26);
  assert.equal(concentration.lyeWeight, 2.13);
  assert.equal(concentration.waterWeight, 4.33);
  assert.equal(percentOfOils.lyeWeight, 2.13);
  assert.equal(percentOfOils.waterWeight, 5.7);
});

test('calculateAdvancedLye adjusts KOH for purity', () => {
  const result = calculateAdvancedLye(oils, {
    lyeType: 'KOH',
    kohPurityPercent: 90,
    superfatPercent: 5,
    waterMethod: 'water-lye-ratio',
    waterValue: 2,
    unit: 'oz',
  });

  assert.equal(result.lyeWeight, 3.33);
  assert.equal(result.pureLyeWeight, 2.99);
  assert.equal(result.kohPurityPercent, 90);
});

test('getModeProcess exposes different guidance density per calculator mode', () => {
  assert.deepEqual(
    getModeProcess('easy').map((step) => step.id),
    ['goal', 'batch', 'oils', 'water', 'scent-additives', 'costing', 'review']
  );
  assert.ok(getModeProcess('intermediate').some((step) => step.id === 'pricing'));
  assert.ok(getModeProcess('expert').some((step) => step.id === 'expert-controls'));
});

test('buildRecipeSnapshot keeps full recipe data private by default', () => {
  const snapshot = buildRecipeSnapshot({
    id: 'recipe_1',
    ownerId: 'user_1',
    name: 'Cedar Shop Bar',
    description: 'A hard working bar for repeat batches.',
    mode: 'intermediate',
    oils: [{ oilId: 'olive', percent: 60, weight: 19.2 }],
    fragrances: [{ fragranceId: 'cedarwood-atlas', usagePercent: 2.5, cost: 1.2 }],
    additives: [{ additiveId: 'activated-charcoal', amount: '1 tsp PPO', cost: 0.4 }],
    costs: [{ ingredientId: 'olive', supplier: 'Bulk Oils', pricePerUnit: 28, unitSize: 1, unit: 'gal' }],
    pricing: { barsPerBatch: 10, targetMarginPercent: 65, retailPricePerBar: 9 },
    notes: 'Cut after 24 hours.',
  });

  assert.equal(snapshot.visibility, 'private');
  assert.equal(snapshot.version, 1);
  assert.equal(snapshot.fragrances.length, 1);
  assert.equal(snapshot.additives.length, 1);
  assert.equal(snapshot.costs.length, 1);
  assert.equal(snapshot.pricing.retailPricePerBar, 9);
});

test('buildRecipeVaultPayloadFromSavedRecipe promotes local recipes into vault-ready snapshots', () => {
  const payload = buildRecipeVaultPayloadFromSavedRecipe({
    id: 'local_1',
    name: 'Local Garden Bar',
    totalOilWeight: 32,
    unit: 'oz',
    lyeType: 'NaOH',
    superfat: 5,
    waterRatio: 2,
    waterMethod: 'water-lye-ratio',
    waterValue: 2,
    notes: 'Saved before sign-in.',
    mode: 'easy',
    oils: [
      { oilId: 'olive', percent: 60 },
      { oilId: 'coconut-76', percent: 40 },
    ],
  }, {
    oilCatalog: [
      { id: 'olive', name: 'Olive Oil' },
      { id: 'coconut-76', name: 'Coconut Oil 76' },
    ],
  });

  assert.equal(payload.id, 'local_1');
  assert.equal(payload.name, 'Local Garden Bar');
  assert.equal(payload.mode, 'easy');
  assert.equal(payload.visibility, 'private');
  assert.equal(payload.oils[0].name, 'Olive Oil');
  assert.equal(payload.oils[0].weight, 19.2);
  assert.equal(payload.liquids[0].method, 'water-lye-ratio');
  assert.equal(payload.liquids[0].value, 2);
  assert.equal(payload.notes, 'Saved before sign-in.');
});

test('createShareLink makes an explicit read-only public recipe URL', () => {
  const recipe = buildRecipeSnapshot({ id: 'recipe_1', ownerId: 'user_1', name: 'Cedar Shop Bar' });
  const share = createShareLink(recipe, {
    baseUrl: 'https://coldstonesoap.com',
    token: 'share_cedar',
    now: '2026-05-03T12:00:00.000Z',
  });

  assert.equal(share.permission, 'read');
  assert.equal(share.url, 'https://coldstonesoap.com/recipes/share_cedar');
  assert.equal(share.recipeId, 'recipe_1');
});

test('createShareLink defaults public recipe URLs to Soap Abacus', () => {
  const recipe = buildRecipeSnapshot({ id: 'recipe_1', ownerId: 'user_1', name: 'Default Share Host' });
  const share = createShareLink(recipe, { token: 'share_default' });

  assert.equal(share.url, 'https://www.soapabacus.com/recipes/share_default');
});

test('validateRecipeAccess keeps recipes private unless owner or valid share token is present', () => {
  const recipe = buildRecipeSnapshot({ id: 'recipe_1', ownerId: 'user_1', name: 'Private Bar' });
  const share = createShareLink(recipe, { token: 'share_private' });

  assert.equal(validateRecipeAccess(recipe, { userId: 'user_1' }).ok, true);
  assert.equal(validateRecipeAccess(recipe, { userId: 'user_2' }).ok, false);
  assert.equal(validateRecipeAccess(recipe, { shareToken: share.token, shareLinks: [share] }).ok, true);
});

test('createRecipeVersion snapshots edits without mutating the original recipe', () => {
  const recipe = buildRecipeSnapshot({ id: 'recipe_1', ownerId: 'user_1', name: 'Original' });
  const next = createRecipeVersion(recipe, { name: 'Adjusted', notes: 'Raised superfat.' }, 'user_1');

  assert.equal(recipe.name, 'Original');
  assert.equal(next.name, 'Adjusted');
  assert.equal(next.version, 2);
  assert.equal(next.previousVersionId, recipe.versionId);
});
