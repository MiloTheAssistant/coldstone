import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';
import { getCurrentSoapAbacusMembership } from '@/app/lib/soap-abacus-membership';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const setup = await getCurrentSoapAbacusMembership();
  if (!setup.ok) return setup.response;

  if (!setup.membership.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe customer is attached to this Soap Abacus account.' }, { status: 404 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe is not configured.';
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const origin = process.env.NEXT_PUBLIC_SOAP_ABACUS_URL || request.headers.get('origin') || request.nextUrl.origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: setup.membership.stripeCustomerId,
    return_url: `${origin.replace(/\/$/, '')}/soap-calculator/account`,
  });

  return NextResponse.json({ url: session.url });
}
