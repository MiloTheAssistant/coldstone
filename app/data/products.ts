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
      'Black Granite is Coldstone Soap Co.\'s charcoal-forward cold process soap bar for daily washing. It uses olive oil, coconut oil, shea butter, activated charcoal, and tea tree essential oil in an approximate 4.5 oz bar. The bar has a dark mineral look, a crisp tea-tree scent direction, and a straightforward ingredient profile. It is positioned as handmade soap for sink, shower, or travel-kit use, not as a cosmetic or medical treatment.',
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
      'Stone Forge is Coldstone Soap Co.\'s warm wood-and-herb cold process soap bar for daily washing. It uses olive oil, coconut oil, shea butter, cocoa butter, cedar oil, and sage oil in an approximate 4.5 oz bar. The bar has an earthy cedar-and-sage scent direction, a richer butter-forward base, and a sturdy daily-use feel. It is intended for sink, shower, or travel-kit use with dry storage between washes.',
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
