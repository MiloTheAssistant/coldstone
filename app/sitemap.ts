import type { MetadataRoute } from 'next';
import { getPublishedBlogPosts } from './data/blog';
import { products } from './data/products';
import { absoluteUrl } from './lib/seo';

const staticRoutes = [
  '/',
  '/shop',
  '/blog',
  '/faq',
  '/shipping',
  '/returns',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: now,
      changeFrequency: route === '/' ? ('weekly' as const) : ('monthly' as const),
      priority: route === '/' ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...getPublishedBlogPosts().map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(`${post.publishedDate}T00:00:00.000Z`),
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    })),
  ];
}
