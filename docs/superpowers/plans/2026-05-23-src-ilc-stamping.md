# SRC and ILC Stamping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add paid Soap Recipe Code stamping, Ingredient List Code generation, QR lookup, and Pro same-SRC revision publishing to Soap Abacus.

**Architecture:** Keep normal recipe saving in the existing Recipe Cache and recipe vault. Add a separate production publication model where SRC codes are permanent, publication revisions are immutable, and the active revision is what public SRC lookup displays. API routes enforce membership gates; UI surfaces show `Save` for Free and `Save` plus `Stamp It` for Plus and Pro.

**Tech Stack:** Next.js App Router, React 19, Clerk, Neon Postgres via `@neondatabase/serverless`, existing Soap Abacus membership model, Node test runner, `qrcode` for server-side SVG QR generation.

---

## File Structure

- Modify: `package.json` and `package-lock.json`
  - Add `qrcode` and `@types/qrcode` for SVG QR route generation.
- Modify: `app/soap-calculator/studio/schema.sql`
  - Add `recipe_publications`, `recipe_publication_revisions`, `ingredient_list_codes`, and `partner_export_events`.
- Modify: `app/soap-calculator/studio/membership-model.js`
  - Add `SRC_STAMPING` and `SRC_REVISION_UPDATE` feature keys.
  - Give Plus and Pro SRC stamping.
  - Give Pro same-SRC revision updates.
- Modify: `app/soap-calculator/studio/recipe-studio-model.js`
  - Add SRC/ILC code generation, validation, ingredient-list snapshot, publication record builders, and revision helpers.
- Modify: `tests/soap-calculator-studio.test.mjs`
  - Add model tests for SRC/ILC format, immutable revisions, Pro update rules at the model level, and public release-note behavior.
- Modify: `app/lib/recipe-vault.ts`
  - Add publication, revision, ILC interfaces.
  - Add Neon persistence functions for creating new SRCs, publishing new revisions, lookup, owner listing, and monthly quota counting.
- Create: `app/lib/src-publication-service.ts`
  - Add service-level orchestration for membership gates, Plus quota, code collision retries, new SRC stamping, Pro same-SRC revisions, and public lookup DTOs.
- Create: `app/api/recipes/[id]/src/route.ts`
  - Authenticated route to stamp a recipe as a new SRC or update the same SRC as a Pro revision.
- Create: `app/api/src/[srcCode]/route.ts`
  - Public JSON lookup route for SRC release data.
- Create: `app/api/src/[srcCode]/qr/route.ts`
  - Public SVG QR route for an SRC.
- Create: `app/src/[srcCode]/page.tsx`
  - Public read-only SRC release page.
- Create: `app/soap-calculator/components/SrcLookupPanel.tsx`
  - Enter-SRC lookup form used in Soap Abacus.
- Create: `app/soap-calculator/components/SrcStampDialog.tsx`
  - Confirmation dialog with first-stamp and Pro revision-warning copy.
- Modify: `app/soap-calculator/components/SavedRecipesList.tsx`
  - Add `Stamp It` on saved recipe cards for Plus and Pro.
  - Add stamped SRC display once a recipe has a publication.
- Modify: `app/soap-calculator/lib/storage.ts`
  - Store optional local `srcCode`, `ilcCode`, and `srcRevision` metadata after stamping.
- Modify: `app/soap-calculator/page.tsx`
  - Pass SRC feature gates to `SavedRecipesList`.
  - Add `SrcLookupPanel` to the Recipe Cache tab.
  - Support loading a cloned SRC release into the editable calculator draft.
- Modify: `tests/*.test.mjs`
  - Add route-source tests for expected API route behavior and UI gate strings if direct route tests are not feasible in the current test setup.

---

### Task 1: Add QR Dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install QR dependencies**

Run:

```powershell
npm install qrcode @types/qrcode --save
```

Expected:

```text
added ... packages
```

- [ ] **Step 2: Verify package scripts still parse**

Run:

```powershell
npm test
```

Expected:

```text
# pass
```

- [ ] **Step 3: Commit dependency change**

Run:

```powershell
git add package.json package-lock.json
git commit -m "chore: add QR code generation dependency"
```

---

### Task 2: Add Membership Feature Gates

**Files:**
- Modify: `app/soap-calculator/studio/membership-model.js`
- Test: `tests/soap-calculator-studio.test.mjs`

- [ ] **Step 1: Write failing membership feature tests**

Add this test block to `tests/soap-calculator-studio.test.mjs` after the existing `getModeProcess` test:

```javascript
test('membership features gate SRC stamping by tier', () => {
  assert.equal(hasFeature({ tier: 'free', effectiveTier: 'free' }, FEATURE_KEYS.SRC_STAMPING), false);
  assert.equal(hasFeature({ tier: 'plus', effectiveTier: 'plus' }, FEATURE_KEYS.SRC_STAMPING), true);
  assert.equal(hasFeature({ tier: 'pro', effectiveTier: 'pro' }, FEATURE_KEYS.SRC_STAMPING), true);

  assert.equal(hasFeature({ tier: 'free', effectiveTier: 'free' }, FEATURE_KEYS.SRC_REVISION_UPDATE), false);
  assert.equal(hasFeature({ tier: 'plus', effectiveTier: 'plus' }, FEATURE_KEYS.SRC_REVISION_UPDATE), false);
  assert.equal(hasFeature({ tier: 'pro', effectiveTier: 'pro' }, FEATURE_KEYS.SRC_REVISION_UPDATE), true);
});
```

Also update the import from `membership-model.js` in the test file:

```javascript
import {
  FEATURE_KEYS,
  hasFeature,
} from '../app/soap-calculator/studio/membership-model.js';
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test
```

Expected: FAIL with `SRC_STAMPING` undefined or feature assertions failing.

- [ ] **Step 3: Add feature keys and tier mappings**

In `app/soap-calculator/studio/membership-model.js`, add these feature keys:

```javascript
  SRC_STAMPING: 'recipe-cache:src-stamping',
  SRC_REVISION_UPDATE: 'recipe-cache:src-revision-update',
```

Add `FEATURE_KEYS.SRC_STAMPING` to the `plus` feature list.

Add both `FEATURE_KEYS.SRC_STAMPING` and `FEATURE_KEYS.SRC_REVISION_UPDATE` to the `pro` feature list.

Add these labels:

```javascript
    'Stamp Soap Recipe Codes',
```

for Plus and:

```javascript
    'Stamp Soap Recipe Codes',
    'Update existing SRC releases with revision notes',
```

for Pro.

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit membership gate**

Run:

```powershell
git add app/soap-calculator/studio/membership-model.js tests/soap-calculator-studio.test.mjs
git commit -m "feat: gate SRC stamping by membership tier"
```

---

### Task 3: Add SRC and ILC Model Helpers

**Files:**
- Modify: `app/soap-calculator/studio/recipe-studio-model.js`
- Test: `tests/soap-calculator-studio.test.mjs`

- [ ] **Step 1: Write failing model tests**

Add these imports to the existing `recipe-studio-model.js` import block:

```javascript
  buildIngredientListSnapshot,
  buildPublicationRevision,
  createIlcCode,
  createSrcCode,
  isValidIlcCode,
  isValidSrcCode,
  normalizeSrcCode,
```

Add these tests after the current `createShareLink defaults public recipe URLs to Soap Abacus` test:

