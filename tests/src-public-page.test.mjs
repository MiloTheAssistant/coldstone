import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const pagePath = new URL('../app/src/[srcCode]/page.tsx', import.meta.url);

test('public SRC release page renders release identity and excludes private pricing fields', () => {
  assert.equal(existsSync(pagePath), true, `${pagePath.pathname} should exist`);

  const source = readFileSync(pagePath, 'utf8');

  assert.match(source, /Soap Recipe Code/);
  assert.match(source, /Ingredient List Code/);
  assert.match(source, /Clone to My Recipes/);
  assert.match(source, /srcCode=/);
  assert.match(source, /Release Notes/);
  assert.match(source, /revision\.releaseNotesPublic/);
  assert.match(source, /isRecord/);
  assert.match(source, /typeof value === 'object'/);
  assert.match(source, /\.filter\(isRecord\)/);
  assert.doesNotMatch(source, /recipeSnapshot/);
  assert.doesNotMatch(source, /recipe\.description/);
  assert.doesNotMatch(source, /recipe\.notes/);
  assert.doesNotMatch(source, /ownerId/);
  assert.doesNotMatch(source, /revisionNotes/);
  assert.doesNotMatch(source, /metadata/);
  assert.doesNotMatch(source, /pricing/);
  assert.doesNotMatch(source, /costs/);
  assert.doesNotMatch(source, /pricePerUnit/);
  assert.doesNotMatch(source, /retailPricePerBar/);
});
