import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import JsonLd from '../../../components/JsonLd';
import SiteFooter from '../../../components/SiteFooter';
import { getLessonChapterBySlug, getLessonModuleBySlug } from '../../../data/soap-lessons';
import { getLessonLibraryAccess } from '../../../lib/lesson-library-access';
import { SITE_NAME, SITE_URL, absoluteUrl } from '../../../lib/seo';
import LessonAuthorityLinks from '../../components/LessonAuthorityLinks';
import LessonChapterNav from '../../components/LessonChapterNav';
import LessonChecklist from '../../components/LessonChecklist';
import LessonNoteTag from '../../components/LessonNoteTag';
import LessonPaywall from '../../components/LessonPaywall';

interface ChapterPageProps {
  params: Promise<{ moduleSlug: string; chapterSlug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { moduleSlug, chapterSlug } = await params;
  const lessonModule = getLessonModuleBySlug(moduleSlug);
  const chapter = getLessonChapterBySlug(moduleSlug, chapterSlug);

  if (!lessonModule || !chapter) {
    return { title: `Soapmaking Chapter Not Found | ${SITE_NAME}` };
  }

  return {
    title: `Pro Soapmaking Chapter | ${SITE_NAME}`,
    description: 'Active Pro subscribers can open guided Coldstone soapmaking chapters, bench notes, calculator checkpoints, and checklists.',
    alternates: {
      canonical: `/soap-making/${lessonModule.slug}/${chapter.slug}`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function SoapLessonChapterPage({ params }: ChapterPageProps) {
  const { moduleSlug, chapterSlug } = await params;
  const lessonModule = getLessonModuleBySlug(moduleSlug);
  const chapter = getLessonChapterBySlug(moduleSlug, chapterSlug);

  if (!lessonModule || !chapter) notFound();

  const requestedPath = `/soap-making/${lessonModule.slug}/${chapter.slug}`;
  const access = await getLessonLibraryAccess();

  if (!access.allowed) {
    return <LessonPaywall reason={access.reason} requestedPath={requestedPath} />;
  }

  const chapterIndex = lessonModule.chapters.findIndex((candidate) => candidate.slug === chapter.slug);
  const previous = lessonModule.chapters[chapterIndex - 1];
  const next = lessonModule.chapters[chapterIndex + 1];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/soap-making/${lessonModule.slug}/${chapter.slug}#chapter`,
    headline: chapter.title,
    description: chapter.objective,
    image: absoluteUrl(chapter.image.src),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/soap-making/${lessonModule.slug}/${chapter.slug}`,
    isPartOf: `${SITE_URL}/soap-making/${lessonModule.slug}`,
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-midnight">
      <JsonLd data={schema} />
      <Header />
      <main>
        <section className="px-5 pb-10 pt-32 sm:px-6 md:pt-40">
          <div className="mx-auto grid max-w-6xl min-w-0 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div className="min-w-0">
              <Link href={`/soap-making/${lessonModule.slug}`} className="text-[10px] uppercase tracking-[0.28em] text-gold-400 hover:text-gold-300">
                Back to {lessonModule.title}
              </Link>
              <p className="mt-8 text-[10px] uppercase tracking-[0.34em] text-gold-500/80">
                Chapter {chapterIndex + 1} of {lessonModule.chapters.length}
              </p>
              <h1 className="mt-4 max-w-[16ch] break-words font-serif text-[1.75rem] leading-tight text-parchment-100 sm:max-w-none sm:text-[2.25rem] md:text-5xl">
                {chapter.title}
              </h1>
              <p className="mt-6 max-w-[31ch] break-words text-sm leading-8 text-parchment-300 sm:max-w-none md:text-base">
                {chapter.objective}
                {chapter.notes[0] ? <LessonNoteTag note={chapter.notes[0]} /> : null}
              </p>
            </div>
            <div className="relative aspect-[16/9] min-w-0 overflow-hidden border border-gold-500/20 bg-navy-900">
              <Image src={chapter.image.src} alt={chapter.image.alt} fill priority className="object-cover" sizes="(min-width: 1024px) 48vw, 100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/35 to-transparent" />
            </div>
          </div>
        </section>

        <section className="bg-navy-900 px-5 py-12 sm:px-6 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,720px)_320px] lg:items-start">
            <article className="min-w-0 space-y-10">
              <section className="border border-gold-500/20 bg-midnight/75 p-5 sm:p-7">
                <h2 className="mb-5 font-serif text-2xl text-parchment-100">Guided Steps</h2>
                <ol className="space-y-4">
                  {chapter.steps.map((step, index) => (
                    <li key={step} className="grid grid-cols-[2.5rem_1fr] gap-4 border border-gold-500/10 bg-navy-900/60 p-4">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-gold-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 max-w-[31ch] break-words text-sm leading-7 text-parchment-300 sm:max-w-none">
                        {step}
                        {chapter.notes[index + 1] ? <LessonNoteTag note={chapter.notes[index + 1]} /> : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              {chapter.soapAbacusCheckpoint ? (
                <section className="border border-gold-500/30 bg-gold-500/10 p-5 sm:p-7">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.26em] text-gold-300">SoapAbacus Checkpoint</p>
                  <p className="break-words text-sm leading-7 text-parchment-200">{chapter.soapAbacusCheckpoint}</p>
                  <a
                    href="https://www.soapabacus.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block border border-gold-500/50 px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-gold-200 hover:bg-gold-500/10"
                  >
                    Open SoapAbacus
                  </a>
                </section>
              ) : null}

              <section className="border border-gold-500/20 bg-midnight/75 p-5 sm:p-7">
                <h2 className="mb-5 font-serif text-2xl text-parchment-100">Useful Insights</h2>
                <ul className="space-y-4">
                  {chapter.insights.map((insight) => (
                    <li key={insight} className="break-words border-l-2 border-gold-500/50 pl-4 text-sm leading-7 text-parchment-300">
                      {insight}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="grid gap-3 sm:grid-cols-2">
                {previous ? (
                  <Link href={`/soap-making/${lessonModule.slug}/${previous.slug}`} className="border border-gold-500/20 p-4 text-sm text-parchment-300 hover:border-gold-500/50">
                    <span className="block text-[10px] uppercase tracking-[0.22em] text-gold-400">Previous</span>
                    {previous.title}
                  </Link>
                ) : (
                  <Link href={`/soap-making/${lessonModule.slug}`} className="border border-gold-500/20 p-4 text-sm text-parchment-300 hover:border-gold-500/50">
                    <span className="block text-[10px] uppercase tracking-[0.22em] text-gold-400">Module</span>
                    {lessonModule.title}
                  </Link>
                )}
                {next ? (
                  <Link href={`/soap-making/${lessonModule.slug}/${next.slug}`} className="border border-gold-500/20 p-4 text-sm text-parchment-300 hover:border-gold-500/50">
                    <span className="block text-[10px] uppercase tracking-[0.22em] text-gold-400">Next</span>
                    {next.title}
                  </Link>
                ) : (
                  <a href="#checklist" className="border border-gold-500/20 p-4 text-sm text-parchment-300 hover:border-gold-500/50">
                    <span className="block text-[10px] uppercase tracking-[0.22em] text-gold-400">Finish</span>
                    Module checklist
                  </a>
                )}
              </div>

              <div id="checklist">
                <LessonChecklist module={lessonModule} />
              </div>
            </article>

            <aside className="space-y-5 lg:sticky lg:top-28">
              <LessonChapterNav module={lessonModule} currentChapterSlug={chapter.slug} />
              <LessonAuthorityLinks links={lessonModule.authorityLinks} />
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
