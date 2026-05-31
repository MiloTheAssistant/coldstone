import type { LessonAuthorityLink } from '../../data/soap-lessons';

interface LessonAuthorityLinksProps {
  links: LessonAuthorityLink[];
}

export default function LessonAuthorityLinks({ links }: LessonAuthorityLinksProps) {
  return (
    <section className="border border-gold-500/20 bg-navy-900/70 p-5">
      <h2 className="mb-4 text-[11px] uppercase tracking-[0.24em] text-gold-400">Authority Links</h2>
      <div className="space-y-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target={link.target}
            rel={link.rel}
            className="block border border-gold-500/15 p-4 transition-colors hover:border-gold-500/50 hover:bg-gold-500/5"
          >
            <span className="block text-sm font-semibold text-parchment-100">{link.label}</span>
            <span className="mt-1 block text-xs leading-6 text-parchment-400">{link.description}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