```javascript
test('createSrcCode and createIlcCode produce public code formats', () => {
  const srcCode = createSrcCode([0, 1, 61, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);
  const ilcCode = createIlcCode([0, 1, 61, 10, 11, 12, 13, 14, 15, 16, 17, 18]);

  assert.equal(srcCode, 'AB9K-LMNO-PQRS-TUVW-XYZa');
  assert.equal(ilcCode, 'ILC-AB9-KLM-NOP-QRS');
  assert.equal(isValidSrcCode(srcCode), true);
  assert.equal(isValidIlcCode(ilcCode), true);
  assert.equal(normalizeSrcCode('ab9k lmno pqrs tuvw xyza'), 'ab9k-LMNO-PQRS-TUVW-XYZa');
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test
```

Expected: FAIL with missing exported helpers.

- [ ] **Step 3: Implement model helpers**

Add this code after `createId(prefix)` in `app/soap-calculator/studio/recipe-studio-model.js`:

```javascript
const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function pickCodeChar(index) {
  return CODE_ALPHABET[Math.abs(Number(index) || 0) % CODE_ALPHABET.length];
}

function randomIndexes(length) {
  const values = new Uint32Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(values);
    return Array.from(values);
  }
  return Array.from({ length }, () => Math.floor(Math.random() * CODE_ALPHABET.length));
}

function groupCode(chars, groupLength) {
  const groups = [];
  for (let index = 0; index < chars.length; index += groupLength) {
    groups.push(chars.slice(index, index + groupLength).join(''));
  }
  return groups.join('-');
}

function createSrcCode(indexes) {
  const values = Array.isArray(indexes) ? indexes : randomIndexes(20);
  return groupCode(values.slice(0, 20).map(pickCodeChar), 4);
}

function createIlcCode(indexes) {
  const values = Array.isArray(indexes) ? indexes : randomIndexes(12);
  return `ILC-${groupCode(values.slice(0, 12).map(pickCodeChar), 3)}`;
}

function normalizeSrcCode(value) {
  const compact = String(value || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
  return compact.length === 20 ? groupCode(compact.split(''), 4) : compact;
}

function isValidSrcCode(value) {
  return /^[A-Za-z0-9]{4}(-[A-Za-z0-9]{4}){4}$/.test(String(value || ''));
}

function isValidIlcCode(value) {
  return /^ILC-[A-Za-z0-9]{3}(-[A-Za-z0-9]{3}){3}$/.test(String(value || ''));
}

function buildIngredientListSnapshot(recipe = {}) {
  const entries = [];
  for (const oil of recipe.oils || []) {
    entries.push({
      ingredientType: 'oil',
      ingredientId: oil.oilId || oil.ingredientId || 'oil',
      displayName: oil.name || oil.displayName || oil.oilId || 'Oil',
      percent: Number.isFinite(Number(oil.percent)) ? Number(oil.percent) : null,
      weight: Number.isFinite(Number(oil.weight)) ? Number(oil.weight) : null,
      unit: oil.unit || null,
      metadata: { ...oil },
    });
  }
  for (const liquid of recipe.liquids || []) {
    entries.push({
      ingredientType: 'liquid',
      ingredientId: liquid.liquidId || liquid.ingredientId || 'liquid',
      displayName: liquid.name || liquid.displayName || liquid.liquidId || 'Liquid',
      percent: Number.isFinite(Number(liquid.percent)) ? Number(liquid.percent) : null,
      weight: Number.isFinite(Number(liquid.weight)) ? Number(liquid.weight) : null,
      unit: liquid.unit || null,
      metadata: { ...liquid },
    });
  }
  for (const fragrance of recipe.fragrances || []) {
    entries.push({
      ingredientType: 'fragrance',
      ingredientId: fragrance.fragranceId || fragrance.ingredientId || 'fragrance',
      displayName: fragrance.name || fragrance.displayName || fragrance.fragranceId || 'Fragrance',
      percent: Number.isFinite(Number(fragrance.usagePercent)) ? Number(fragrance.usagePercent) : null,
      weight: Number.isFinite(Number(fragrance.weight)) ? Number(fragrance.weight) : null,
      unit: fragrance.unit || null,
      metadata: { ...fragrance },
    });
  }
  for (const additive of recipe.additives || []) {
    entries.push({
      ingredientType: 'additive',
      ingredientId: additive.additiveId || additive.ingredientId || 'additive',
      displayName: additive.name || additive.displayName || additive.additiveId || 'Additive',
      percent: Number.isFinite(Number(additive.percent)) ? Number(additive.percent) : null,
      weight: Number.isFinite(Number(additive.weight)) ? Number(additive.weight) : null,
      unit: additive.unit || null,
      metadata: { ...additive },
    });
  }
  return entries;
}

function buildPublicationRevision(input = {}) {
  const now = input.now || new Date().toISOString();
  const recipe = input.recipe || {};
  return {
    id: input.revisionId || createId('pubrev'),
    publicationId: input.publicationId,
    srcCode: input.srcCode,
    ilcCode: input.ilcCode,
    recipeId: recipe.id,
    recipeVersionId: recipe.versionId,
    ownerId: input.ownerId || recipe.ownerId || null,
    revisionNumber: Number(input.revisionNumber) || 1,
    revisionNotes: input.revisionNotes || '',
    releaseNotesPublic: input.revisionNotes || '',
    recipeSnapshot: JSON.parse(JSON.stringify(recipe)),
    ingredientListSnapshot: buildIngredientListSnapshot(recipe),
    createdAt: now,
    active: input.active !== false,
  };
}
```

Add the new helper names to `module.exports`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit model helpers**

Run:

```powershell
git add app/soap-calculator/studio/recipe-studio-model.js tests/soap-calculator-studio.test.mjs
git commit -m "feat: add SRC and ILC model helpers"
```

---

### Task 4: Add Production Publication Schema

**Files:**
- Modify: `app/soap-calculator/studio/schema.sql`
- Test: `tests/soap-calculator-studio.test.mjs`

- [ ] **Step 1: Write failing schema-source test**

Add this test to `tests/soap-calculator-studio.test.mjs`:

```javascript
test('studio schema defines SRC publication tables and unique codes', () => {
  const schema = readFileSync(new URL('../app/soap-calculator/studio/schema.sql', import.meta.url), 'utf8');
  assert.match(schema, /create table if not exists recipe_publications/);
  assert.match(schema, /src_code text not null unique/);
  assert.match(schema, /create table if not exists recipe_publication_revisions/);
  assert.match(schema, /unique \\(publication_id, revision_number\\)/);
  assert.match(schema, /create table if not exists ingredient_list_codes/);
  assert.match(schema, /ilc_code text not null unique/);
});
```

Add this import at the top of the test file if not already present:

```javascript
import { readFileSync } from 'node:fs';
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test
```

Expected: FAIL with missing schema table patterns.

- [ ] **Step 3: Add schema tables**

Append this SQL to `app/soap-calculator/studio/schema.sql` before the final indexes section or directly above the new indexes:

