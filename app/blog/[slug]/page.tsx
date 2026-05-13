import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../components/Header';
import JsonLd from '../../components/JsonLd';
import SiteFooter from '../../components/SiteFooter';
import { getBlogPostBySlug, getPublishedBlogPosts } from '../../data/blog';
import { SITE_NAME, SITE_URL, absoluteUrl } from '../../lib/seo';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function formatPostDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

export function generateStaticParams() {
  return getPublishedBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found | Coldstone Soap Co.',
    };
  }

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.publishedDate,
      images: [{ url: post.heroImage, width: 1200, height: 630, alt: post.heroAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.heroImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = getPublishedBlogPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    image: absoluteUrl(post.heroImage),
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/coldstone-logo-badge.svg"),
      },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-midnight">
      <JsonLd data={articleSchema} />
      <Header />
      <main>
        <article>
          <section className="px-5 sm:px-6 pt-32 pb-10 md:pt-40 md:pb-14 bg-midnight grain-overlay">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-14 items-end">
              <div>
                <Link
                  href="/blog"
                  className="text-[10px] tracking-[0.28em] text-gold-500 hover:text-gold-300 uppercase"
                >
                  Back to Blog
                </Link>
                <p className="text-[10px] tracking-[0.4em] text-gold-500/70 mt-7 mb-4 uppercase">
                  {post.category} / {post.readTime}
                </p>
                <h1 className="font-serif text-4xl md:text-6xl text-parchment-100 leading-tight mb-6">
                  {post.title}
                </h1>
                <p className="text-parchment-400 text-sm md:text-base leading-relaxed max-w-2xl">
                  {post.description}
                </p>
                <p className="text-[11px] text-parchment-500 mt-6">{formatPostDate(post.publishedDate)}</p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden border border-gold-500/20 bg-navy-900">
                <Image
                  src={post.heroImage}
                  alt={post.heroAlt}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 48vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/30 to-transparent" />
              </div>
            </div>
          </section>

          <section className="px-5 sm:px-6 py-12 md:py-16 bg-navy-900 grain-overlay stars-bg">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,720px)_320px] gap-10 lg:gap-16 items-start">
              <div className="space-y-10">
                {post.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="font-serif text-2xl md:text-3xl text-parchment-100 mb-5">{section.heading}</h2>
                    <div className="space-y-4">
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="text-parchment-300 text-sm md:text-base leading-8">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <aside className="lg:sticky lg:top-28 space-y-5">
                <section className="border border-gold-500/20 bg-midnight/75 p-5">
                  <h2 className="text-gold-400 text-[11px] tracking-[0.22em] uppercase mb-4">Keep Going</h2>
                  <div className="space-y-3">
                    {post.internalLinks.map((link) => {
                      const className =
                        'block border border-gold-500/15 px-4 py-3 text-sm text-parchment-300 hover:border-gold-500/50 hover:text-gold-300 transition-colors';

                      return isExternalHref(link.href) ? (
                        <a key={link.href} href={link.href} target={link.target} rel={link.rel} className={className}>
                          {link.label}
                        </a>
                      ) : (
                        <Link key={link.href} href={link.href} className={className}>
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </section>

                <section className="border border-crimson-600/40 bg-crimson-600/10 p-5">
                  <h2 className="font-serif text-xl text-parchment-100 mb-3">Batch notes in your inbox.</h2>
                  <p className="text-parchment-400 text-sm leading-relaxed mb-5">
                    Get product drops, soapmaking notes, and practical care tips without chasing another feed.
                  </p>
                  <Link
                    href="/#newsletter"
                    className="inline-block bg-crimson-600 text-parchment-100 px-5 py-3 text-[11px] tracking-[0.2em] hover:bg-crimson-500 transition-colors"
                  >
                    JOIN THE LIST
                  </Link>
                </section>
              </aside>
            </div>
          </section>
        </article>

        <section className="px-5 sm:px-6 py-12 md:py-16 bg-midnight">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
              <div>
                <p className="text-[10px] tracking-[0.35em] text-gold-500 mb-3 uppercase">Related</p>
                <h2 className="font-serif text-2xl md:text-3xl text-parchment-100">More from the journal</h2>
              </div>
              <Link href="/blog" className="text-[11px] tracking-[0.2em] text-gold-400 hover:text-gold-300">
                ALL POSTS
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.slug} className="border border-gold-500/15 bg-navy-900/60 p-5">
                  <p className="text-[10px] tracking-[0.26em] text-gold-500/70 uppercase mb-3">
                    {relatedPost.category}
                  </p>
                  <h3 className="font-serif text-xl text-parchment-100 leading-snug mb-4">
                    <Link href={`/blog/${relatedPost.slug}`} className="hover:text-gold-300 transition-colors">
                      {relatedPost.title}
                    </Link>
                  </h3>
                  <p className="text-parchment-400 text-sm leading-relaxed mb-5">{relatedPost.excerpt}</p>
                  <Link
                    href={`/blog/${relatedPost.slug}`}
                    className="text-[11px] tracking-[0.2em] text-gold-400 hover:text-gold-300"
                  >
                    READ
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
