import { NextRequest, NextResponse } from 'next/server';
import { getRecipePublicationBySrcCode, isRecipeVaultConfigured } from '@/app/lib/recipe-vault';
import { decorateRelease } from '@/app/lib/src-publication-service';
import { isValidSrcCode, normalizeSrcCode } from '@/app/soap-calculator/studio/recipe-studio-model';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ srcCode: string }> },
) {
  if (!isRecipeVaultConfigured()) {
    return NextResponse.json({ error: 'Recipe vault database is not configured yet. Add DATABASE_URL.' }, { status: 503 });
  }

  const { srcCode } = await params;
  const normalized = normalizeSrcCode(srcCode);
  if (!isValidSrcCode(normalized)) {
    return NextResponse.json({ error: 'SRC not found.' }, { status: 404 });
  }

  const release = await getRecipePublicationBySrcCode(normalized);
  if (!release || release.publication.status === 'revoked') {
    return NextResponse.json({ error: 'SRC not found.' }, { status: 404 });
  }

  return NextResponse.json({ release: decorateRelease(release, request.nextUrl.origin) });
}
