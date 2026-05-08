import { NextRequest, NextResponse } from 'next/server';
import {
  FEATURE_KEYS,
  requireSoapAbacusFeature,
} from '@/app/lib/soap-abacus-membership';
import {
  deleteUserIngredientCost,
  isRecipeVaultConfigured,
  listUserIngredientCosts,
  upsertUserIngredientCost,
} from '@/app/lib/recipe-vault';

export const runtime = 'nodejs';

export async function GET() {
  const setup = await requireSoapAbacusFeature(FEATURE_KEYS.INGREDIENT_COSTS);
  if (!setup.ok) return setup.response;

  if (!isRecipeVaultConfigured()) {
    return NextResponse.json({ costs: [], databaseReady: false });
  }

  const costs = await listUserIngredientCosts(setup.userId);
  return NextResponse.json({ costs, databaseReady: true });
}

export async function POST(request: NextRequest) {
  const setup = await requireSoapAbacusFeature(FEATURE_KEYS.INGREDIENT_COSTS);
  if (!setup.ok) return setup.response;

  if (!isRecipeVaultConfigured()) {
    return NextResponse.json({ error: 'DATABASE_URL is required to save ingredient costs.' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid ingredient cost payload.' }, { status: 400 });
  }

  const ingredientId = typeof body.ingredientId === 'string' ? body.ingredientId : '';
  const pricePerUnit = Number(body.pricePerUnit);
  const unitSize = Number(body.unitSize);
  const unit = typeof body.unit === 'string' ? body.unit : 'oz';

  if (!ingredientId || !Number.isFinite(pricePerUnit) || !Number.isFinite(unitSize) || pricePerUnit <= 0 || unitSize <= 0) {
    return NextResponse.json({ error: 'Ingredient id, price, size, and unit are required.' }, { status: 400 });
  }

  const cost = await upsertUserIngredientCost({
    id: `${setup.userId}_${ingredientId}`,
    userId: setup.userId,
    ingredientId,
    ingredientType: typeof body.ingredientType === 'string' ? body.ingredientType : 'oil',
    supplier: typeof body.supplier === 'string' ? body.supplier : null,
    pricePerUnit,
    unitSize,
    unit,
    notes: typeof body.notes === 'string' ? body.notes : '',
    metadata: {},
  });

  return NextResponse.json({ cost });
}

export async function DELETE(request: NextRequest) {
  const setup = await requireSoapAbacusFeature(FEATURE_KEYS.INGREDIENT_COSTS);
  if (!setup.ok) return setup.response;

  if (!isRecipeVaultConfigured()) {
    return NextResponse.json({ error: 'DATABASE_URL is required to delete ingredient costs.' }, { status: 503 });
  }

  const ingredientId = request.nextUrl.searchParams.get('ingredientId');
  if (!ingredientId) return NextResponse.json({ error: 'ingredientId is required.' }, { status: 400 });

  await deleteUserIngredientCost(setup.userId, ingredientId);
  return NextResponse.json({ ok: true });
}
