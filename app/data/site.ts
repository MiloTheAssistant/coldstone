export type SiteLink = {
  label: string;
  href: string;
  target?: '_blank';
  rel?: 'noopener noreferrer';
};

export const SOAP_ABACUS_URL = 'https://www.soapabacus.com';
export const SOAP_ABACUS_LINK: Omit<SiteLink, 'label'> = {
  href: SOAP_ABACUS_URL,
  target: '_blank',
  rel: 'noopener noreferrer',
};

export const mainNavLinks: SiteLink[] = [
  { label: 'Shop', href: '/shop' },
  { label: 'Soap Calculator', ...SOAP_ABACUS_LINK },
  { label: 'Blog', href: '/blog' },
  { label: 'Process', href: '/#process' },
  { label: 'About', href: '/#about' },
  { label: 'FAQ', href: '/faq' },
];

export const footerGroups: { title: string; links: SiteLink[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All Soap', href: '/shop' },
      { label: 'Black Granite', href: '/products/black-granite' },
      { label: 'Stone Forge', href: '/products/stone-forge' },
      { label: 'Cart', href: '/cart' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Soap Calculator', ...SOAP_ABACUS_LINK },
      { label: 'Soap Lessons', href: '/soap-making' },
      { label: 'Blog', href: '/blog' },
      { label: 'Our Process', href: '/#process' },
      { label: 'About', href: '/#about' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Contact', href: 'mailto:hello@coldstonesoapco.com' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];