```sql
create table if not exists recipe_publications (
  id text primary key,
  owner_id text not null,
  recipe_id text not null references recipes(id) on delete cascade,
  current_revision_id text,
  src_code text not null unique,
  status text not null default 'active',
  title text not null,
  slug text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recipe_publication_revisions (
  id text primary key,
  publication_id text not null references recipe_publications(id) on delete cascade,
  recipe_id text not null references recipes(id) on delete cascade,
  recipe_version_id text not null,
  owner_id text not null,
  revision_number integer not null,
  revision_notes text not null default '',
  release_notes_public text not null default '',
  recipe_snapshot jsonb not null,
  ingredient_list_snapshot jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (publication_id, revision_number)
);

create table if not exists ingredient_list_codes (
  id text primary key,
  publication_id text not null references recipe_publications(id) on delete cascade,
  revision_id text not null references recipe_publication_revisions(id) on delete cascade,
  owner_id text not null,
  ilc_code text not null unique,
  ingredients jsonb not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists partner_export_events (
  id text primary key,
  publication_id text not null references recipe_publications(id) on delete cascade,
  revision_id text references recipe_publication_revisions(id) on delete set null,
  partner_key text not null,
  status text not null default 'queued',
  payload jsonb not null default '{}'::jsonb,
  response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Append these indexes:

```sql
create index if not exists recipe_publications_owner_updated_idx on recipe_publications(owner_id, updated_at desc);
create index if not exists recipe_publications_src_code_idx on recipe_publications(src_code);
create index if not exists recipe_publication_revisions_publication_idx on recipe_publication_revisions(publication_id, revision_number desc);
create index if not exists ingredient_list_codes_publication_idx on ingredient_list_codes(publication_id, revision_id);
create index if not exists partner_export_events_publication_idx on partner_export_events(publication_id, created_at desc);
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit schema**

Run:

```powershell
git add app/soap-calculator/studio/schema.sql tests/soap-calculator-studio.test.mjs
git commit -m "feat: add SRC publication schema"
```

---

### Task 5: Add Recipe Vault Publication Persistence

**Files:**
- Modify: `app/lib/recipe-vault.ts`

- [ ] **Step 1: Add TypeScript interfaces**

Update the existing Neon import:

```typescript
import { neon, type NeonQueryFunction, type NeonQueryFunctionInTransaction } from '@neondatabase/serverless';
```

Add these interfaces below `ShareLinkRecord` in `app/lib/recipe-vault.ts`:

```typescript
export interface IngredientListCodeRecord {
  id: string;
  publicationId: string;
  revisionId: string;
  ownerId: string;
  ilcCode: string;
  ingredients: unknown[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface RecipePublicationRecord {
  id: string;
  ownerId: string;
  recipeId: string;
  currentRevisionId: string | null;
  srcCode: string;
  status: 'active' | 'revoked';
  title: string;
  slug: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RecipePublicationRevisionRecord {
  id: string;
  publicationId: string;
  recipeId: string;
  recipeVersionId: string;
  ownerId: string;
  revisionNumber: number;
  revisionNotes: string;
  releaseNotesPublic: string;
  recipeSnapshot: RecipeSnapshot;
  ingredientListSnapshot: unknown[];
  active: boolean;
  createdAt: string;
}

export interface PublishedRecipeRelease {
  publication: RecipePublicationRecord;
  revision: RecipePublicationRevisionRecord;
  ilc: IngredientListCodeRecord;
}
```

- [ ] **Step 2: Add mapper helpers**

Add mapper helpers above `mapMembershipRow`:

```typescript
function mapPublicationRow(row: Record<string, unknown>): RecipePublicationRecord {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    recipeId: String(row.recipe_id),
    currentRevisionId: (row.current_revision_id as string | null) || null,
    srcCode: String(row.src_code),
    status: row.status === 'revoked' ? 'revoked' : 'active',
    title: String(row.title || 'Untitled Soap Recipe'),
    slug: String(row.slug || 'soap-recipe'),
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

function mapPublicationRevisionRow(row: Record<string, unknown>): RecipePublicationRevisionRecord {
  return {
    id: String(row.id),
    publicationId: String(row.publication_id),
    recipeId: String(row.recipe_id),
    recipeVersionId: String(row.recipe_version_id),
    ownerId: String(row.owner_id),
    revisionNumber: Number(row.revision_number || 1),
    revisionNotes: String(row.revision_notes || ''),
    releaseNotesPublic: String(row.release_notes_public || ''),
    recipeSnapshot: row.recipe_snapshot as RecipeSnapshot,
    ingredientListSnapshot: (row.ingredient_list_snapshot as unknown[]) || [],
    active: row.active !== false,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

function mapIngredientListCodeRow(row: Record<string, unknown>): IngredientListCodeRecord {
  return {
    id: String(row.id),
    publicationId: String(row.publication_id),
    revisionId: String(row.revision_id),
    ownerId: String(row.owner_id),
    ilcCode: String(row.ilc_code),
    ingredients: (row.ingredients as unknown[]) || [],
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}
```

- [ ] **Step 3: Add persistence functions**

Add these exports after `getSharedRecipe`:

```typescript
export async function getRecipePublicationBySrcCode(srcCode: string): Promise<PublishedRecipeRelease | null> {
  const sql = getSql();
  const rows = await sql`
    select
      p.*,
      r.id as revision_row_id,
      r.publication_id as revision_publication_id,
      r.recipe_id as revision_recipe_id,
      r.recipe_version_id,
      r.owner_id as revision_owner_id,
      r.revision_number,
      r.revision_notes,
      r.release_notes_public,
      r.recipe_snapshot,
      r.ingredient_list_snapshot,
      r.active as revision_active,
      r.created_at as revision_created_at,
      i.id as ilc_row_id,
      i.publication_id as ilc_publication_id,
      i.revision_id as ilc_revision_id,
      i.owner_id as ilc_owner_id,
      i.ilc_code,
      i.ingredients,
      i.metadata as ilc_metadata,
      i.created_at as ilc_created_at
    from recipe_publications p
    join recipe_publication_revisions r on r.id = p.current_revision_id
    join ingredient_list_codes i on i.revision_id = r.id
    where p.src_code = ${srcCode}
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    publication: mapPublicationRow(row),
    revision: mapPublicationRevisionRow({
      id: row.revision_row_id,
      publication_id: row.revision_publication_id,
      recipe_id: row.revision_recipe_id,
      recipe_version_id: row.recipe_version_id,
      owner_id: row.revision_owner_id,
      revision_number: row.revision_number,
      revision_notes: row.revision_notes,
      release_notes_public: row.release_notes_public,
      recipe_snapshot: row.recipe_snapshot,
      ingredient_list_snapshot: row.ingredient_list_snapshot,
      active: row.revision_active,
      created_at: row.revision_created_at,
    }),
    ilc: mapIngredientListCodeRow({
      id: row.ilc_row_id,
      publication_id: row.ilc_publication_id,
      revision_id: row.ilc_revision_id,
      owner_id: row.ilc_owner_id,
      ilc_code: row.ilc_code,
      ingredients: row.ingredients,
      metadata: row.ilc_metadata,
      created_at: row.ilc_created_at,
    }),
  };
}

export async function createRecipePublication(input: {
  publication: RecipePublicationRecord;
  revision: RecipePublicationRevisionRecord;
  ilc: IngredientListCodeRecord;
}) {
  const sql = getSql();
  await sql.transaction((tx) => [
    tx`
      insert into recipe_publications (
        id, owner_id, recipe_id, current_revision_id, src_code, status, title, slug, metadata, created_at, updated_at
      )
      values (
        ${input.publication.id}, ${input.publication.ownerId}, ${input.publication.recipeId},
        ${input.revision.id}, ${input.publication.srcCode}, ${input.publication.status},
        ${input.publication.title}, ${input.publication.slug}, ${JSON.stringify(input.publication.metadata || {})},
        ${input.publication.createdAt}, ${input.publication.updatedAt}
      )
    `,
    buildInsertPublicationRevisionQuery(tx, input.revision),
    buildInsertIngredientListCodeQuery(tx, input.ilc),
  ]);
  return input;
}

