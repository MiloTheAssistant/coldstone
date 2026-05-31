import type { MetadataRoute } from 'next';
import { getPublishedBlogPosts } from './data/blog';
import { getLessonModules } from './data/soap-lessons';
import { products } from './data/products';
import { LESSON_LIBRARY_PREVIEW_MODULE_SLUG } from './lib/lesson-library-rules';
import { absoluteUrl } from './lib/seo';

const staticRoutes = [
  '/',
  '/shop',
  '/blog',
  '/soap-making',
  '/faq',
  '/shipping',
  '/returns',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const lessonModules = getLessonModules();
  const publicLessonModules = lessonModules.filter((module) => module.slug === LESSON_LIBRARY_PREVIEW_MODULE_SLUG);

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
    ...publicLessonModules.map((module) => ({
      url: absoluteUrl(`/soap-making/${module.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.72,
    })),
  ];
}
