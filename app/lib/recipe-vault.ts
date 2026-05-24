import { neon, type NeonQueryFunction, type NeonQueryFunctionInTransaction } from '@neondatabase/serverless';

export interface RecipeSnapshot {
  id: string;
  versionId: string;
  previousVersionId?: string | null;
  ownerId: string | null;
  name: string;
  slug: string;
  description: string;
  mode: 'easy' | 'intermediate' | 'expert';
  visibility: 'private' | 'public';
  version: number;
  oils: unknown[];
  liquids: unknown[];
  fragrances: unknown[];
  additives: unknown[];
  costs: unknown[];
  pricing: unknown;
  notes: string;
  processSteps: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface ShareLinkRecord {
  id: string;
  recipeId: string;
  versionId: string;
  token: string;
  permission: 'read';
  url: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
}

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

export interface MonthlyQuotaPublicationResult {
  created: boolean;
  monthlyCount: number;
}

export interface SoapAbacusMembershipRecord {
  userId: string;
  tier: 'free' | 'plus' | 'pro';
  status: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  trialType?: string | null;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  trialUsedAt?: string | null;
  currentPeriodEndsAt?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserIngredientCostRecord {
  id: string;
  userId: string;
  ingredientId: string;
  ingredientType: string;
  supplier?: string | null;
  pricePerUnit: number;
  unitSize: number;
  unit: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

let sqlClient: NeonQueryFunction<false, false> | null = null;

export function isRecipeVaultConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }
  if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL);
  return sqlClient;
}

export async function listRecipesForUser(ownerId: string) {
  const sql = getSql();
  const rows = await sql`
    select snapshot
    from recipes
    where owner_id = ${ownerId}
    order by updated_at desc
  `;
  return rows.map((row) => row.snapshot as RecipeSnapshot);
}

export async function getSoapAbacusMembershipForUser(userId: string) {
  const sql = getSql();
  const rows = await sql`
    select *
    from soap_abacus_memberships
    where user_id = ${userId}
    limit 1
  `;
  const row = rows[0];
  return row ? mapMembershipRow(row) : null;
}

export async function getSoapAbacusMembershipByStripeCustomer(stripeCustomerId: string) {
  const sql = getSql();
  const rows = await sql`
    select *
    from soap_abacus_memberships
    where stripe_customer_id = ${stripeCustomerId}
    limit 1
  `;
  const row = rows[0];
  return row ? mapMembershipRow(row) : null;
}

export async function upsertSoapAbacusMembership(record: SoapAbacusMembershipRecord) {
  const sql = getSql();
  const now = new Date().toISOString();
  const updatedAt = record.updatedAt || now;
  await sql`
    insert into soap_abacus_memberships (
      user_id, tier, status, stripe_customer_id, stripe_subscription_id, stripe_price_id,
      trial_type, trial_started_at, trial_ends_at, trial_used_at, current_period_ends_at,
      source, metadata, created_at, updated_at
    )
    values (
      ${record.userId}, ${record.tier}, ${record.status}, ${record.stripeCustomerId || null},
      ${record.stripeSubscriptionId || null}, ${record.stripePriceId || null},
      ${record.trialType || null}, ${record.trialStartedAt || null}, ${record.trialEndsAt || null},
      ${record.trialUsedAt || null}, ${record.currentPeriodEndsAt || null},
      ${record.source || 'app'}, ${JSON.stringify(record.metadata || {})}, ${record.createdAt || now}, ${updatedAt}
    )
    on conflict (user_id) do update set
      tier = excluded.tier,
      status = excluded.status,
      stripe_customer_id = coalesce(excluded.stripe_customer_id, soap_abacus_memberships.stripe_customer_id),
      stripe_subscription_id = coalesce(excluded.stripe_subscription_id, soap_abacus_memberships.stripe_subscription_id),
      stripe_price_id = coalesce(excluded.stripe_price_id, soap_abacus_memberships.stripe_price_id),
      trial_type = coalesce(excluded.trial_type, soap_abacus_memberships.trial_type),
      trial_started_at = coalesce(excluded.trial_started_at, soap_abacus_memberships.trial_started_at),
      trial_ends_at = coalesce(excluded.trial_ends_at, soap_abacus_memberships.trial_ends_at),
      trial_used_at = coalesce(excluded.trial_used_at, soap_abacus_memberships.trial_used_at),
      current_period_ends_at = coalesce(excluded.current_period_ends_at, soap_abacus_memberships.current_period_ends_at),
      source = excluded.source,
      metadata = excluded.metadata,
      updated_at = excluded.updated_at
  `;
  return getSoapAbacusMembershipForUser(record.userId);
}

