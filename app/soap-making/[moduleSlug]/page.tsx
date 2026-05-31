import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../components/Header';
import JsonLd from '../../components/JsonLd';
import SiteFooter from '../../components/SiteFooter';
import { getLessonModuleBySlug, getLessonModules } from '../../data/soap-lessons';
import { SITE_NAME, SITE_URL, absoluteUrl } from '../../lib/seo';
import LessonAuthorityLinks from '../components/LessonAuthorityLinks';
import LessonChecklist from '../components/LessonChecklist';
import LessonChapterNav from '../components/LessonChapterNav';

interface ModulePageProps {
  params: Promise<{ moduleSlug: string }>;
}

export function generateStaticParams() {
  return getLessonModules().map((lessonModule) => ({ moduleSlug: lessonModule.slug }));
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { moduleSlug } = await params;
  const lessonModule = getLessonModuleBySlug(moduleSlug);

  if (!lessonModule) {
    return { title: `Soapmaking Module Not Found | ${SITE_NAME}` };
  }

  return {
    title: `${lessonModule.title} | ${SITE_NAME}`,
    description: lessonModule.description,
    alternates: {
      canonical: `/soap-making/${lessonModule.slug}`,
    },
    openGraph: {
      title: lessonModule.title,
      description: lessonModule.description,
      type: 'article',
      url: `${SITE_URL}/soap-making/${lessonModule.slug}`,
      images: [{ url: lessonModule.chapters[0].image.src, width: 1536, height: 864, alt: lessonModule.chapters[0].image.alt }],
    },
  };
}

export default async function SoapLessonModulePage({ params }: ModulePageProps) {
  const { moduleSlug } = await params;
  const lessonModule = getLessonModuleBySlug(moduleSlug);

  if (!lessonModule) notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${SITE_URL}/soap-making/${lessonModule.slug}#module`,
    name: lessonModule.title,
    description: lessonModule.description,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    image: absoluteUrl(lessonModule.chapters[0].image.src),
    hasCourseInstance: lessonModule.chapters.map((chapter, index) => ({
      '@type': 'CreativeWork',
      position: index + 1,
      name: chapter.title,
      url: `${SITE_URL}/soap-making/${lessonModule.slug}/${chapter.slug}`,
    })),
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-midnight">
      <JsonLd data={schema} />
      <Header />
      <main>
        <section className="relative overflow-hidden px-5 pb-12 pt-32 sm:px-6 md:pt-40">
          <div className="absolute inset-0">
            <Image src={lessonModule.chapters[0].image.src} alt="" fill priority className="object-cover opacity-40" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-midnight/85 via-midnight/75 to-midnight" />
          </div>
          <div className="relative z-10 mx-auto max-w-6xl min-w-0">
            <Link href="/soap-making" className="text-[10px] uppercase tracking-[0.28em] text-gold-400 hover:text-gold-300">
              Back to Lesson Library
            </Link>
            <p className="mt-8 text-[10px] uppercase tracking-[0.38em] text-gold-500/80">
              {lessonModule.chapters.length} guided chapters / {lessonModule.estimatedTime}
            </p>
            <h1 className="mt-4 max-w-[15ch] break-words font-serif text-[1.8rem] leading-tight text-parchment-100 sm:max-w-4xl sm:text-[2.35rem] md:text-6xl">
              {lessonModule.title}
            </h1>
            <p className="mt-6 max-w-[31ch] break-words text-sm leading-8 text-parchment-300 sm:max-w-2xl md:text-base">{lessonModule.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/soap-making/${lessonModule.slug}/${lessonModule.chapters[0].slug}`}
                className="border border-crimson-600 bg-crimson-600/20 px-6 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-parchment-100 hover:bg-crimson-600"
              >
                Start Chapter 1
              </Link>
              <a
                href="#checklist"
                className="border border-gold-500/40 px-6 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-gold-300 hover:bg-gold-500/10"
              >
                View Checklist
              </a>
            </div>
          </div>
        </section>

        <section className="bg-navy-900 px-5 py-12 sm:px-6 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              <section className="grid min-w-0 gap-4 md:grid-cols-2">
                {lessonModule.chapters.map((chapter, index) => (
                  <article key={chapter.slug} className="min-w-0 overflow-hidden border border-gold-500/15 bg-midnight/75">
                    <Link href={`/soap-making/${lessonModule.slug}/${chapter.slug}`} className="relative block aspect-[16/9]">
                      <Image src={chapter.image.src} alt={chapter.image.alt} fill className="object-cover" sizes="(min-width: 1024px) 32vw, 100vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-midnight/65 to-transparent" />
                      <span className="absolute left-4 top-4 bg-midnight/80 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-gold-300">
                        Chapter {index + 1}
                      </span>
                    </Link>
                    <div className="p-5">
                      <h2 className="max-w-[16ch] break-words font-serif text-lg leading-snug text-parchment-100 sm:max-w-none sm:text-xl">
                        <Link href={`/soap-making/${lessonModule.slug}/${chapter.slug}`} className="hover:text-gold-300">
                          {chapter.title}
                        </Link>
                      </h2>
                      <p className="mt-3 max-w-[31ch] break-words text-sm leading-7 text-parchment-400 sm:max-w-none">{chapter.objective}</p>
                    </div>
                  </article>
                ))}
              </section>
              <div id="checklist">
                <LessonChecklist module={lessonModule} />
              </div>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28">
              <LessonChapterNav module={lessonModule} />
              <LessonAuthorityLinks links={lessonModule.authorityLinks} />
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
