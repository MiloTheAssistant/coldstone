import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../app/lib/src-publication-service.ts', import.meta.url), 'utf8');

test('SRC publication service enforces paid stamping and Pro same-SRC updates', () => {
  assert.match(source, /PLUS_MONTHLY_SRC_LIMIT = 10/);
  assert.match(source, /FEATURE_KEYS\.SRC_STAMPING/);
  assert.match(source, /FEATURE_KEYS\.SRC_REVISION_UPDATE/);
  assert.match(source, /mode === 'same-src'/);
  assert.match(source, /Only Pro members can update an existing SRC/);
  assert.match(source, /existing\.publication\.recipeId !== recipe\.id/);
  assert.match(source, /SRC can only be updated from its original recipe/);
});

test('Plus SRC quota is enforced inside the publication transaction path', () => {
  assert.match(source, /createRecipePublicationWithinMonthlyQuota/);
  assert.doesNotMatch(source, /countMonthlySrcPublicationsForUser\(input\.ownerId\)/);
  assert.match(source, /monthlyQuotaExceeded/);
});

test('SRC publication service retries code generation collisions', () => {
  assert.match(source, /MAX_CODE_ATTEMPTS = 5/);
  assert.match(source, /for \(let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt \+= 1\)/);
  assert.match(source, /isIlcCodeUniqueConstraintError/);
});

test('SRC publication service handles database unique constraint races', () => {
  assert.match(source, /isUniqueConstraintError/);
  assert.match(source, /23505/);
  assert.match(source, /duplicate key/);
  assert.match(source, /This SRC was updated by another request\. Reload the SRC and try again\./);
  assert.match(source, /status: 409/);
});