export async function listUserIngredientCosts(userId: string) {
  const sql = getSql();
  const rows = await sql`
    select *
    from user_ingredient_costs
    where user_id = ${userId}
    order by ingredient_id asc
  `;
  return rows.map(mapIngredientCostRow);
}

export async function upsertUserIngredientCost(record: UserIngredientCostRecord) {
  const sql = getSql();
  const now = new Date().toISOString();
  const updatedAt = record.updatedAt || now;
  await sql`
    insert into user_ingredient_costs (
      id, user_id, ingredient_id, ingredient_type, supplier, price_per_unit,
      unit_size, unit, notes, metadata, created_at, updated_at
    )
    values (
      ${record.id}, ${record.userId}, ${record.ingredientId}, ${record.ingredientType || 'oil'},
      ${record.supplier || null}, ${record.pricePerUnit || 0}, ${record.unitSize || 0},
      ${record.unit || 'oz'}, ${record.notes || ''}, ${JSON.stringify(record.metadata || {})},
      ${record.createdAt || now}, ${updatedAt}
    )
    on conflict (user_id, ingredient_id) do update set
      supplier = excluded.supplier,
      price_per_unit = excluded.price_per_unit,
      unit_size = excluded.unit_size,
      unit = excluded.unit,
      notes = excluded.notes,
      metadata = excluded.metadata,
      updated_at = excluded.updated_at
  `;
  return record;
}

export async function deleteUserIngredientCost(userId: string, ingredientId: string) {
  const sql = getSql();
  await sql`
    delete from user_ingredient_costs
    where user_id = ${userId} and ingredient_id = ${ingredientId}
  `;
}

export async function getRecipeForUser(recipeId: string, ownerId: string) {
  const sql = getSql();
  const rows = await sql`
    select snapshot
    from recipes
    where id = ${recipeId} and owner_id = ${ownerId}
    limit 1
  `;
  return (rows[0]?.snapshot as RecipeSnapshot | undefined) || null;
}

export async function saveRecipeSnapshot(snapshot: RecipeSnapshot, ownerId: string) {
  const sql = getSql();
  const recipe = { ...snapshot, ownerId, visibility: snapshot.visibility || 'private' };

  await sql`
    insert into recipes (
      id, owner_id, name, slug, description, mode, visibility, current_version_id, snapshot, created_at, updated_at
    )
    values (
      ${recipe.id}, ${ownerId}, ${recipe.name}, ${recipe.slug}, ${recipe.description}, ${recipe.mode},
      ${recipe.visibility}, ${recipe.versionId}, ${JSON.stringify(recipe)}, ${recipe.createdAt}, ${recipe.updatedAt}
    )
    on conflict (id) do update set
      name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      mode = excluded.mode,
      visibility = excluded.visibility,
      current_version_id = excluded.current_version_id,
      snapshot = excluded.snapshot,
      updated_at = excluded.updated_at
  `;

  await sql`
    insert into recipe_versions (
      id, recipe_id, version, previous_version_id, editor_id, snapshot, created_at
    )
    values (
      ${recipe.versionId}, ${recipe.id}, ${recipe.version}, ${recipe.previousVersionId || null},
      ${ownerId}, ${JSON.stringify(recipe)}, ${recipe.updatedAt}
    )
    on conflict (id) do nothing
  `;

  await replaceRecipeDetails(recipe);
  return recipe;
}

export async function createShareLinkRecord(share: ShareLinkRecord, ownerId: string) {
  const sql = getSql();
  await sql`
    insert into share_links (
      id, recipe_id, version_id, token, permission, created_by, created_at, expires_at, revoked_at
    )
    values (
      ${share.id}, ${share.recipeId}, ${share.versionId}, ${share.token}, ${share.permission},
      ${ownerId}, ${share.createdAt}, ${share.expiresAt}, ${share.revokedAt}
    )
    on conflict (token) do update set revoked_at = null
  `;
  return share;
}