export async function addRecipePublicationRevision(input: {
  publicationId: string;
  revision: RecipePublicationRevisionRecord;
  ilc: IngredientListCodeRecord;
}) {
  const sql = getSql();
  await sql.transaction((tx) => [
    buildInsertPublicationRevisionQuery(tx, input.revision),
    buildInsertIngredientListCodeQuery(tx, input.ilc),
    tx`
      update recipe_publications
      set current_revision_id = ${input.revision.id}, updated_at = ${input.revision.createdAt}
      where id = ${input.publicationId}
    `,
  ]);
  return input;
}

export async function countMonthlySrcPublicationsForUser(ownerId: string, now = new Date()) {
  const sql = getSql();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
  const rows = await sql`
    select count(*)::int as count
    from recipe_publications
    where owner_id = ${ownerId}
      and created_at >= ${start}
      and created_at < ${end}
  `;
  return Number(rows[0]?.count || 0);
}

function buildInsertPublicationRevisionQuery(sql: NeonQueryFunctionInTransaction<false, false>, revision: RecipePublicationRevisionRecord) {
  return sql`
    insert into recipe_publication_revisions (
      id, publication_id, recipe_id, recipe_version_id, owner_id, revision_number, revision_notes,
      release_notes_public, recipe_snapshot, ingredient_list_snapshot, active, created_at
    )
    values (
      ${revision.id}, ${revision.publicationId}, ${revision.recipeId}, ${revision.recipeVersionId},
      ${revision.ownerId}, ${revision.revisionNumber}, ${revision.revisionNotes},
      ${revision.releaseNotesPublic}, ${JSON.stringify(revision.recipeSnapshot)},
      ${JSON.stringify(revision.ingredientListSnapshot)}, ${revision.active}, ${revision.createdAt}
    )
  `;
}

function buildInsertIngredientListCodeQuery(sql: NeonQueryFunctionInTransaction<false, false>, ilc: IngredientListCodeRecord) {
  return sql`
    insert into ingredient_list_codes (
      id, publication_id, revision_id, owner_id, ilc_code, ingredients, metadata, created_at
    )
    values (
      ${ilc.id}, ${ilc.publicationId}, ${ilc.revisionId}, ${ilc.ownerId}, ${ilc.ilcCode},
      ${JSON.stringify(ilc.ingredients)}, ${JSON.stringify(ilc.metadata || {})}, ${ilc.createdAt}
    )
  `;
}
```

- [ ] **Step 4: Run TypeScript and tests**

Run:

```powershell
npm test
npm run lint
```

Expected: PASS for tests and lint.

- [ ] **Step 5: Commit persistence**

Run:

```powershell
git add app/lib/recipe-vault.ts
git commit -m "feat: persist SRC publications"
```

---

### Task 6: Add SRC Publication Service

**Files:**
- Create: `app/lib/src-publication-service.ts`
- Test: `tests/src-publication-service.test.mjs`

- [ ] **Step 1: Create service tests**

Create `tests/src-publication-service.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../app/lib/src-publication-service.ts', import.meta.url), 'utf8');

test('SRC publication service enforces paid stamping and Pro same-SRC updates', () => {
  assert.match(source, /PLUS_MONTHLY_SRC_LIMIT = 10/);
  assert.match(source, /FEATURE_KEYS\\.SRC_STAMPING/);
  assert.match(source, /FEATURE_KEYS\\.SRC_REVISION_UPDATE/);
  assert.match(source, /mode === 'same-src'/);
  assert.match(source, /Only Pro members can update an existing SRC/);
});

test('SRC publication service retries code generation collisions', () => {
  assert.match(source, /MAX_CODE_ATTEMPTS = 5/);
  assert.match(source, /for \\(let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt \\+= 1\\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test
```

Expected: FAIL because `src-publication-service.ts` does not exist.

- [ ] **Step 3: Implement service**

Create `app/lib/src-publication-service.ts` with these exports:

```typescript
import { NextResponse } from 'next/server';
import { FEATURE_KEYS, hasFeature } from '@/app/soap-calculator/studio/membership-model';
import {
  buildPublicationRevision,
  createIlcCode,
  createSrcCode,
  slugify,
} from '@/app/soap-calculator/studio/recipe-studio-model';
import {
  addRecipePublicationRevision,
  countMonthlySrcPublicationsForUser,
  createRecipePublication,
  getRecipeForUser,
  getRecipePublicationBySrcCode,
  type IngredientListCodeRecord,
  type PublishedRecipeRelease,
  type RecipePublicationRecord,
  type RecipePublicationRevisionRecord,
  type RecipeSnapshot,
} from './recipe-vault';
import type { SoapAbacusMembership } from './soap-abacus-membership';

export const PLUS_MONTHLY_SRC_LIMIT = 10;
const MAX_CODE_ATTEMPTS = 5;

export type StampMode = 'new-src' | 'same-src';

export interface StampRecipeInput {
  recipeId: string;
  ownerId: string;
  membership: SoapAbacusMembership;
  mode: StampMode;
  existingSrcCode?: string;
  revisionNotes?: string;
  origin: string;
}

export function buildSrcReleaseUrl(origin: string, srcCode: string) {
  return `${origin.replace(/\/$/, '')}/src/${srcCode}`;
}

export async function stampRecipeSrc(input: StampRecipeInput) {
  if (!hasFeature(input.membership, FEATURE_KEYS.SRC_STAMPING)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Upgrade to Plus or Pro to stamp Soap Recipe Codes.' },
        { status: 402 },
      ),
    };
  }

  if (input.mode === 'same-src' && !hasFeature(input.membership, FEATURE_KEYS.SRC_REVISION_UPDATE)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Only Pro members can update an existing SRC. Stamp a new SRC or upgrade to Pro.' },
        { status: 402 },
      ),
    };
  }

  if (input.membership.effectiveTier === 'plus' && input.mode === 'new-src') {
    const monthlyCount = await countMonthlySrcPublicationsForUser(input.ownerId);
    if (monthlyCount >= PLUS_MONTHLY_SRC_LIMIT) {
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: `Plus members can stamp ${PLUS_MONTHLY_SRC_LIMIT} SRCs per month. Upgrade to Pro for unlimited SRC stamping.` },
          { status: 402 },
        ),
      };
    }
  }

  const recipe = await getRecipeForUser(input.recipeId, input.ownerId);
  if (!recipe) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Recipe not found.' }, { status: 404 }),
    };
  }

  if (input.mode === 'same-src') {
    if (!input.existingSrcCode) {
      return {
        ok: false as const,
        response: NextResponse.json({ error: 'Choose an SRC to update.' }, { status: 400 }),
      };
    }
    const existing = await getRecipePublicationBySrcCode(input.existingSrcCode);
    if (!existing || existing.publication.ownerId !== input.ownerId) {
      return {
        ok: false as const,
        response: NextResponse.json({ error: 'SRC publication not found for this account.' }, { status: 404 }),
      };
    }
    const revision = makeRevision(existing.publication, recipe, input.ownerId, existing.revision.revisionNumber + 1, input.revisionNotes);
    const ilc = makeIlc(revision);
    await addRecipePublicationRevision({ publicationId: existing.publication.id, revision, ilc });
    const release = await getRecipePublicationBySrcCode(existing.publication.srcCode);
    return { ok: true as const, release: decorateRelease(release, input.origin) };
  }

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const srcCode = createSrcCode();
    const existing = await getRecipePublicationBySrcCode(srcCode);
    if (existing) continue;
    const publication = makePublication(recipe, input.ownerId, srcCode);
    const revision = makeRevision(publication, recipe, input.ownerId, 1, input.revisionNotes);
    const ilc = makeIlc(revision);
    await createRecipePublication({ publication, revision, ilc });
    const release = await getRecipePublicationBySrcCode(srcCode);
    return { ok: true as const, release: decorateRelease(release, input.origin) };
  }

  return {
    ok: false as const,
    response: NextResponse.json({ error: 'Unable to generate a unique SRC. Please try again.' }, { status: 500 }),
  };
}

