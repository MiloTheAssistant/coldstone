export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  description: string;
  ingredients: string[];
  priceCents: number;
  image: string;
  campaignImage: string;
  storyImage: string;
  notes: string;
  scentProfile: string[];
  skinFeel: string;
  weight: string;
  inventoryStatus: 'in-stock' | 'out-of-stock';
  sku: string;
  stripePriceEnvVar: string;
  stripeProductId?: string;
  stripePriceId?: string;
}

export const products: Product[] = [
  {
    id: 'black-granite',
    slug: 'black-granite',
    name: 'Black Granite',
    tagline: 'Deep. Refreshing. Pure.',
    shortDescription:
      'Activated charcoal and tea tree essential oil for a deep, clarifying cold process bar.',
    description:
      'Activated charcoal and tea tree essential oil combine to deliver a deep, clarifying cleanse. Crafted using traditional cold process methods and cured for weeks with a simple, intentional ingredient list.',
    ingredients: ['Olive oil', 'Coconut oil', 'Shea butter', 'Activated charcoal', 'Tea tree oil'],
    priceCents: 1200,
    image: '/black-granite-soap.jpg',
    campaignImage: '/brand/campaign/black-granite-post.png',
    storyImage: '/brand/campaign/black-granite-story.png',
    notes: 'Clarifying / Fresh / Charcoal',
    scentProfile: ['Tea tree', 'Clean herbal', 'Mineral'],
    skinFeel: 'Crisp, clean, and balanced for everyday use.',
    weight: 'Approx. 4.5 oz bar',
    inventoryStatus: 'in-stock',
    sku: 'CSS-BG-001',
    stripePriceEnvVar: 'STRIPE_PRICE_BLACK_GRANITE',
  },
  {
    id: 'stone-forge',
    slug: 'stone-forge',
    name: 'Stone Forge',
    tagline: 'Strength in Simplicity.',
    shortDescription:
      'Cedar and sage essential oils grounded in a rich triple-butter cold process base.',
    description:
      'A blend of cedar and sage essential oils grounded in a triple-butter base. Dense lather, long-lasting bar, earthy finish, and a sturdy feel built for daily use.',
    ingredients: ['Olive oil', 'Coconut oil', 'Shea butter', 'Cocoa butter', 'Cedar oil', 'Sage oil'],
    priceCents: 1400,
    image: '/stone-forge.jpg',
    campaignImage: '/brand/campaign/stone-forge-post.png',
    storyImage: '/brand/campaign/stone-forge-story.png',
    notes: 'Earthy / Rich lather / Grounded',
    scentProfile: ['Cedar', 'Sage', 'Warm wood'],
    skinFeel: 'Creamy, sturdy, and long-lasting with a grounded finish.',
    weight: 'Approx. 4.5 oz bar',
    inventoryStatus: 'in-stock',
    sku: 'CSS-SF-001',
    stripePriceEnvVar: 'STRIPE_PRICE_STONE_FORGE',
  },
];

export function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
