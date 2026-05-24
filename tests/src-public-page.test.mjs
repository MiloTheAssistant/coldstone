import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import { createRequire } from 'node:module';

const pagePath = new URL('../app/src/[srcCode]/page.tsx', import.meta.url);
const servicePath = new URL('../app/lib/src-publication-service.ts', import.meta.url);

function loadPublicationService() {
  const source = readFileSync(servicePath, 'utf8')
    .replace(/import \{ NextResponse \} from 'next\/server';\r?\n/, 'const NextResponse = { json: (body, init) => ({ body, init }) };\n')
    .replace(/import type \{ SoapAbacusMembership \} from '\.\/soap-abacus-membership';\r?\n/, '')
    .replace(/import type [\s\S]*? from '\.\/recipe-vault';\r?\n/, '')
    .replace(/import \{[\s\S]*?\} from '@\/app\/soap-calculator\/studio\/membership-model';/, "const FEATURE_KEYS = { SRC_STAMPING: 'src_stamping', SRC_REVISION_UPDATE: 'src_revision_update' };\nconst hasFeature = () => true;")
    .replace(/import \{[\s\S]*?\} from '\.\/recipe-vault';/, 'const addRecipePublicationRevision = () => {};\nconst createRecipePublication = () => {};\nconst createRecipePublicationWithinMonthlyQuota = () => {};\nconst getRecipeForUser = () => {};\nconst getRecipePublicationBySrcCode = () => {};')
    .replace(/import \{[\s\S]*?\} from '@\/app\/soap-calculator\/studio\/recipe-studio-model';/, "const buildPublicationRevision = () => ({});\nconst createIlcCode = () => '';\nconst createSrcCode = () => '';\nconst slugify = value => String(value || '').toLowerCase();");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  Function('module', 'exports', 'require', transpiled)(loadedModule, loadedModule.exports, createRequire(import.meta.url));
  return loadedModule.exports;
}

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

test('public release decoration omits private recipe and revision data by value', () => {
  const { decoratePublicRelease } = loadPublicationService();
  const release = {
    publication: {
      id: 'pub_1',
      ownerId: 'user_secret',
      recipeId: 'recipe_1',
      currentRevisionId: 'rev_1',
      srcCode: 'ABCD-efgh-1234-IJKL-5678',
      status: 'active',
      title: 'Public Soap',
      slug: 'public-soap',
      metadata: { private: 'publication metadata secret' },
      createdAt: '2026-05-23T00:00:00.000Z',
      updatedAt: '2026-05-23T00:00:00.000Z',
    },
    revision: {
      id: 'rev_1',
      publicationId: 'pub_1',
      recipeId: 'recipe_1',
      recipeVersionId: 'version_1',
      ownerId: 'user_secret',
      revisionNumber: 2,
      revisionNotes: 'changed olive oil from 35% to 33%',
      releaseNotesPublic: '',
      recipeSnapshot: {
        id: 'recipe_1',
        versionId: 'version_1',
        ownerId: 'user_secret',
        name: 'Public Soap',
        slug: 'public-soap',
        description: 'private product positioning',
        mode: 'expert',
        visibility: 'private',
        version: 3,
        oils: [{ oilId: 'olive', name: 'Olive Oil', percent: 33, pricePerUnit: 9.25, metadata: { margin: 'secret' } }],
        liquids: [],
        fragrances: [],
        additives: [],
        costs: [{ ingredientId: 'olive', pricePerUnit: 9.25 }],
        pricing: { retailPricePerBar: 12 },
        notes: 'private maker notes',
        processSteps: [{ step: 'private process' }],
        createdAt: '2026-05-23T00:00:00.000Z',
        updatedAt: '2026-05-23T00:00:00.000Z',
      },
      ingredientListSnapshot: [],
      active: true,
      createdAt: '2026-05-23T00:00:00.000Z',
    },
    ilc: {
      id: 'ilc_1',
      publicationId: 'pub_1',
      revisionId: 'rev_1',
      ownerId: 'user_secret',
      ilcCode: 'ILC-ABC-def-123-GHI',
      ingredients: [{ name: 'Olive Oil', percent: 33, supplier: 'private supplier', metadata: { affiliate: 'secret' } }],
      metadata: { partner: 'secret partner' },
      createdAt: '2026-05-23T00:00:00.000Z',
    },
  };

  const decorated = decoratePublicRelease(release, 'https://soapabacus.com');
  const output = JSON.stringify(decorated);

  assert.equal(decorated.revision.releaseNotesPublic, '');
  assert.equal(decorated.revision.recipe.name, 'Public Soap');
  assert.equal(decorated.revision.recipe.oils[0].name, 'Olive Oil');
  assert.equal(decorated.revision.recipe.oils[0].percent, 33);
  assert.equal(output.includes('changed olive oil'), false);
  assert.equal(output.includes('user_secret'), false);
  assert.equal(output.includes('publication metadata secret'), false);
  assert.equal(output.includes('private product positioning'), false);
  assert.equal(output.includes('private maker notes'), false);
  assert.equal(output.includes('private process'), false);
  assert.equal(output.includes('retailPricePerBar'), false);
  assert.equal(output.includes('pricePerUnit'), false);
  assert.equal(output.includes('secret'), false);
  assert.equal(output.includes('recipeSnapshot'), false);
  assert.equal(output.includes('processSteps'), false);
  assert.equal(output.includes('revisionNotes'), false);
  assert.equal(output.includes('metadata'), false);
});
