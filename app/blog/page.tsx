import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';
import PageIntro from '../components/PageIntro';
import SiteFooter from '../components/SiteFooter';
import { getBlogCategories, getPublishedBlogPosts } from '../data/blog';

export const metadata: Metadata = {
  title: 'Blog | Coldstone Soap Co.',
  description:
    'Soapmaking notes, ingredient guides, grooming tips, and behind-the-batch writing from Coldstone Soap Co.',
  alternates: {
    canonical: '/blog',
  },
};

function formatPostDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export default function BlogPage() {
  const posts = getPublishedBlogPosts();
  const [featuredPost, ...remainingPosts] = posts;
  const categories = getBlogCategories();

  return (
    <div className="min-h-screen bg-midnight">
      <Header />
      <PageIntro
        eyebrow="Blog"
        title="Field notes for better bars and better routines."
        description="A growing library for cold process soap, ingredients, bar care, grooming, and the practical craft behind Coldstone."
      />
      <main id="all" className="px-5 sm:px-6 pb-16 md:pb-24 bg-navy-900 grain-overlay stars-bg">
        <div className="max-w-6xl mx-auto pt-12 space-y-10 md:space-y-14">
          <nav className="flex gap-2 overflow-x-auto scrollbar-hide pb-2" aria-label="Blog categories">
            {categories.map((category) => (
              <a
                key={category}
                href={`#${category.toLowerCase().replaceAll(' ', '-')}`}
                className="shrink-0 border border-gold-500/20 px-4 py-2 text-[10px] tracking-[0.18em] text-parchment-400 hover:border-gold-500/50 hover:text-gold-300 transition-colors uppercase"
              >
                {category}
              </a>
            ))}
          </nav>

          <article className="grid lg:grid-cols-[1.1fr_0.9fr] gap-0 border border-gold-500/20 bg-midnight/75 overflow-hidden">
            <Link href={`/blog/${featuredPost.slug}`} className="relative min-h-[280px] lg:min-h-[430px] block">
              <Image
                src={featuredPost.heroImage}
                alt={featuredPost.heroAlt}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 52vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/50 to-transparent" />
            </Link>
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
              <p className="text-[10px] tracking-[0.3em] text-gold-500/80 uppercase mb-4">
                Featured / {featuredPost.category}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-parchment-100 leading-tight mb-5">
                {featuredPost.title}
              </h2>
              <p className="text-parchment-400 text-sm leading-relaxed mb-6">{featuredPost.excerpt}</p>
              <div className="mt-auto pt-6 border-t border-gold-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[11px] text-parchment-500">
                  {formatPostDate(featuredPost.publishedDate)} / {featuredPost.readTime}
                </p>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="text-[11px] tracking-[0.22em] text-gold-400 hover:text-gold-300"
                >
                  READ POST
                </Link>
              </div>
            </div>
          </article>

          <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {remainingPosts.map((post) => (
              <article
                key={post.slug}
                id={post.category.toLowerCase().replaceAll(' ', '-')}
                className="border border-gold-500/15 bg-midnight/70 overflow-hidden flex flex-col min-h-[430px]"
              >
                <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] block overflow-hidden">
                  <Image
                    src={post.heroImage}
                    alt={post.heroAlt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(min-width: 1280px) 31vw, (min-width: 768px) 47vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 to-transparent" />
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-[10px] tracking-[0.3em] text-gold-500/70 mb-4 uppercase">{post.category}</p>
                  <h2 className="font-serif text-2xl text-parchment-100 mb-4 leading-snug">
                    <Link href={`/blog/${post.slug}`} className="hover:text-gold-300 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-parchment-400 text-sm leading-relaxed flex-1">{post.excerpt}</p>
                  <div className="pt-6 mt-6 border-t border-gold-500/10 flex items-center justify-between gap-4">
                    <span className="text-[11px] text-parchment-500">{post.readTime}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[11px] tracking-[0.2em] text-gold-400 hover:text-gold-300"
                    >
                      READ
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
