import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '../../lib/stripe';
import { products } from '../../data/products';
import { buildCheckoutLineItems, isAutomaticTaxEnabled, validateCheckoutCart } from '../../checkout/checkout-model';

interface CheckoutRequestBody {
  items?: { productId: string; quantity: number }[];
}

export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 });
  }

  const validation = validateCheckoutCart(body.items, products, process.env);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const validatedItems = validation.items ?? [];

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe is not configured.';
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const orderReference = `coldstone_${Date.now()}`;
  const shippingRate = process.env.STRIPE_SHIPPING_RATE_US;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: buildCheckoutLineItems(validatedItems),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      client_reference_id: orderReference,
      automatic_tax: { enabled: isAutomaticTaxEnabled(process.env) },
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: shippingRate ? [{ shipping_rate: shippingRate }] : undefined,
      metadata: {
        project: 'coldstone',
        order_reference: orderReference,
        product_ids: validatedItems.map((item) => item.productId).join(','),
        skus: validatedItems.map((item) => item.sku).join(','),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe could not create a checkout session.';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (!session.url) {
    return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