export function decorateRelease(release: PublishedRecipeRelease | null, origin: string) {
  if (!release) return null;
  return {
    ...release,
    url: buildSrcReleaseUrl(origin, release.publication.srcCode),
    qrUrl: `/api/src/${release.publication.srcCode}/qr`,
  };
}

function makePublication(recipe: RecipeSnapshot, ownerId: string, srcCode: string): RecipePublicationRecord {
  const now = new Date().toISOString();
  return {
    id: createStableId('pub'),
    ownerId,
    recipeId: recipe.id,
    currentRevisionId: null,
    srcCode,
    status: 'active',
    title: recipe.name,
    slug: recipe.slug || slugify(recipe.name),
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };
}

function makeRevision(
  publication: RecipePublicationRecord,
  recipe: RecipeSnapshot,
  ownerId: string,
  revisionNumber: number,
  revisionNotes = '',
): RecipePublicationRevisionRecord {
  return buildPublicationRevision({
    publicationId: publication.id,
    revisionId: createStableId('pubrev'),
    srcCode: publication.srcCode,
    ilcCode: createIlcCode(),
    recipe,
    ownerId,
    revisionNumber,
    revisionNotes,
  }) as RecipePublicationRevisionRecord;
}

function makeIlc(revision: RecipePublicationRevisionRecord): IngredientListCodeRecord {
  return {
    id: createStableId('ilc'),
    publicationId: revision.publicationId,
    revisionId: revision.id,
    ownerId: revision.ownerId,
    ilcCode: revision.ilcCode,
    ingredients: revision.ingredientListSnapshot,
    metadata: { srcCode: revision.srcCode, revisionNumber: revision.revisionNumber },
    createdAt: revision.createdAt,
  };
}

function createStableId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
```

If `slugify` is not exported from `recipe-studio-model.js`, add it to `module.exports` in Task 3's file before this task passes.

- [ ] **Step 4: Run tests and lint**

Run:

```powershell
npm test
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit service**

Run:

```powershell
git add app/lib/src-publication-service.ts tests/src-publication-service.test.mjs app/soap-calculator/studio/recipe-studio-model.js
git commit -m "feat: orchestrate SRC publication"
```

---

### Task 7: Add SRC API Routes

**Files:**
- Create: `app/api/recipes/[id]/src/route.ts`
- Create: `app/api/src/[srcCode]/route.ts`
- Create: `app/api/src/[srcCode]/qr/route.ts`
- Test: `tests/src-api-routes.test.mjs`

- [ ] **Step 1: Write route-source tests**

Create `tests/src-api-routes.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const stampRoute = readFileSync(new URL('../app/api/recipes/[id]/src/route.ts', import.meta.url), 'utf8');
const lookupRoute = readFileSync(new URL('../app/api/src/[srcCode]/route.ts', import.meta.url), 'utf8');
const qrRoute = readFileSync(new URL('../app/api/src/[srcCode]/qr/route.ts', import.meta.url), 'utf8');

test('recipe SRC stamp route uses membership and publication service', () => {
  assert.match(stampRoute, /getVaultSetup/);
  assert.match(stampRoute, /getCurrentSoapAbacusMembership/);
  assert.match(stampRoute, /stampRecipeSrc/);
  assert.match(stampRoute, /mode: body\\.mode === 'same-src' \\? 'same-src' : 'new-src'/);
});

test('public SRC lookup route returns decorated release data', () => {
  assert.match(lookupRoute, /getRecipePublicationBySrcCode/);
  assert.match(lookupRoute, /decorateRelease/);
  assert.match(lookupRoute, /SRC not found/);
});

test('QR route renders SVG with qrcode toString', () => {
  assert.match(qrRoute, /import QRCode from 'qrcode'/);
  assert.match(qrRoute, /QRCode\\.toString/);
  assert.match(qrRoute, /type: 'svg'/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test
```

Expected: FAIL because routes do not exist.

- [ ] **Step 3: Create stamp route**

Create `app/api/recipes/[id]/src/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId, isClerkConfigured } from '@/app/lib/auth';
import { isRecipeVaultConfigured } from '@/app/lib/recipe-vault';
import { getCurrentSoapAbacusMembership } from '@/app/lib/soap-abacus-membership';
import { stampRecipeSrc } from '@/app/lib/src-publication-service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const setup = await getVaultSetup();
  if (!setup.ok) return setup.response;

  const membershipSetup = await getCurrentSoapAbacusMembership();
  if (!membershipSetup.ok) return membershipSetup.response;

  let body: { mode?: string; existingSrcCode?: string; revisionNotes?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { id } = await params;
  const origin = request.nextUrl.origin;
  const result = await stampRecipeSrc({
    recipeId: id,
    ownerId: setup.userId,
    membership: membershipSetup.membership,
    mode: body.mode === 'same-src' ? 'same-src' : 'new-src',
    existingSrcCode: body.existingSrcCode,
    revisionNotes: body.revisionNotes,
    origin,
  });

  if (!result.ok) return result.response;
  return NextResponse.json({ release: result.release });
}

async function getVaultSetup(): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  if (!isClerkConfigured()) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Recipe vault accounts are not configured yet.' }, { status: 503 }),
    };
  }

  if (!isRecipeVaultConfigured()) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Recipe vault database is not configured yet.' }, { status: 503 }),
    };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Sign in to stamp Soap Recipe Codes.' }, { status: 401 }),
    };
  }

  return { ok: true, userId };
}
```

- [ ] **Step 4: Create public lookup route**

Create `app/api/src/[srcCode]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getRecipePublicationBySrcCode, isRecipeVaultConfigured } from '@/app/lib/recipe-vault';
import { decorateRelease } from '@/app/lib/src-publication-service';
import { normalizeSrcCode } from '@/app/soap-calculator/studio/recipe-studio-model';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ srcCode: string }> }) {
  if (!isRecipeVaultConfigured()) {
    return NextResponse.json({ error: 'Recipe vault database is not configured.' }, { status: 503 });
  }

  const { srcCode } = await params;
  const normalized = normalizeSrcCode(srcCode);
  const release = await getRecipePublicationBySrcCode(normalized);
  if (!release || release.publication.status === 'revoked') {
    return NextResponse.json({ error: 'SRC not found.' }, { status: 404 });
  }

  return NextResponse.json({ release: decorateRelease(release, request.nextUrl.origin) });
}
```

- [ ] **Step 5: Create QR route**

Create `app/api/src/[srcCode]/qr/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getRecipePublicationBySrcCode, isRecipeVaultConfigured } from '@/app/lib/recipe-vault';
import { buildSrcReleaseUrl } from '@/app/lib/src-publication-service';
import { normalizeSrcCode } from '@/app/soap-calculator/studio/recipe-studio-model';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ srcCode: string }> }) {
  if (!isRecipeVaultConfigured()) {
    return NextResponse.json({ error: 'Recipe vault database is not configured.' }, { status: 503 });
  }

  const { srcCode } = await params;
  const normalized = normalizeSrcCode(srcCode);
  const release = await getRecipePublicationBySrcCode(normalized);
  if (!release || release.publication.status === 'revoked') {
    return NextResponse.json({ error: 'SRC not found.' }, { status: 404 });
  }

  const svg = await QRCode.toString(buildSrcReleaseUrl(request.nextUrl.origin, normalized), {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: '#111827',
      light: '#ffffff',
    },
  });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
```

- [ ] **Step 6: Run tests and lint**

Run:

