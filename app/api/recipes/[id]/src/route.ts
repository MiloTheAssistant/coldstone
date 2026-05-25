import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId, isClerkConfigured } from '@/app/lib/auth';
import { isRecipeVaultConfigured } from '@/app/lib/recipe-vault';
import { getCurrentSoapAbacusMembership } from '@/app/lib/soap-abacus-membership';
import { stampRecipeSrc } from '@/app/lib/src-publication-service';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const setup = await getVaultSetup();
  if (!setup.ok) return setup.response;

  const membershipSetup = await getCurrentSoapAbacusMembership();
  if (!membershipSetup.ok) return membershipSetup.response;

  let body: Record<string, unknown> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    body = {};
  }

  const { id } = await params;
  const origin = request.headers.get('origin') || request.nextUrl.origin;
  const result = await stampRecipeSrc({
    recipeId: id,
    ownerId: setup.userId,
    membership: membershipSetup.membership,
    mode: body.mode === 'same-src' ? 'same-src' : 'new-src',
    existingSrcCode: stringValue(body.existingSrcCode),
    revisionNotes: stringValue(body.revisionNotes),
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
      response: NextResponse.json({ error: 'Sign in to stamp Soap Recipe Codes.' }, { status: 401 }),
    };
  }

  return { ok: true, userId };
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}
