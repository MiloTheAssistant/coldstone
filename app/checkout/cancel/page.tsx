import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import PageIntro from '../../components/PageIntro';
import SiteFooter from '../../components/SiteFooter';

export const metadata: Metadata = {
  title: 'Checkout Canceled | Coldstone Soap Co.',
  description: 'Return to your Coldstone Soap Co. cart or continue shopping.',
};

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-midnight">
      <Header />
      <PageIntro
        eyebrow="Checkout"
        title="Checkout canceled."
        description="Your cart is still saved locally. You can return to checkout or keep browsing."
      />
      <main className="px-5 sm:px-6 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto border border-gold-500/15 bg-navy-900/70 p-6 sm:p-8 text-center">
          <h2 className="font-serif text-2xl text-parchment-100 mb-4">No payment was completed.</h2>
          <p className="text-parchment-400 text-sm leading-relaxed mb-8">
            Head back to the cart when you are ready, or return to the shop to adjust your order.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cart"
              className="bg-crimson-600 text-parchment-100 px-8 py-4 text-[11px] tracking-[0.22em] hover:bg-crimson-500 transition-colors"
            >
              RETURN TO CART
            </Link>
            <Link
              href="/shop"
              className="border border-gold-500/40 text-gold-400 px-8 py-4 text-[11px] tracking-[0.22em] hover:bg-gold-500/10 transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