```powershell
npm test
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit API routes**

Run:

```powershell
git add 'app/api/recipes/[id]/src/route.ts' 'app/api/src/[srcCode]/route.ts' 'app/api/src/[srcCode]/qr/route.ts' tests/src-api-routes.test.mjs
git commit -m "feat: add SRC publication APIs"
```

---

### Task 8: Add Public SRC Release Page

**Files:**
- Create: `app/src/[srcCode]/page.tsx`
- Test: `tests/src-public-page.test.mjs`

- [ ] **Step 1: Write page-source test**

Create `tests/src-public-page.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const pageSource = readFileSync(new URL('../app/src/[srcCode]/page.tsx', import.meta.url), 'utf8');

test('public SRC page renders release metadata and ILC without private cost data', () => {
  assert.match(pageSource, /Soap Recipe Code/);
  assert.match(pageSource, /Ingredient List Code/);
  assert.match(pageSource, /Release Notes/);
  assert.match(pageSource, /revision\\.releaseNotesPublic/);
  assert.doesNotMatch(pageSource, /pricePerUnit/);
  assert.doesNotMatch(pageSource, /retailPricePerBar/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test
```

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Create public page**

Create `app/src/[srcCode]/page.tsx`:

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipePublicationBySrcCode, isRecipeVaultConfigured } from '@/app/lib/recipe-vault';
import { normalizeSrcCode } from '@/app/soap-calculator/studio/recipe-studio-model';

export const dynamic = 'force-dynamic';

export default async function SrcReleasePage({ params }: { params: Promise<{ srcCode: string }> }) {
  if (!isRecipeVaultConfigured()) notFound();

  const { srcCode } = await params;
  const release = await getRecipePublicationBySrcCode(normalizeSrcCode(srcCode));
  if (!release || release.publication.status === 'revoked') notFound();

  const { publication, revision, ilc } = release;
  const recipe = revision.recipeSnapshot;
  const ingredients = ilc.ingredients as Array<{
    ingredientType?: string;
    ingredientId?: string;
    displayName?: string;
    percent?: number | null;
    weight?: number | null;
    unit?: string | null;
  }>;

  return (
    <main className="min-h-screen bg-midnight text-parchment-200">
      <section className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/soap-calculator" className="text-sm text-gold-400 hover:text-gold-300">
          &larr; Soap Abacus
        </Link>

        <div className="mt-8 rounded-xl border border-navy-600/30 bg-navy-900/70 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold-500/70">Soap Recipe Code</p>
              <h1 className="mt-2 font-serif text-4xl text-gold-300">{recipe.name}</h1>
              <p className="mt-3 font-mono text-sm text-parchment-300">{publication.srcCode}</p>
              <p className="mt-2 text-xs text-parchment-500">
                Revision {revision.revisionNumber} · Published {new Date(revision.createdAt).toLocaleDateString('en-US')}
              </p>
            </div>
            <img
              src={`/api/src/${publication.srcCode}/qr`}
              alt={`QR code for SRC ${publication.srcCode}`}
              className="h-32 w-32 rounded-lg bg-white p-2"
            />
          </div>

          {revision.releaseNotesPublic && (
            <section className="mt-6 rounded-lg bg-navy-800/60 p-4">
              <h2 className="font-serif text-xl text-gold-400">Release Notes</h2>
              <p className="mt-2 text-sm text-parchment-300">{revision.releaseNotesPublic}</p>
            </section>
          )}

          <section className="mt-8">
            <h2 className="font-serif text-xl text-gold-400">Ingredient List Code</h2>
            <p className="mt-2 font-mono text-sm text-parchment-300">{ilc.ilcCode}</p>
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-xl text-gold-400">Formula</h2>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {ingredients.map((ingredient, index) => (
                <div key={`${ingredient.ingredientId || 'ingredient'}-${index}`} className="rounded-lg bg-navy-800/50 px-3 py-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span>{ingredient.displayName || ingredient.ingredientId}</span>
                    <span className="text-gold-400">
                      {ingredient.percent !== null && ingredient.percent !== undefined ? `${ingredient.percent}%` : ''}
                    </span>
                  </div>
                  {ingredient.weight !== null && ingredient.weight !== undefined && (
                    <p className="mt-1 text-xs text-parchment-500">
                      {ingredient.weight} {ingredient.unit || ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run tests and lint**

Run:

```powershell
npm test
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit public page**

Run:

```powershell
git add 'app/src/[srcCode]/page.tsx' tests/src-public-page.test.mjs
git commit -m "feat: add public SRC release page"
```

---

### Task 9: Add Soap Abacus SRC Lookup UI

**Files:**
- Create: `app/soap-calculator/components/SrcLookupPanel.tsx`
- Modify: `app/soap-calculator/page.tsx`
- Test: `tests/src-ui-source.test.mjs`

- [ ] **Step 1: Write UI source test**

Create `tests/src-ui-source.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const lookupPanel = readFileSync(new URL('../app/soap-calculator/components/SrcLookupPanel.tsx', import.meta.url), 'utf8');
const pageSource = readFileSync(new URL('../app/soap-calculator/page.tsx', import.meta.url), 'utf8');

test('Soap Abacus includes an Enter SRC lookup panel', () => {
  assert.match(lookupPanel, /Enter SRC/);
  assert.match(lookupPanel, /window\\.location\\.href = `\\/src\\/\\$\\{normalized\\}`/);
  assert.match(pageSource, /SrcLookupPanel/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test
```

Expected: FAIL because the lookup component does not exist.

- [ ] **Step 3: Create lookup component**

Create `app/soap-calculator/components/SrcLookupPanel.tsx`:

```tsx
'use client';

import { useState } from 'react';

function normalizeSrcInput(value: string) {
  const compact = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
  const groups = compact.match(/.{1,4}/g) || [];
  return groups.join('-');
}

export default function SrcLookupPanel() {
  const [srcCode, setSrcCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const submit = () => {
    const normalized = normalizeSrcInput(srcCode);
    if (!/^[A-Za-z0-9]{4}(-[A-Za-z0-9]{4}){4}$/.test(normalized)) {
      setMessage('Enter a complete SRC in the format xxxx-xxxx-xxxx-xxxx-xxxx.');
      return;
    }
    window.location.href = `/src/${normalized}`;
  };

  return (
    <section className="rounded-xl border border-navy-600/30 bg-navy-900/60 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <h3 className="font-serif text-lg text-gold-400">Enter SRC</h3>
          <p className="mt-1 text-sm text-parchment-500">
            Recall a stamped Soap Recipe Code and its Ingredient List Code.
          </p>
          <input
            value={srcCode}
            onChange={(event) => {
              setSrcCode(event.target.value);
              setMessage(null);
            }}
            placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
            className="mt-3 w-full rounded-lg border border-navy-600/40 bg-navy-800 px-3 py-2 font-mono text-sm text-parchment-200 placeholder-parchment-600 focus:border-gold-500/60 focus:outline-none"
          />
        </div>
        <button
          onClick={submit}
          className="rounded-lg border border-gold-500/20 bg-gold-500/20 px-4 py-2 text-sm font-semibold text-gold-300 hover:bg-gold-500/30"
        >
          Lookup SRC
        </button>
      </div>
      {message && <p className="mt-3 text-sm text-gold-400">{message}</p>}
    </section>
  );
}
```

- [ ] **Step 4: Render lookup on Recipe Cache tab**

In `app/soap-calculator/page.tsx`, add the import:

```typescript
import SrcLookupPanel from './components/SrcLookupPanel';
```

Replace the `activeTab === 'my-recipes'` render block with:

```tsx
        {activeTab === 'my-recipes' && (
          <div className="space-y-6">
            <SrcLookupPanel />
            <SavedRecipesList
              onLoadRecipe={handleLoadSavedRecipe}
              refreshKey={savedRecipesRefreshKey}
              canShare={hasFeature(membership, FEATURE_KEYS.SHARE_LINKS)}
              canPdfExport={hasFeature(membership, FEATURE_KEYS.PDF_EXPORT)}
              canImportExport={hasFeature(membership, FEATURE_KEYS.JSON_IMPORT_EXPORT)}
              canStampSrc={hasFeature(membership, FEATURE_KEYS.SRC_STAMPING)}
              canUpdateSrcRevision={hasFeature(membership, FEATURE_KEYS.SRC_REVISION_UPDATE)}
            />
          </div>
        )}
```

- [ ] **Step 5: Run tests and lint**

Run:

```powershell
npm test
npm run lint
```

Expected: PASS after `SavedRecipesList` props are added in the next task. If TypeScript lint fails because props do not exist yet, complete Task 10 before committing Tasks 9 and 10 together.

---

### Task 10: Add Stamp It Dialog and Saved Recipe Actions

**Files:**
- Create: `app/soap-calculator/components/SrcStampDialog.tsx`
- Modify: `app/soap-calculator/components/SavedRecipesList.tsx`
- Modify: `app/soap-calculator/lib/storage.ts`
- Test: `tests/src-ui-source.test.mjs`

- [ ] **Step 1: Extend UI source test**

Add this test to `tests/src-ui-source.test.mjs`:

```javascript
const stampDialog = readFileSync(new URL('../app/soap-calculator/components/SrcStampDialog.tsx', import.meta.url), 'utf8');
const savedRecipesList = readFileSync(new URL('../app/soap-calculator/components/SavedRecipesList.tsx', import.meta.url), 'utf8');

test('saved recipes expose Stamp It for paid tiers with production warning copy', () => {
  assert.match(stampDialog, /Stamp SRC only when this recipe is ready for production or sale/);
  assert.match(stampDialog, /revisionNotes/);
  assert.match(savedRecipesList, /canStampSrc/);
  assert.match(savedRecipesList, /Stamp It/);
  assert.match(savedRecipesList, /api\\/recipes\\/\\$\\{recipeId\\}\\/src/);
});
```

- [ ] **Step 2: Extend saved recipe storage type**

In `app/soap-calculator/lib/storage.ts`, add these fields to `SavedRecipe`:

```typescript
  srcCode?: string | null;
  ilcCode?: string | null;
  srcRevision?: number | null;
```

In `importRecipesJSON`, add these fields to the imported recipe object:

```typescript
        srcCode: item.srcCode || null,
        ilcCode: item.ilcCode || null,
        srcRevision: item.srcRevision || null,
```

- [ ] **Step 3: Create stamp dialog**

Create `app/soap-calculator/components/SrcStampDialog.tsx`:

```tsx
'use client';

import { useState } from 'react';

interface SrcStampDialogProps {
  recipeName: string;
  mode: 'new-src' | 'same-src';
  canUpdateSrcRevision: boolean;
  onCancel: () => void;
  onConfirm: (input: { mode: 'new-src' | 'same-src'; revisionNotes: string }) => Promise<void>;
}

export default function SrcStampDialog({
  recipeName,
  mode,
  canUpdateSrcRevision,
  onCancel,
  onConfirm,
}: SrcStampDialogProps) {
  const [revisionNotes, setRevisionNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const isSameSrc = mode === 'same-src';

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm({ mode, revisionNotes });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/80 px-4">
      <div className="w-full max-w-lg rounded-xl border border-gold-500/20 bg-navy-950 p-6 shadow-2xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-gold-500/70">Production Stamp</p>
        <h2 className="mt-2 font-serif text-2xl text-gold-300">{isSameSrc ? 'Update Same SRC' : 'Stamp It'}</h2>
        <p className="mt-3 text-sm text-parchment-300">{recipeName}</p>

        <div className="mt-4 rounded-lg border border-gold-500/20 bg-gold-500/10 p-4 text-sm text-parchment-300">
          {isSameSrc ? (
            <p>
              Updating this SRC changes the active production recipe shown when this code is recalled or scanned.
              Previous revisions remain archived for traceability. Use Stamp New SRC instead if this is a new product or meaningfully different formula.
            </p>
          ) : (
            <p>
              Stamp SRC only when this recipe is ready for production or sale. Stamping freezes this recipe version and generates a permanent SRC, ILC, and QR code.
              Future recipe edits will not change this stamped release.
            </p>
          )}
        </div>

        {(isSameSrc || canUpdateSrcRevision) && (
          <label className="mt-4 block">
            <span className="text-xs font-medium text-parchment-400">Revision Notes</span>
            <textarea
              value={revisionNotes}
              onChange={(event) => setRevisionNotes(event.target.value)}
              rows={3}
              placeholder="Example: Changed olive oil from 35% to 33%, reduced fragrance load, adjusted water ratio."
              className="mt-2 w-full rounded-lg border border-navy-600/40 bg-navy-900 px-3 py-2 text-sm text-parchment-200 placeholder-parchment-600 focus:border-gold-500/60 focus:outline-none"
            />
          </label>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-parchment-300 hover:bg-navy-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={busy}
            className="rounded-lg border border-gold-500/20 bg-gold-500/20 px-4 py-2 text-sm font-semibold text-gold-300 hover:bg-gold-500/30 disabled:opacity-50"
          >
            {busy ? 'Stamping...' : isSameSrc ? 'Update Same SRC' : 'Stamp It'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add props and stamp state to SavedRecipesList**

In `SavedRecipesListProps`, add:

```typescript
  canStampSrc: boolean;
  canUpdateSrcRevision: boolean;
```

In the component parameter list, add both props.

Add state:

```typescript
  const [stampRecipe, setStampRecipe] = useState<SavedRecipe | null>(null);
  const [stampMode, setStampMode] = useState<'new-src' | 'same-src'>('new-src');
```

Add handler:

```typescript
  const handleStamp = async (input: { mode: 'new-src' | 'same-src'; revisionNotes: string }) => {
    if (!stampRecipe) return;
    if (!canStampSrc) {
      setVaultMsg('Upgrade to Plus or Pro to stamp Soap Recipe Codes.');
      setTimeout(() => setVaultMsg(null), 4000);
      return;
    }

    const vaultRecipe = await ensureVaultRecipe(stampRecipe);
    if (!vaultRecipe?.cloudRecipeId) return;

    try {
      const recipeId = vaultRecipe.cloudRecipeId;
      const response = await fetch(`/api/recipes/${recipeId}/src`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: input.mode,
          existingSrcCode: input.mode === 'same-src' ? stampRecipe.srcCode : undefined,
          revisionNotes: input.revisionNotes,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setVaultMsg(data.error || 'Unable to stamp this recipe yet.');
        return;
      }
      const release = data.release;
      updateRecipe(stampRecipe.id, {
        srcCode: release.publication.srcCode,
        ilcCode: release.ilc.ilcCode,
        srcRevision: release.revision.revisionNumber,
      });
      setRecipes(loadRecipes());
      setVaultMsg(`Stamped SRC ${release.publication.srcCode}.`);
      setStampRecipe(null);
    } catch {
      setVaultMsg('Unable to stamp this recipe right now.');
    } finally {
      setTimeout(() => setVaultMsg(null), 5000);
    }
  };
```

- [ ] **Step 5: Add Stamp It buttons to recipe cards**

In each recipe card action area, add a third row below Share/PDF:

```tsx
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setStampRecipe(recipe);
                      setStampMode('new-src');
                    }}
                    disabled={!canStampSrc}
                    className="flex-1 rounded-lg border border-gold-500/20 bg-gold-500/20 py-2 text-xs font-medium text-gold-300 transition-colors hover:bg-gold-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {canStampSrc ? 'Stamp It' : 'Plus Stamp'}
                  </button>
                  {recipe.srcCode && canUpdateSrcRevision && (
                    <button
                      onClick={() => {
                        setStampRecipe(recipe);
                        setStampMode('same-src');
                      }}
                      className="flex-1 rounded-lg border border-navy-600/30 bg-navy-800/60 py-2 text-xs font-medium text-parchment-400 transition-colors hover:text-gold-300"
                    >
                      Update SRC
                    </button>
                  )}
                </div>
                {recipe.srcCode && (
                  <div className="mt-2 rounded-lg bg-navy-800/50 px-3 py-2 text-[10px] text-parchment-500">
                    <span className="font-mono text-gold-400">{recipe.srcCode}</span>
                    {recipe.ilcCode && <span> · {recipe.ilcCode}</span>}
                    {recipe.srcRevision && <span> · Rev {recipe.srcRevision}</span>}
                  </div>
                )}
```

Render the dialog at the bottom of the component before the closing wrapper:

```tsx
      {stampRecipe && (
        <SrcStampDialog
          recipeName={stampRecipe.name}
          mode={stampMode}
          canUpdateSrcRevision={canUpdateSrcRevision}
          onCancel={() => setStampRecipe(null)}
          onConfirm={handleStamp}
        />
      )}
```

Add import:

```typescript
import SrcStampDialog from './SrcStampDialog';
```

- [ ] **Step 6: Run tests and lint**

Run:

```powershell
npm test
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit UI stamping**

Run:

```powershell
git add app/soap-calculator/components/SrcStampDialog.tsx app/soap-calculator/components/SavedRecipesList.tsx app/soap-calculator/components/SrcLookupPanel.tsx app/soap-calculator/lib/storage.ts app/soap-calculator/page.tsx tests/src-ui-source.test.mjs
git commit -m "feat: add SRC lookup and stamping UI"
```

---

### Task 11: Add Owner Clone and Pro Re-open Follow-Through

**Files:**
- Modify: `app/src/[srcCode]/page.tsx`
- Modify: `app/soap-calculator/page.tsx`
- Modify: `app/soap-calculator/lib/storage.ts`
- Test: `tests/src-public-page.test.mjs`

- [ ] **Step 1: Add page-source expectations**

Extend `tests/src-public-page.test.mjs`:

```javascript
test('public SRC page exposes clone link payload for Soap Abacus', () => {
  assert.match(pageSource, /Clone to My Recipes/);
  assert.match(pageSource, /srcCode=/);
});
```

- [ ] **Step 2: Add clone link to SRC page**

In `app/src/[srcCode]/page.tsx`, add this link below the ILC section:

```tsx
          <section className="mt-8">
            <Link
              href={`/soap-calculator?srcCode=${publication.srcCode}`}
              className="inline-flex rounded-lg border border-gold-500/20 bg-gold-500/20 px-4 py-2 text-sm font-semibold text-gold-300 hover:bg-gold-500/30"
            >
              Clone to My Recipes
            </Link>
          </section>
```

- [ ] **Step 3: Add query-string load behavior**

In `app/soap-calculator/page.tsx`, import `useSearchParams`:

```typescript
import { useSearchParams } from 'next/navigation';
```

Inside `SoapStudioGate`, read `srcCode` and pass it into `SoapCalculatorExperience`:

```typescript
  const searchParams = useSearchParams();
  const srcCode = searchParams.get('srcCode');
```

Extend `SoapCalculatorExperience` props:

```typescript
  cloneSrcCode?: string | null;
```

Add a `useEffect` inside `SoapCalculatorExperience`:

```typescript
  useEffect(() => {
    if (!cloneSrcCode || isReadOnlyPreview) return;
    let cancelled = false;
    async function loadSrcClone() {
      try {
        const response = await fetch(`/api/src/${cloneSrcCode}`);
        const data = await response.json();
        const recipe = data.release?.revision?.recipeSnapshot;
        if (!response.ok || !recipe || cancelled) return;
        setRecipeOils((recipe.oils || []).map((oil: { oilId?: string; percent?: number }) => ({
          oilId: oil.oilId || 'olive',
          percent: Number(oil.percent || 0),
        })));
        setRecipeName(`${recipe.name || 'SRC Recipe'} copy`);
        setRecipeNotes(recipe.notes || '');
        setCalculatorMode(recipe.mode || 'intermediate');
        setLoadedRecipeId(null);
        setActiveTab('calculator');
        showToast('SRC release cloned as an editable draft.');
      } catch {
        showToast('Unable to clone this SRC release.');
      }
    }
    void loadSrcClone();
    return () => {
      cancelled = true;
    };
  }, [cloneSrcCode, isReadOnlyPreview, showToast]);
```

- [ ] **Step 4: Run tests, lint, and build**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit clone flow**

Run:

```powershell
git add 'app/src/[srcCode]/page.tsx' app/soap-calculator/page.tsx tests/src-public-page.test.mjs
git commit -m "feat: clone SRC releases into Soap Abacus"
```

---

### Task 12: Manual Verification

**Files:**
- No code changes unless verification finds a defect.

- [ ] **Step 1: Start local dev server**

Run:

```powershell
npm run dev -- --port 3001
```

Expected:

```text
Local: http://localhost:3001
```

- [ ] **Step 2: Verify Free UI**

Open:

```text
http://localhost:3001/soap-calculator
```

Expected:

- Free signed-in membership shows `Save`.
- Free does not show enabled `Stamp It`.
- `Enter SRC` lookup panel is visible in Recipe Cache.

- [ ] **Step 3: Verify paid UI gates with controlled membership state**

Use the existing membership preview/test setup or a development account with Plus/Pro records.

Expected:

- Plus shows `Save` and `Stamp It`.
- Plus does not show `Update SRC`.
- Pro shows `Save`, `Stamp It`, and `Update SRC` after a recipe has an SRC.

- [ ] **Step 4: Verify API gates**

Use authenticated browser actions or route calls from the app UI.

Expected:

- Free stamp attempt returns `402`.
- Plus new SRC stamp returns release data.
- Plus same-SRC update returns `402`.
- Pro same-SRC update returns a new revision number and same SRC.

- [ ] **Step 5: Verify public release and QR**

Open a stamped SRC URL:

```text
http://localhost:3001/src/<SRC_CODE>
```

Expected:

- Page renders recipe title, SRC, revision number, latest release notes, ILC, ingredients, and QR image.
- Page does not show supplier price, internal costs, or margin data.

Open:

```text
http://localhost:3001/api/src/<SRC_CODE>/qr
```

Expected:

- Response is SVG.
- QR encodes `/src/<SRC_CODE>`.

- [ ] **Step 6: Final verification commands**

Run:

```powershell
npm test
npm run lint
npm run build
git status --short
```

Expected:

- Tests pass.
- Lint passes.
- Build passes.
- Git status only shows intended changes or is clean after commits.

---

## Implementation Order

Use this order:

1. Dependencies.
2. Membership gates.
3. Model helpers.
4. Schema.
5. Persistence.
6. Service.
7. API.
8. Public page.
9. Lookup UI.
10. Stamp UI.
11. Clone/re-open follow-through.
12. Manual verification.

This order keeps the lower layers testable before UI work begins and prevents the UI from calling incomplete APIs.
