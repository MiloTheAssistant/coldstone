import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.soapabacus.com'),
  title: 'Soap Abacus | Recipe Workspace for Makers',
  description:
    'A bright, maker-friendly soap recipe workspace for lye, water, oil percentages, fragrance, costs, saved formulas, and batch planning.',
  alternates: {
    canonical: 'https://www.soapabacus.com',
  },
  openGraph: {
    title: 'Soap Abacus | Recipe Workspace for Makers',
    description:
      'Plan cold process soap recipes in a clean workshop calculator built for makers.',
    type: 'website',
    url: 'https://www.soapabacus.com',
    images: [
      {
        url: '/soap-abacus/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Soap Abacus clean workshop recipe workspace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soap Abacus | Recipe Workspace for Makers',
    description: 'A clean workshop soap recipe calculator built for makers.',
    images: ['/soap-abacus/og-image.png'],
  },
};

export default function SoapCalculatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
