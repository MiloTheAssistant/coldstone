import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

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
