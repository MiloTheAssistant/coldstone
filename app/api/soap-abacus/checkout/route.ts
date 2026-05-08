import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { getStripe } from '@/app/lib/stripe';
import {
  getCurrentSoapAbacusMembership,
  persistSoapAbacusMembership,
} from '@/app/lib/soap-abacus-membership';
import { buildCheckoutSessionOptions, normalizeBillingInterval, normalizeTier } from '@/app/soap-calculator/studio/membership-model';

export const runtime = 'nodejs';

type CheckoutBody = {
  tier?: 'plus' | 'pro';
  trial?: 'card' | 'none';
  billingInterval?: 'monthly' | 'annual';
};

function getSoapAbacusPriceId(tier: 'plus' | 'pro', billingInterval: 'monthly' | 'annual') {
  if (tier === 'plus') {
    return billingInterval === 'annual'
      ? process.env.STRIPE_PRICE_SOAP_ABACUS_PLUS_ANNUAL
      : process.env.STRIPE_PRICE_SOAP_ABACUS_PLUS_MONTHLY || process.env.STRIPE_PRICE_SOAP_ABACUS_PLUS;
  }

  return billingInterval === 'annual'
    ? process.env.STRIPE_PRICE_SOAP_ABACUS_PRO_ANNUAL
    : process.env.STRIPE_PRICE_SOAP_ABACUS_PRO_MONTHLY || process.env.STRIPE_PRICE_SOAP_ABACUS_PRO;
}

export async function POST(request: NextRequest) {
  const setup = await getCurrentSoapAbacusMembership();
  if (!setup.ok) return setup.response;

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 });
  }

  const tier = normalizeTier(body.tier);
  if (tier === 'free') {
    return NextResponse.json({ error: 'Choose Plus or Pro to start Stripe Checkout.' }, { status: 400 });
  }
  const billingInterval = normalizeBillingInterval(body.billingInterval) as 'monthly' | 'annual';

  const priceId = getSoapAbacusPriceId(tier, billingInterval);
  if (!priceId) {
    return NextResponse.json({ error: `Missing Stripe ${billingInterval} price id for Soap Abacus ${tier}.` }, { status: 503 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe is not configured.';
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  let customerId = setup.membership.stripeCustomerId || null;

  try {
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          project: 'soap-abacus',
          clerk_user_id: setup.userId,
        },
      });
      customerId = customer.id;
      await persistSoapAbacusMembership({
        ...setup.membership,
        userId: setup.userId,
        tier: setup.membership.tier,
        status: setup.membership.status,
        stripeCustomerId: customerId,
        metadata: { checkout_customer_created: true },
      });
    }

    const origin = process.env.NEXT_PUBLIC_SOAP_ABACUS_URL || request.headers.get('origin') || request.nextUrl.origin;
    const checkoutOptions = buildCheckoutSessionOptions({
      tier,
      userId: setup.userId,
      customerId,
      priceId,
      origin,
      trial: body.trial === 'card' ? 'card' : 'none',
      billingInterval,
    }) as Stripe.Checkout.SessionCreateParams;
    const session = await stripe.checkout.sessions.create(checkoutOptions);

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe could not create a subscription checkout session.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
