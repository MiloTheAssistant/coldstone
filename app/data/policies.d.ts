export interface PolicySection {
  title: string;
  body: string;
}

export interface PolicyPageContent {
  eyebrow: string;
  title: string;
  description: string;
  sections: PolicySection[];
}

export interface PolicyLink {
  label: string;
  href: string;
}

export const checkoutTrustLinks: PolicyLink[];
export const contactEmail: string;
export const faqItems: PolicySection[];
export const policyPages: Record<'privacy' | 'terms' | 'shipping' | 'returns', PolicyPageContent>;
export const productTrustDetails: PolicySection[];
export const trustHighlights: PolicySection[];
