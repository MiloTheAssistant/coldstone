import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';
import JsonLd from '../components/JsonLd';
import PageIntro from '../components/PageIntro';
import SiteFooter from '../components/SiteFooter';
import { getLessonModules } from '../data/soap-lessons';
import { SITE_NAME, SITE_URL } from '../lib/seo';

export const metadata: Metadata = {
  title: `Soapmaking Lesson Library | ${SITE_NAME}`,
  description:
    'Interactive Coldstone soapmaking lessons with guided chapters, hover notes, SoapAbacus checkpoints, and printable checklists.',
  alternates: {
    canonical: '/soap-making',
  },
};

export default function SoapMakingPage() {
  const modules = getLessonModules();
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/soap-making#lessons`,
    name: 'Soapmaking Lesson Library',
    description: metadata.description,
    hasPart: modules.map((module) => ({
      '@type': 'CreativeWork',
      name: module.title,
      url: `${SITE_URL}/soap-making/${module.slug}`,
    })),
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-midnight">
      <JsonLd data={collectionSchema} />
      <Header />
      <PageIntro
        eyebrow="Soapmaking Lessons"
        title="A field manual for better soapmaking decisions."
        description="Fourteen guided modules for the soapmaking community, each chapter centered on a specific fundamental, recommended bench practice, calculator checkpoint, and printable checklist for making safer, better-documented soap batches."
      />
      <main className="bg-navy-900 px-5 pb-16 sm:px-6 md:pb-24">
        <div className="mx-auto max-w-7xl pt-12">
          <div className="mb-8 grid gap-5 border border-gold-500/20 bg-midnight/70 p-5 md:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold-400">Library Size</p>
              <p className="mt-2 font-serif text-3xl text-parchment-100">{modules.length} modules</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold-400">Format</p>
              <p className="mt-2 text-sm leading-6 text-parchment-400">Guided chapters with hover notes and chapter-level imagery.</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold-400">Calculator</p>
              <p className="mt-2 text-sm leading-6 text-parchment-400">SoapAbacus is used where formula math, scaling, or ingredient decisions matter.</p>
            </div>
          </div>

          <section className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module, index) => (
              <article key={module.slug} className="flex min-h-[520px] min-w-0 flex-col overflow-hidden border border-gold-500/15 bg-midnight/75">
                <Link href={`/soap-making/${module.slug}`} className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={module.chapters[0].image.src}
                    alt={module.chapters[0].image.alt}
                    fill
                    priority={index < 3}
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(min-width: 1280px) 31vw, (min-width: 768px) 47vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight/55 to-transparent" />
                </Link>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.26em] text-gold-500/80">
                    Module {String(index + 1).padStart(2, '0')} / {module.chapters.length} chapters
                  </p>
                  <h2 className="max-w-[15ch] break-words font-serif text-xl leading-snug text-parchment-100 sm:max-w-none sm:text-2xl">
                    <Link href={`/soap-making/${module.slug}`} className="hover:text-gold-300">
                      {module.title}
                    </Link>
                  </h2>
                  <p className="mt-4 max-w-[31ch] flex-1 break-words text-sm leading-7 text-parchment-400 sm:max-w-none">{module.description}</p>
                  <Link
                    href={`/soap-making/${module.slug}`}
                    className="mt-6 inline-block border border-gold-500/40 px-5 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-gold-300 transition-colors hover:bg-gold-500/10"
                  >
                    Open Module
                  </Link>
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
