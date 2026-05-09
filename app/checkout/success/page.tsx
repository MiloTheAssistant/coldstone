import type { Metadata } from 'next';
import Link from 'next/link';
import ClearCartOnMount from '../ClearCartOnMount';
import Header from '../../components/Header';
import PageIntro from '../../components/PageIntro';
import SiteFooter from '../../components/SiteFooter';

export const metadata: Metadata = {
  title: 'Order Received | Coldstone Soap Co.',
  description: 'Your Coldstone Soap Co. checkout was completed.',
};

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-midnight">
      <Header />
      <ClearCartOnMount />
      <PageIntro
        eyebrow="Checkout"
        title="Order received."
        description="Your payment was completed through Stripe Checkout. Watch your email for order and shipping updates."
      />
      <main className="px-5 sm:px-6 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto border border-gold-500/15 bg-navy-900/70 p-6 sm:p-8 text-center">
          <h2 className="font-serif text-2xl text-parchment-100 mb-4">Thank you for ordering Coldstone.</h2>
          <p className="text-parchment-400 text-sm leading-relaxed mb-8">
            This page clears your local cart after a successful checkout return. Phase 3 webhooks prepare the fulfillment hook for durable order handling.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-crimson-600 text-parchment-100 px-8 py-4 text-[11px] tracking-[0.22em] hover:bg-crimson-500 transition-colors"
          >
            BACK TO SHOP
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
