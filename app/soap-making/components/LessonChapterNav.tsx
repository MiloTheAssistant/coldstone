import Link from 'next/link';
import type { LessonModule } from '../../data/soap-lessons';

interface LessonChapterNavProps {
  module: LessonModule;
  currentChapterSlug?: string;
}

export default function LessonChapterNav({ module, currentChapterSlug }: LessonChapterNavProps) {
  return (
    <nav className="border border-gold-500/20 bg-midnight/75 p-5" aria-label={`${module.title} chapters`}>
      <p className="mb-4 text-[10px] uppercase tracking-[0.26em] text-gold-400">Chapter Index</p>
      <ol className="space-y-2">
        {module.chapters.map((chapter, index) => {
          const active = currentChapterSlug === chapter.slug;
          return (
            <li key={chapter.slug}>
              <Link
                href={`/soap-making/${module.slug}/${chapter.slug}`}
                className={`grid grid-cols-[2.5rem_1fr] gap-3 border px-3 py-3 text-sm transition-colors ${
                  active
                    ? 'border-gold-500/60 bg-gold-500/10 text-gold-200'
                    : 'border-gold-500/10 text-parchment-400 hover:border-gold-500/45 hover:text-parchment-100'
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.22em] text-gold-500/80">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{chapter.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
