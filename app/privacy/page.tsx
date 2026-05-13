import type { Metadata } from 'next';
import Header from '../components/Header';
import PolicyPage from '../components/PolicyPage';
import SiteFooter from '../components/SiteFooter';
import { policyPages } from '../data/policies';

export const metadata: Metadata = {
  title: 'Privacy Policy | Coldstone Soap Co.',
  description: 'How Coldstone Soap Co. handles customer, newsletter, checkout, and website data.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  const page = policyPages.privacy;

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
