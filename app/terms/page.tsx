import type { Metadata } from 'next';
import Header from '../components/Header';
import PolicyPage from '../components/PolicyPage';
import SiteFooter from '../components/SiteFooter';
import { policyPages } from '../data/policies';

export const metadata: Metadata = {
  title: 'Terms of Use | Coldstone Soap Co.',
  description: 'Terms for using the Coldstone Soap Co. website and purchasing products.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  const page = policyPages.terms;

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
