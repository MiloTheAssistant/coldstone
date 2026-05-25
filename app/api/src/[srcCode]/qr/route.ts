import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getRecipePublicationBySrcCode, isRecipeVaultConfigured } from '@/app/lib/recipe-vault';
import { buildSrcReleaseUrl } from '@/app/lib/src-publication-service';
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
