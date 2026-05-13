import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/seo';

const privateRoutes = [
  '/api/',
  '/cart',
  '/checkout',
  '/recipes/',
  '/sign-in',
  '/sign-up',
  '/soap-calculator/account',
];

const visibilityCrawlers = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Googlebot',
  'GoogleOther',
  'Google-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...visibilityCrawlers.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: privateRoutes,
      })),
      {
        userAgent: '*',
        allow: '/',
        disallow: privateRoutes,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
