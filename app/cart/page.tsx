import type { Metadata } from 'next';
import CartPageContent from './CartPageContent';
import Header from '../components/Header';
import PageIntro from '../components/PageIntro';
import SiteFooter from '../components/SiteFooter';

export const metadata: Metadata = {
  title: 'Cart | Coldstone Soap Co.',
  description: 'Review your Coldstone Soap Co. cart before checkout.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-midnight">
      <Header />
      <PageIntro
        eyebrow="Cart"
        title="Review your bars before checkout."
        description="Update quantities, remove items, and keep browsing. Secure Stripe checkout arrives in Phase 3."
      />
      <main className="px-5 sm:px-6 pb-16 md:pb-24">
        <CartPageContent />
      </main>
      <SiteFooter />
    </div>
  );
}
