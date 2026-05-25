import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const stampRoutePath = new URL('../app/api/recipes/[id]/src/route.ts', import.meta.url);
const publicRoutePath = new URL('../app/api/src/[srcCode]/route.ts', import.meta.url);
const qrRoutePath = new URL('../app/api/src/[srcCode]/qr/route.ts', import.meta.url);
const publicationServicePath = new URL('../app/lib/src-publication-service.ts', import.meta.url);
const recipeVaultPath = new URL('../app/lib/recipe-vault.ts', import.meta.url);

function readRouteSource(routePath) {
  assert.equal(existsSync(routePath), true, `${routePath.pathname} should exist`);
  return readFileSync(routePath, 'utf8');
}

function publicDtoSource(source) {
  const start = source.indexOf('export function decoratePublicRelease');
  const end = source.indexOf('async function stampSameSrcRevision');
  assert.notEqual(start, -1, 'decoratePublicRelease should exist');
  assert.notEqual(end, -1, 'stampSameSrcRevision should remain after public DTO helpers');
  return source.slice(start, end);
}

test('all SRC API routes run on the Node.js runtime', () => {
  const routeSources = [
    readRouteSource(stampRoutePath),
    readRouteSource(publicRoutePath),
    readRouteSource(qrRoutePath),
  ];

  for (const source of routeSources) {
    assert.match(source, /export const runtime = 'nodejs'/);
  }
});

test('recipe SRC stamp route authenticates membership and stamps the requested mode', () => {
  const source = readRouteSource(stampRoutePath);

  assert.match(source, /getVaultSetup/);
  assert.match(source, /isClerkConfigured/);
  assert.match(source, /isRecipeVaultConfigured/);
  assert.match(source, /getCurrentUserId/);
  assert.match(source, /getCurrentSoapAbacusMembership/);
  assert.match(source, /stampRecipeSrc/);
  assert.match(source, /const setup = await getVaultSetup\(\)/);
  assert.match(source, /if \(!setup\.ok\) return setup\.response/);
  assert.match(source, /const membershipSetup = await getCurrentSoapAbacusMembership\(\)/);
  assert.match(source, /if \(!membershipSetup\.ok\) return membershipSetup\.response/);
  assert.match(source, /mode: body\.mode === 'same-src' \? 'same-src' : 'new-src'/);
});

