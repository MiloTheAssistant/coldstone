import Link from 'next/link';
import Logo from './Logo';
import NewsletterForm from './NewsletterForm';
import { footerGroups } from '../data/site';

export default function SiteFooter() {
  return (
    <footer className="border-t border-gold-500/20 bg-midnight">
      <section id="newsletter" className="px-5 sm:px-6 py-12 md:py-16 bg-navy-800 grain-overlay stars-bg">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-4">STAY CONNECTED</p>
            <h2 className="font-serif text-2xl md:text-3xl text-parchment-100 mb-4">
              New batches, field notes, and early access.
            </h2>
            <p className="text-parchment-400 text-sm leading-relaxed max-w-xl">
              Join the Coldstone list for product drops, soapmaking notes, and practical care tips. No noise.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <section className="px-5 sm:px-6 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
            <div>
              <Logo variant="footer" />
              <p className="text-parchment-500 text-xs mt-4 max-w-xs leading-relaxed">
                Handcrafted cold process soap. Veteran owned. Small batch. Made in the USA.
              </p>
            </div>

            <nav className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs tracking-[0.12em] text-parchment-500">
              {footerGroups.map((group) => (
                <div key={group.title} className="flex flex-col gap-3">
                  <p className="text-gold-500/70 text-[10px] tracking-[0.25em] mb-1">{group.title.toUpperCase()}</p>
                  {group.links.map((link) =>
                    link.href.startsWith('mailto:') ? (
                      <a key={link.label} href={link.href} className="hover:text-parchment-100 transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      link.target ? (
                        <a
                          key={link.label}
                          href={link.href}
                          target={link.target}
                          rel={link.rel}
                          className="hover:text-parchment-100 transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link key={link.label} href={link.href} className="hover:text-parchment-100 transition-colors">
                          {link.label}
                        </Link>
                      )
                    )
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="border-t border-gold-500/20 mt-10 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-parchment-500">
              &copy; 2026 Coldstone Soap Co. All rights reserved.
            </p>
            <p className="text-[10px] text-gold-500/60 tracking-[0.25em] sm:tracking-[0.3em]">
              VETERAN OWNED &nbsp;&middot;&nbsp; USA MADE
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
}
