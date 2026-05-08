import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentSoapAbacusMembership,
  startNoCardProTrial,
} from '@/app/lib/soap-abacus-membership';

export const runtime = 'nodejs';

export async function GET() {
  const setup = await getCurrentSoapAbacusMembership();
  if (!setup.ok) return setup.response;

  return NextResponse.json({
    userId: setup.userId,
    databaseReady: setup.databaseReady,
    membership: setup.membership,
  });
}

export async function POST(request: NextRequest) {
  const setup = await getCurrentSoapAbacusMembership();
  if (!setup.ok) return setup.response;

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid membership request.' }, { status: 400 });
  }

  if (body.action !== 'start_pro_trial') {
    return NextResponse.json({ error: 'Unsupported membership action.' }, { status: 400 });
  }

  try {
    const membership = await startNoCardProTrial(setup.userId);
    return NextResponse.json({ membership });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start Pro trial.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
