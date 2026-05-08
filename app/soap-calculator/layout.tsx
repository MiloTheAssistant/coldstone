import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.soapabacus.com'),
  title: 'Soap Abacus Studio | Recipe Designer',
  description:
    'A cold process soap calculator for lye, water, oil percentages, fragrance, cost, saved recipes, and AI-assisted recipe ideas.',
  alternates: {
    canonical: 'https://www.soapabacus.com',
  },
  openGraph: {
    title: 'Soap Abacus Studio | Recipe Designer',
    description:
      'Plan cold process soap recipes with lye, water, oil percentages, fragrance, cost, saved recipes, and AI-assisted recipe ideas.',
    type: 'website',
    url: 'https://www.soapabacus.com',
  },
};

export default function SoapCalculatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
