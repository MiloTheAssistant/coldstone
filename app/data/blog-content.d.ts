export interface BlogLink {
  label: string;
  href: string;
  target?: '_blank';
  rel?: 'noopener noreferrer';
}

export interface BlogSection {
  heading: string;
  body: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  publishedDate: string;
  readTime: string;
  heroImage: string;
  heroAlt: string;
  internalLinks: BlogLink[];
  sections: BlogSection[];
}

export const blogCategories: string[];
export const blogPosts: BlogPost[];
export function getBlogCategories(): string[];
export function getBlogPostBySlug(slug: string): BlogPost | undefined;
export function getPublishedBlogPosts(): BlogPost[];
