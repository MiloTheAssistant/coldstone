import type { Metadata } from 'next';
import Header from '../components/Header';
import JsonLd from '../components/JsonLd';
import PolicyPage from '../components/PolicyPage';
import SiteFooter from '../components/SiteFooter';
import { faqItems } from '../data/policies';
import { SITE_URL } from '../lib/seo';

export const metadata: Metadata = {
  title: 'FAQ | Coldstone Soap Co.',
  description: 'Answers about Coldstone soap, cold process methods, shipping, returns, and the Soap Calculator.',
  alternates: {
    canonical: '/faq',
  },
};

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/faq#faq`,
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.body,
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
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
