import type { Metadata } from 'next';
import Header from '../components/Header';
import PolicyPage from '../components/PolicyPage';
import SiteFooter from '../components/SiteFooter';
import { policyPages } from '../data/policies';

export const metadata: Metadata = {
  title: 'Shipping | Coldstone Soap Co.',
  description: 'Shipping expectations, domestic fulfillment notes, and launch shipping policy for Coldstone Soap Co.',
  alternates: {
    canonical: '/shipping',
  },
};

export default function ShippingPage() {
  const page = policyPages.shipping;

  return (
    <>
      <Header />
      <PolicyPage
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        sections={page.sections}
      />
      <SiteFooter />
    </>
  );
}