export async function getSharedRecipe(token: string) {
  const sql = getSql();
  const rows = await sql`
    select r.snapshot, s.token, s.permission, s.revoked_at, s.expires_at
    from share_links s
    join recipes r on r.id = s.recipe_id
    where s.token = ${token}
    limit 1
  `;

  const row = rows[0];
  if (!row || row.revoked_at) return null;
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return null;
  if (row.permission !== 'read') return null;
  return row.snapshot as RecipeSnapshot;
}

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
    join recipe_publication_revisions r on r.id = p.current_revision_id and r.publication_id = p.id
    join ingredient_list_codes i on i.revision_id = r.id and i.publication_id = p.id
    where p.src_code = ${srcCode}
      and p.status = 'active'
      and r.active = true
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
        null, ${input.publication.srcCode}, ${input.publication.status},
        ${input.publication.title}, ${input.publication.slug}, ${JSON.stringify(input.publication.metadata || {})},
        ${input.publication.createdAt}, ${input.publication.updatedAt}
      )
    `,
    buildInsertPublicationRevisionQuery(tx, input.revision),
    buildInsertIngredientListCodeQuery(tx, input.ilc),
    tx`
      update recipe_publications
      set current_revision_id = ${input.revision.id}, updated_at = ${input.revision.createdAt}
      where id = ${input.publication.id}
    `,
  ]);
  return input;
}

export async function createRecipePublicationWithinMonthlyQuota(input: {
  publication: RecipePublicationRecord;
  revision: RecipePublicationRevisionRecord;
  ilc: IngredientListCodeRecord;
  monthlyLimit: number;
  now?: Date;
}): Promise<MonthlyQuotaPublicationResult> {
  const sql = getSql();
  const now = input.now || new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
  const lockKey = `${input.publication.ownerId}:src:${start}`;

  const rows = await sql`
    with quota_lock as (
      select pg_advisory_xact_lock(hashtext(${lockKey}))
    ),
    monthly_count as (
      select count(*)::int as count
      from recipe_publications
      where owner_id = ${input.publication.ownerId}
        and created_at >= ${start}
        and created_at < ${end}
        and exists (select 1 from quota_lock)
    ),
    inserted_publication as (
      insert into recipe_publications (
        id, owner_id, recipe_id, current_revision_id, src_code, status, title, slug, metadata, created_at, updated_at
      )
      select
        ${input.publication.id}, ${input.publication.ownerId}, ${input.publication.recipeId},
        null, ${input.publication.srcCode}, ${input.publication.status},
        ${input.publication.title}, ${input.publication.slug}, ${JSON.stringify(input.publication.metadata || {})},
        ${input.publication.createdAt}, ${input.publication.updatedAt}
      where (select count from monthly_count) < ${input.monthlyLimit}
      returning id
    ),
    inserted_revision as (
      insert into recipe_publication_revisions (
        id, publication_id, recipe_id, recipe_version_id, owner_id, revision_number, revision_notes,
        release_notes_public, recipe_snapshot, ingredient_list_snapshot, active, created_at
      )
      select
        ${input.revision.id}, ${input.revision.publicationId}, ${input.revision.recipeId},
        ${input.revision.recipeVersionId}, ${input.revision.ownerId}, ${input.revision.revisionNumber},
        ${input.revision.revisionNotes}, ${input.revision.releaseNotesPublic},
        ${JSON.stringify(input.revision.recipeSnapshot)}, ${JSON.stringify(input.revision.ingredientListSnapshot)},
        ${input.revision.active}, ${input.revision.createdAt}
      from inserted_publication
      returning id
    ),
    inserted_ilc as (
      insert into ingredient_list_codes (
        id, publication_id, revision_id, owner_id, ilc_code, ingredients, metadata, created_at
      )
      select
        ${input.ilc.id}, ${input.ilc.publicationId}, ${input.ilc.revisionId}, ${input.ilc.ownerId},
        ${input.ilc.ilcCode}, ${JSON.stringify(input.ilc.ingredients)}, ${JSON.stringify(input.ilc.metadata || {})},
        ${input.ilc.createdAt}
      from inserted_revision
      returning id
    ),
    updated_publication as (
      update recipe_publications
      set current_revision_id = ${input.revision.id}, updated_at = ${input.revision.createdAt}
      where id = ${input.publication.id}
        and exists (select 1 from inserted_revision)
        and exists (select 1 from inserted_ilc)
      returning id
    )
    select
      (select count from monthly_count)::int as monthly_count,
      exists(select 1 from updated_publication) as created
  `;

  return {
    created: rows[0]?.created === true,
    monthlyCount: Number(rows[0]?.monthly_count || 0),
  };
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

function buildInsertPublicationRevisionQuery(
  sql: NeonQueryFunctionInTransaction<false, false>,
  revision: RecipePublicationRevisionRecord,
) {
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

function buildInsertIngredientListCodeQuery(
  sql: NeonQueryFunctionInTransaction<false, false>,
  ilc: IngredientListCodeRecord,
) {
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

export async function recordPdfExport(input: {
  id: string;
  recipeId: string;
  versionId: string;
  ownerId: string;
  fileUrl: string | null;
  fileName: string;
}) {
  const sql = getSql();
  await sql`
    insert into pdf_exports (id, recipe_id, version_id, owner_id, file_url, file_name)
    values (${input.id}, ${input.recipeId}, ${input.versionId}, ${input.ownerId}, ${input.fileUrl}, ${input.fileName})
  `;
}

async function replaceRecipeDetails(recipe: RecipeSnapshot) {
  const sql = getSql();
  await sql`delete from recipe_ingredients where recipe_id = ${recipe.id}`;
  await sql`delete from recipe_costs where recipe_id = ${recipe.id}`;
  await sql`delete from recipe_fragrances where recipe_id = ${recipe.id}`;

  for (const [index, oil] of (recipe.oils || []).entries()) {
    const candidate = oil as { oilId?: string; name?: string; percent?: number; weight?: number; unit?: string };
    await sql`
      insert into recipe_ingredients (id, recipe_id, ingredient_type, ingredient_id, display_name, percent, weight, unit, metadata)
      values (
        ${`${recipe.id}_oil_${index}`}, ${recipe.id}, 'oil', ${candidate.oilId || `oil-${index}`},
        ${candidate.name || candidate.oilId || `Oil ${index + 1}`}, ${candidate.percent || null},
        ${candidate.weight || null}, ${candidate.unit || null}, ${JSON.stringify(candidate)}
      )
    `;
  }

  for (const [index, cost] of (recipe.costs || []).entries()) {
    const candidate = cost as { ingredientId?: string; supplier?: string; pricePerUnit?: number; unitSize?: number; unit?: string };
    await sql`
      insert into recipe_costs (id, recipe_id, ingredient_id, supplier, price_per_unit, unit_size, unit, metadata)
      values (
        ${`${recipe.id}_cost_${index}`}, ${recipe.id}, ${candidate.ingredientId || `ingredient-${index}`},
        ${candidate.supplier || null}, ${candidate.pricePerUnit || 0}, ${candidate.unitSize || 0},
        ${candidate.unit || 'oz'}, ${JSON.stringify(candidate)}
      )
    `;
  }

  for (const [index, fragrance] of (recipe.fragrances || []).entries()) {
    const candidate = fragrance as { fragranceId?: string; usagePercent?: number; cost?: number };
    await sql`
      insert into recipe_fragrances (id, recipe_id, fragrance_id, usage_percent, cost, metadata)
      values (
        ${`${recipe.id}_fragrance_${index}`}, ${recipe.id}, ${candidate.fragranceId || `fragrance-${index}`},
        ${candidate.usagePercent || 0}, ${candidate.cost || 0}, ${JSON.stringify(candidate)}
      )
    `;
  }
}

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

function mapMembershipRow(row: Record<string, unknown>): SoapAbacusMembershipRecord {
  return {
    userId: String(row.user_id),
    tier: (row.tier === 'plus' || row.tier === 'pro' ? row.tier : 'free') as 'free' | 'plus' | 'pro',
    status: String(row.status || 'free'),
    stripeCustomerId: (row.stripe_customer_id as string | null) || null,
    stripeSubscriptionId: (row.stripe_subscription_id as string | null) || null,
    stripePriceId: (row.stripe_price_id as string | null) || null,
    trialType: (row.trial_type as string | null) || null,
    trialStartedAt: row.trial_started_at ? new Date(row.trial_started_at as string).toISOString() : null,
    trialEndsAt: row.trial_ends_at ? new Date(row.trial_ends_at as string).toISOString() : null,
    trialUsedAt: row.trial_used_at ? new Date(row.trial_used_at as string).toISOString() : null,
    currentPeriodEndsAt: row.current_period_ends_at ? new Date(row.current_period_ends_at as string).toISOString() : null,
    source: (row.source as string | null) || 'app',
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: row.created_at ? new Date(row.created_at as string).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at as string).toISOString() : undefined,
  };
}

function mapIngredientCostRow(row: Record<string, unknown>): UserIngredientCostRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    ingredientId: String(row.ingredient_id),
    ingredientType: String(row.ingredient_type || 'oil'),
    supplier: (row.supplier as string | null) || null,
    pricePerUnit: Number(row.price_per_unit || 0),
    unitSize: Number(row.unit_size || 0),
    unit: String(row.unit || 'oz'),
    notes: String(row.notes || ''),
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: row.created_at ? new Date(row.created_at as string).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at as string).toISOString() : undefined,
  };
}
