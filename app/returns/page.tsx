import type { Metadata } from 'next';
import Header from '../components/Header';
import PolicyPage from '../components/PolicyPage';
import SiteFooter from '../components/SiteFooter';
import { policyPages } from '../data/policies';

export const metadata: Metadata = {
  title: 'Returns | Coldstone Soap Co.',
  description: 'Return and issue-resolution policy for Coldstone Soap Co. handmade soap orders.',
};

export default function ReturnsPage() {
  const page = policyPages.returns;

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
