import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId, isClerkConfigured } from '@/app/lib/auth';
import {
  isRecipeVaultConfigured,
  listRecipesForUser,
  saveRecipeSnapshot,
} from '@/app/lib/recipe-vault';
import {
  canSaveRecipeForMembership,
  getCurrentSoapAbacusMembership,
} from '@/app/lib/soap-abacus-membership';
import { buildRecipeSnapshot } from '@/app/soap-calculator/studio/recipe-studio-model';

export const runtime = 'nodejs';

export async function GET() {
  const setup = await getVaultSetup();
  if (!setup.ok) return setup.response;

  const recipes = await listRecipesForUser(setup.userId);
  return NextResponse.json({ recipes });
}

export async function POST(request: NextRequest) {
  const setup = await getVaultSetup();
  if (!setup.ok) return setup.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid recipe payload.' }, { status: 400 });
  }

  const snapshot = buildRecipeSnapshot({
    ...body,
    ownerId: setup.userId,
    visibility: 'private',
  });

  const membershipSetup = await getCurrentSoapAbacusMembership();
  if (!membershipSetup.ok) return membershipSetup.response;

  const existingRecipes = await listRecipesForUser(setup.userId);
  const isExistingRecipe = existingRecipes.some((recipe) => recipe.id === snapshot.id);
  const saveDecision = canSaveRecipeForMembership(
    membershipSetup.membership,
    isExistingRecipe ? Math.max(0, existingRecipes.length - 1) : existingRecipes.length,
  );
  if (!saveDecision.ok) {
    return NextResponse.json({ error: saveDecision.reason, membership: membershipSetup.membership }, { status: 402 });
  }

  const recipe = await saveRecipeSnapshot(snapshot, setup.userId);
  return NextResponse.json({ recipe });
}

async function getVaultSetup(): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  if (!isClerkConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Recipe vault accounts are not configured yet. Add Clerk environment variables.' },
        { status: 503 },
      ),
    };
  }

  if (!isRecipeVaultConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Recipe vault database is not configured yet. Add DATABASE_URL.' },
        { status: 503 },
      ),
    };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Sign in to use My Recipes.' }, { status: 401 }),
    };
  }

  return { ok: true, userId };
}
