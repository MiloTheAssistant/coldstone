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

type RevisionWithCodes = RecipePublicationRevisionRecord & {
  srcCode: string;
  ilcCode: string;
};

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
    return stampSameSrcRevision(input, recipe);
  }

  return stampNewSrc(input, recipe);
}

export function decorateRelease(release: PublishedRecipeRelease | null, origin: string) {
  if (!release) return null;

  return {
    ...release,
    url: buildSrcReleaseUrl(origin, release.publication.srcCode),
    qrUrl: `/api/src/${release.publication.srcCode}/qr`,
  };
}

export function decoratePublicRelease(release: PublishedRecipeRelease | null, origin: string) {
  if (!release) return null;

  return {
    publication: {
      srcCode: release.publication.srcCode,
      title: release.publication.title,
      status: release.publication.status,
      createdAt: release.publication.createdAt,
      updatedAt: release.publication.updatedAt,
    },
    revision: {
      revisionNumber: release.revision.revisionNumber,
      releaseNotesPublic: release.revision.releaseNotesPublic,
      createdAt: release.revision.createdAt,
      recipe: decoratePublicRecipe(release.revision.recipeSnapshot),
    },
    ilc: {
      ilcCode: release.ilc.ilcCode,
      ingredients: decoratePublicEntries(release.ilc.ingredients),
    },
    url: buildSrcReleaseUrl(origin, release.publication.srcCode),
    qrUrl: `/api/src/${release.publication.srcCode}/qr`,
  };
}

function decoratePublicRecipe(recipe: RecipeSnapshot) {
  return {
    name: recipe.name,
    slug: recipe.slug,
    mode: recipe.mode,
    oils: decoratePublicEntries(recipe.oils),
    liquids: decoratePublicEntries(recipe.liquids),
    fragrances: decoratePublicEntries(recipe.fragrances),
    additives: decoratePublicEntries(recipe.additives),
  };
}

function decoratePublicEntries(value: unknown): PublicIngredientEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((entry) => ({
    ingredientType: readString(entry.ingredientType),
    ingredientId: readString(entry.ingredientId),
    displayName: readString(entry.displayName),
    name: readString(entry.name),
    oilId: readString(entry.oilId),
    liquidId: readString(entry.liquidId),
    fragranceId: readString(entry.fragranceId),
    additiveId: readString(entry.additiveId),
    percent: readNumber(entry.percent),
    usagePercent: readNumber(entry.usagePercent),
    weight: readNumber(entry.weight),
    unit: readString(entry.unit),
  }));
}

type PublicIngredientEntry = {
  ingredientType?: string;
  ingredientId?: string;
  displayName?: string;
  name?: string;
  oilId?: string;
  liquidId?: string;
  fragranceId?: string;
  additiveId?: string;
  percent?: number;
  usagePercent?: number;
  weight?: number;
  unit?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function readNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

async function stampSameSrcRevision(input: StampRecipeInput, recipe: RecipeSnapshot) {
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

  const revision = makeRevision(
    existing.publication,
    recipe,
    input.ownerId,
    existing.revision.revisionNumber + 1,
    input.revisionNotes,
  );
  const ilc = makeIlc(revision);

  try {
    await addRecipePublicationRevision({ publicationId: existing.publication.id, revision, ilc });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: 'This SRC was updated by another request. Reload the SRC and try again.' },
          { status: 409 },
        ),
      };
    }
    throw error;
  }

  const release = await getRecipePublicationBySrcCode(existing.publication.srcCode);
  return buildReleaseResult(release, input.origin);
}

async function stampNewSrc(input: StampRecipeInput, recipe: RecipeSnapshot) {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const srcCode = createSrcCode();
    const existing = await getRecipePublicationBySrcCode(srcCode);
    if (existing) continue;

    const publication = makePublication(recipe, input.ownerId, srcCode);
    const revision = makeRevision(publication, recipe, input.ownerId, 1, input.revisionNotes);
    const ilc = makeIlc(revision);

    try {
      await createRecipePublication({ publication, revision, ilc });
    } catch (error) {
      if (isUniqueConstraintError(error)) continue;
      throw error;
    }

    const release = await getRecipePublicationBySrcCode(srcCode);
    return buildReleaseResult(release, input.origin);
  }

  return {
    ok: false as const,
    response: NextResponse.json({ error: 'Unable to generate a unique SRC. Please try again.' }, { status: 500 }),
  };
}

function buildReleaseResult(release: PublishedRecipeRelease | null, origin: string) {
  const decorated = decorateRelease(release, origin);
  if (!decorated) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'SRC publication was saved but could not be loaded.' }, { status: 500 }),
    };
  }

  return { ok: true as const, release: decorated };
}

function isUniqueConstraintError(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as { code?: unknown; message?: unknown };
  if (candidate.code === '23505') return true;

  const message = typeof candidate.message === 'string' ? candidate.message.toLowerCase() : '';
  return message.includes('unique') || message.includes('duplicate key');
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
): RevisionWithCodes {
  return buildPublicationRevision({
    publicationId: publication.id,
    revisionId: createStableId('pubrev'),
    srcCode: publication.srcCode,
    ilcCode: createIlcCode(),
    recipe,
    ownerId,
    revisionNumber,
    revisionNotes,
  }) as RevisionWithCodes;
}

function makeIlc(revision: RevisionWithCodes): IngredientListCodeRecord {
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
