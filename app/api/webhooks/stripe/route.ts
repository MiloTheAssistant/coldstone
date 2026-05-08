import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '../../../lib/stripe';
import { persistSoapAbacusMembership } from '@/app/lib/soap-abacus-membership';
import { getSoapAbacusMembershipByStripeCustomer } from '@/app/lib/recipe-vault';
import { membershipFromStripeSubscription } from '@/app/soap-calculator/studio/membership-model';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET is not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid Stripe webhook signature.' }, { status: 400 });
  }

  const stripe = getStripe();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.project === 'soap-abacus') {
      await syncSoapAbacusCheckoutSession(stripe, session);
    } else {
      console.info('Coldstone checkout completed', {
        id: session.id,
        orderReference: session.client_reference_id,
        amountTotal: session.amount_total,
        customerEmail: session.customer_details?.email,
      });
    }
  }

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    await syncSoapAbacusSubscription(event.data.object as Stripe.Subscription);
  }

  return NextResponse.json({ received: true });
}

async function syncSoapAbacusCheckoutSession(stripe: Stripe, session: Stripe.Checkout.Session) {
  if (!session.subscription) return;
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSoapAbacusSubscription(subscription);
}

async function syncSoapAbacusSubscription(subscription: Stripe.Subscription) {
  if (subscription.metadata?.project !== 'soap-abacus') return;

  const membership = membershipFromStripeSubscription(subscription, {
    plusPriceId: process.env.STRIPE_PRICE_SOAP_ABACUS_PLUS,
    proPriceId: process.env.STRIPE_PRICE_SOAP_ABACUS_PRO,
  });

  let userId = membership.userId;
  if (!userId && membership.stripeCustomerId) {
    const existing = await getSoapAbacusMembershipByStripeCustomer(membership.stripeCustomerId);
    userId = existing?.userId || null;
  }

  if (!userId) {
    console.warn('Soap Abacus Stripe subscription missing Clerk user id.', { subscriptionId: subscription.id });
    return;
  }

  await persistSoapAbacusMembership({
    userId,
    tier: membership.tier,
    status: membership.status,
    stripeCustomerId: membership.stripeCustomerId,
    stripeSubscriptionId: membership.stripeSubscriptionId,
    stripePriceId: membership.stripePriceId,
    trialEndsAt: membership.trialEndsAt,
    currentPeriodEndsAt: membership.currentPeriodEndsAt,
    source: 'stripe',
    metadata: { stripe_status: subscription.status },
  });
}
