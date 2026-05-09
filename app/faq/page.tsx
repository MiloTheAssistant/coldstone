import type { Metadata } from 'next';
import Header from '../components/Header';
import PolicyPage from '../components/PolicyPage';
import SiteFooter from '../components/SiteFooter';
import { faqItems } from '../data/policies';

export const metadata: Metadata = {
  title: 'FAQ | Coldstone Soap Co.',
  description: 'Answers about Coldstone soap, cold process methods, shipping, returns, and the Soap Calculator.',
};

export default function FAQPage() {
  return (
    <>
      <Header />
      <PolicyPage
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Quick answers for shoppers, readers, and soapmakers using the Coldstone site."
        sections={faqItems}
      />
      <SiteFooter />
    </>
  );
}
