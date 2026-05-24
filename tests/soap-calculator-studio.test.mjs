import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  FEATURE_KEYS,
  hasFeature,
} from '../app/soap-calculator/studio/membership-model.js';

import {
  buildIngredientListSnapshot,
  buildPublicationRevision,
  buildRecipeSnapshot,
  buildRecipeVaultPayloadFromSavedRecipe,
  calculateAdvancedLye,
  createIlcCode,
  createRecipeVersion,
  createShareLink,
  createSrcCode,
  getModeProcess,
  isValidIlcCode,
  isValidSrcCode,
  normalizeSrcCode,
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

test('membership features gate SRC stamping by tier', () => {
  assert.equal(hasFeature({ tier: 'free', effectiveTier: 'free' }, FEATURE_KEYS.SRC_STAMPING), false);
  assert.equal(hasFeature({ tier: 'plus', effectiveTier: 'plus' }, FEATURE_KEYS.SRC_STAMPING), true);
  assert.equal(hasFeature({ tier: 'pro', effectiveTier: 'pro' }, FEATURE_KEYS.SRC_STAMPING), true);

  assert.equal(hasFeature({ tier: 'free', effectiveTier: 'free' }, FEATURE_KEYS.SRC_REVISION_UPDATE), false);
  assert.equal(hasFeature({ tier: 'plus', effectiveTier: 'plus' }, FEATURE_KEYS.SRC_REVISION_UPDATE), false);
  assert.equal(hasFeature({ tier: 'pro', effectiveTier: 'pro' }, FEATURE_KEYS.SRC_REVISION_UPDATE), true);
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

test('createSrcCode and createIlcCode produce public code formats', () => {
  const srcCode = createSrcCode([0, 1, 61, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);
  const ilcCode = createIlcCode([0, 1, 61, 10, 11, 12, 13, 14, 15, 16, 17, 18]);

  assert.equal(srcCode, 'AB9K-LMNO-PQRS-TUVW-XYZa');
  assert.equal(ilcCode, 'ILC-AB9-KLM-NOP-QRS');
  assert.equal(isValidSrcCode(srcCode), true);
  assert.equal(isValidIlcCode(ilcCode), true);
  assert.equal(normalizeSrcCode('ab9k lmno pqrs tuvw xyza'), 'ab9k-lmno-pqrs-tuvw-xyza');
});

test('normalizeSrcCode preserves case and leaves malformed extra-long input invalid', () => {
  assert.equal(normalizeSrcCode('aB9k lmNo pQrS tUvW xYZa'), 'aB9k-lmNo-pQrS-tUvW-xYZa');

  const extraLong = normalizeSrcCode('aB9k lmNo pQrS tUvW xYZa EXTRA');
  assert.equal(isValidSrcCode(extraLong), false);
});

test('buildIngredientListSnapshot freezes purchase-oriented ingredients', () => {
  const recipe = buildRecipeSnapshot({
    id: 'recipe_1',
    ownerId: 'user_1',
    name: 'Production Bar',
    oils: [
      { oilId: 'olive', name: 'Olive Oil', percent: 35, weight: 11.2, unit: 'oz' },
      { oilId: 'coconut-76', name: 'Coconut Oil 76', percent: 25, weight: 8, unit: 'oz' },
    ],
    liquids: [{ liquidId: 'water', name: 'Water', weight: 9, unit: 'oz' }],
    fragrances: [{ fragranceId: 'lavender', name: 'Lavender EO', weight: 1, unit: 'oz' }],
  });

  const snapshot = buildIngredientListSnapshot(recipe);
  assert.equal(snapshot.length, 4);
  assert.deepEqual(snapshot[0], {
    ingredientType: 'oil',
    ingredientId: 'olive',
    displayName: 'Olive Oil',
    percent: 35,
    weight: 11.2,
    unit: 'oz',
    metadata: { oilId: 'olive', name: 'Olive Oil', percent: 35, weight: 11.2, unit: 'oz' },
  });
});

test('buildPublicationRevision creates immutable SRC revision records', () => {
  const recipe = buildRecipeSnapshot({
    id: 'recipe_1',
    versionId: 'version_1',
    ownerId: 'user_1',
    name: 'Production Bar',
    oils: [{ oilId: 'olive', name: 'Olive Oil', percent: 35, weight: 11.2, unit: 'oz' }],
  });

  const revision = buildPublicationRevision({
    publicationId: 'pub_1',
    revisionId: 'pubrev_1',
    srcCode: 'AB9K-LMNO-PQRS-TUVW-XYZa',
    ilcCode: 'ILC-AB9-KLM-NOP-QRS',
    recipe,
    ownerId: 'user_1',
    revisionNumber: 1,
    revisionNotes: 'Initial production stamp.',
    now: '2026-05-23T12:00:00.000Z',
  });

  assert.equal(revision.srcCode, 'AB9K-LMNO-PQRS-TUVW-XYZa');
  assert.equal(revision.ilcCode, 'ILC-AB9-KLM-NOP-QRS');
  assert.equal(revision.revisionNumber, 1);
  assert.equal(revision.releaseNotesPublic, 'Initial production stamp.');
  assert.equal(revision.recipeSnapshot.versionId, 'version_1');
  assert.equal(revision.ingredientListSnapshot.length, 1);
});

test('studio schema defines SRC publication tables and unique codes', () => {
  const schema = readFileSync(new URL('../app/soap-calculator/studio/schema.sql', import.meta.url), 'utf8');
  assert.match(schema, /create table if not exists recipe_publications/);
  assert.match(schema, /src_code text not null unique/);
  assert.match(schema, /create table if not exists recipe_publication_revisions/);
  assert.match(schema, /unique \(publication_id, revision_number\)/);
  assert.match(schema, /unique \(id, publication_id\)/);
  assert.match(schema, /\(current_revision_id, id\) references recipe_publication_revisions\(id, publication_id\)/);
  assert.match(schema, /deferrable initially deferred/);
  assert.match(schema, /create table if not exists ingredient_list_codes/);
  assert.match(schema, /ilc_code text not null unique/);
  assert.match(schema, /ingredient_list_codes_revision_publication_fk[\s\S]*\(revision_id, publication_id\) references recipe_publication_revisions\(id, publication_id\)/);
  assert.match(schema, /partner_export_events_revision_publication_fk[\s\S]*\(revision_id, publication_id\) references recipe_publication_revisions\(id, publication_id\)/);
});

test('buildPublicationRevision deep-copies nested ingredient metadata', () => {
  const recipe = buildRecipeSnapshot({
    id: 'recipe_1',
    versionId: 'version_1',
    ownerId: 'user_1',
    name: 'Nested Vendor Bar',
    oils: [{
      oilId: 'olive',
      name: 'Olive Oil',
      percent: 35,
      weight: 11.2,
      unit: 'oz',
      vendor: { name: 'Original Supplier', affiliate: { code: 'SUP-1' } },
    }],
  });

  const revision = buildPublicationRevision({
    publicationId: 'pub_1',
    revisionId: 'pubrev_1',
    srcCode: 'AB9K-LMNO-PQRS-TUVW-XYZa',
    ilcCode: 'ILC-AB9-KLM-NOP-QRS',
    recipe,
    ownerId: 'user_1',
    revisionNumber: 1,
  });

  recipe.oils[0].vendor.name = 'Changed Supplier';
  recipe.oils[0].vendor.affiliate.code = 'CHANGED';

  assert.deepEqual(revision.ingredientListSnapshot[0].metadata.vendor, {
    name: 'Original Supplier',
    affiliate: { code: 'SUP-1' },
  });
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
