import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId, isClerkConfigured } from '@/app/lib/auth';
import {
  createShareLinkRecord,
  getRecipeForUser,
  isRecipeVaultConfigured,
  type ShareLinkRecord,
} from '@/app/lib/recipe-vault';
import { FEATURE_KEYS, requireSoapAbacusFeature } from '@/app/lib/soap-abacus-membership';
import { createShareLink } from '@/app/soap-calculator/studio/recipe-studio-model';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: 'Recipe vault accounts are not configured yet.' }, { status: 503 });
  }
  if (!isRecipeVaultConfigured()) {
    return NextResponse.json({ error: 'Recipe vault database is not configured yet.' }, { status: 503 });
  }

  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to share recipes.' }, { status: 401 });
  const access = await requireSoapAbacusFeature(FEATURE_KEYS.SHARE_LINKS);
  if (!access.ok) return access.response;

  const { id } = await params;
  const recipe = await getRecipeForUser(id, userId);
  if (!recipe) return NextResponse.json({ error: 'Recipe not found.' }, { status: 404 });

  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SOAP_ABACUS_URL || 'https://www.soapabacus.com';
  const share = createShareLink(recipe, { baseUrl: origin }) as ShareLinkRecord;
  await createShareLinkRecord(share, userId);
  return NextResponse.json({ share });
}