test('recipe SRC stamp route treats request JSON as optional and returns stamp results', () => {
  const source = readRouteSource(stampRoutePath);

  assert.match(source, /let body: Record<string, unknown> = \{\}/);
  assert.match(source, /try \{/);
  assert.match(source, /await request\.json\(\)/);
  assert.match(source, /catch \{/);
  assert.match(source, /body = \{\}/);
  assert.match(source, /if \(!result\.ok\) return result\.response/);
  assert.match(source, /return NextResponse\.json\(\{ release: result\.release \}\)/);
});

test('public SRC lookup route loads and decorates active releases', () => {
  const source = readRouteSource(publicRoutePath);

  assert.match(source, /isRecipeVaultConfigured/);
  assert.match(source, /normalizeSrcCode/);
  assert.match(source, /isValidSrcCode/);
  assert.match(source, /getRecipePublicationBySrcCode/);
  assert.match(source, /decoratePublicRelease/);
  assert.match(source, /const normalized = normalizeSrcCode\(srcCode\)/);
  assert.match(source, /if \(!isValidSrcCode\(normalized\)\) \{/);
  assert.match(source, /release = await getRecipePublicationBySrcCode\(normalized\)/);
  assert.match(source, /release\.publication\.status === 'revoked'/);
  assert.match(source, /return NextResponse\.json\(\{ release: decoratePublicRelease\(release, request\.nextUrl\.origin\) \}\)/);
  assert.doesNotMatch(source, /decorateRelease\(release, request\.nextUrl\.origin\)/);
});

test('public SRC routes return controlled responses when publication tables are missing', () => {
  const publicSource = readRouteSource(publicRoutePath);
  const qrSource = readRouteSource(qrRoutePath);
  const vaultSource = readRouteSource(recipeVaultPath);

  assert.match(vaultSource, /export function isMissingRecipePublicationSchemaError/);
  assert.match(vaultSource, /candidate\.code !== '42P01'/);
  assert.match(vaultSource, /recipe_publications/);
  assert.match(publicSource, /isMissingRecipePublicationSchemaError/);
  assert.match(publicSource, /SRC publication database schema is not ready\./);
  assert.match(publicSource, /status: 503/);
  assert.match(qrSource, /isMissingRecipePublicationSchemaError/);
  assert.match(qrSource, /SRC publication database schema is not ready\./);
  assert.match(qrSource, /status: 503/);
});

test('public SRC response decoration uses an explicit safe DTO shape', () => {
  const source = readRouteSource(publicationServicePath);
  const dtoSource = publicDtoSource(source);

  assert.match(source, /export function decoratePublicRelease/);
  assert.match(dtoSource, /recipe: decoratePublicRecipe\(release\.revision\.recipeSnapshot\)/);
  assert.match(dtoSource, /function decoratePublicRecipe\(recipe: RecipeSnapshot\)/);
  assert.match(dtoSource, /name: recipe\.name/);
  assert.match(dtoSource, /slug: recipe\.slug/);
  assert.match(dtoSource, /mode: recipe\.mode/);
  assert.match(dtoSource, /oils: decoratePublicEntries\(recipe\.oils\)/);
  assert.match(dtoSource, /liquids: decoratePublicEntries\(recipe\.liquids\)/);
  assert.match(dtoSource, /fragrances: decoratePublicEntries\(recipe\.fragrances\)/);
  assert.match(dtoSource, /additives: decoratePublicEntries\(recipe\.additives\)/);
  assert.doesNotMatch(dtoSource, /processSteps/);
  assert.doesNotMatch(dtoSource, /recipe\.processSteps/);
  assert.doesNotMatch(dtoSource, /ownerId/);
  assert.doesNotMatch(dtoSource, /costs/);
  assert.doesNotMatch(dtoSource, /pricing/);
  assert.doesNotMatch(dtoSource, /notes/);
  assert.doesNotMatch(dtoSource, /revisionNotes/);
});

test('public SRC lookup route returns a not found response for malformed, missing, or revoked codes', () => {
  const source = readRouteSource(publicRoutePath);
  const notFoundResponses = source.match(/NextResponse\.json\(\{ error: 'SRC not found\.' \}, \{ status: 404 \}\)/g) || [];

  assert.match(source, /if \(!isValidSrcCode\(normalized\)\) \{/);
  assert.match(source, /if \(!release \|\| release\.publication\.status === 'revoked'\) \{/);
  assert.equal(notFoundResponses.length, 2);
});

test('SRC QR route renders SVG QR codes', () => {
  const source = readRouteSource(qrRoutePath);

  assert.match(source, /import QRCode from 'qrcode'/);
  assert.match(source, /isRecipeVaultConfigured/);
  assert.match(source, /normalizeSrcCode/);
  assert.match(source, /isValidSrcCode/);
  assert.match(source, /getRecipePublicationBySrcCode/);
  assert.match(source, /buildSrcReleaseUrl/);
  assert.match(source, /const normalized = normalizeSrcCode\(srcCode\)/);
  assert.match(source, /if \(!isValidSrcCode\(normalized\)\) \{/);
  assert.match(source, /release = await getRecipePublicationBySrcCode\(normalized\)/);
  assert.match(source, /release\.publication\.status === 'revoked'/);
  assert.match(source, /QRCode\.toString/);
  assert.match(source, /buildSrcReleaseUrl\(request\.nextUrl\.origin, normalized\)/);
  assert.match(source, /type: 'svg'/);
  assert.match(source, /'Content-Type': 'image\/svg\+xml; charset=utf-8'/);
  assert.match(source, /'Cache-Control': 'public, max-age=300'/);
});
