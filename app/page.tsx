import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import ScrollReveal from "./components/ScrollReveal";
import ProductCard from "./components/ProductCard";
import SiteFooter from "./components/SiteFooter";
import { products } from "./data/products";
import { SOAP_ABACUS_LINK } from "./data/site";

const testimonials = [
  {
    quote:
      "First soap that didn't dry out my skin. I've been through every brand out there — nothing comes close to Black Granite.",
    author: "Marcus T.",
    location: "Austin, TX",
  },
  {
    quote:
      "Stone Forge smells incredible and lasts forever. One bar outlasted two months of daily use. Worth every penny.",
    author: "Ryan K.",
    location: "Portland, OR",
  },
  {
    quote:
      "As a veteran myself, I love supporting this company. The quality speaks for itself. Won't buy anything else.",
    author: "James W.",
    location: "Nashville, TN",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Cold Process",
    detail:
      "Traditional cold process preserves natural glycerin — the skin-loving compound stripped out of commercial soap. No heat. No shortcuts.",
  },
  {
    step: "02",
    title: "Slow Cured",
    detail:
      "Every bar cures 4–6 weeks. Patience produces a harder, longer-lasting bar with a dense, creamy lather that outperforms anything mass-market.",
  },
  {
    step: "03",
    title: "American Made",
    detail:
      "Veteran-owned and operated. Small batch production. Domestic oils. Every bar is made by hand in the USA.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-midnight">
      <Header />

      {/* ── Hero ── */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero/coldstone-hero-desktop.jpg"
            alt="Coldstone Soap Co. stamped stone soap bar on field-kit materials"
            fill
            className="hidden object-cover object-center md:block"
            priority
            sizes="100vw"
          />
          <Image
            src="/hero/coldstone-hero-mobile.jpg"
            alt="Close crop of a stamped Coldstone Soap Co. stone soap bar"
            fill
            className="object-cover object-center md:hidden"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight/55 via-midnight/12 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-midnight/45 via-transparent to-midnight/80" />
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative z-10 flex min-h-screen items-end px-5 pb-24 pt-32 sm:px-8 md:items-center md:pb-0 md:pt-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-[320px] sm:max-w-xl">
              <p className="mb-5 font-sans text-[9px] uppercase leading-5 tracking-[0.2em] text-stone-300 sm:text-[11px] sm:tracking-[0.34em]">
                Veteran Owned <span className="mx-1 text-stone-500">·</span> Field Kit Soap <span className="mx-1 text-stone-500">·</span> USA Made
              </p>
              <h1 className="font-serif text-[2.05rem] font-bold leading-[1.04] tracking-wide text-parchment-100 sm:text-6xl md:text-6xl lg:text-7xl">
                Stone-Stamped Soap.<br />
                <span className="text-stone-300">Built for Hard Use.</span>
              </h1>
              <div className="my-7 h-px w-16 bg-stone-400/80" />
              <p className="max-w-[320px] text-sm leading-7 text-parchment-300 sm:max-w-xl sm:text-base">
                Cold process bars with a slow cure, mineral-dark character, and disciplined utility for shower kits, work sinks, and the everyday field kit.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#shop"
                  className="w-full border border-crimson-600 bg-crimson-600/20 px-8 py-4 text-center text-[11px] tracking-[0.22em] text-parchment-100 transition-all duration-300 hover:bg-crimson-600 sm:w-auto"
                >
                  SHOP THE COLLECTION
                </a>
                <a
                  href={SOAP_ABACUS_LINK.href}
                  target={SOAP_ABACUS_LINK.target}
                  rel={SOAP_ABACUS_LINK.rel}
                  className="w-full border border-gold-500/40 px-8 py-4 text-center text-[11px] tracking-[0.22em] text-gold-400 transition-all duration-300 hover:bg-gold-500/10 sm:w-auto"
                >
                  SOAP CALCULATOR
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 scroll-indicator"
          style={{ color: 'rgba(212,160,23,0.55)' }}
        >
          <span className="text-[9px] tracking-[0.45em]">SCROLL</span>
          <svg width="16" height="26" viewBox="0 0 16 26" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1" y="1" width="14" height="24" rx="7" />
            <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
          </svg>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="bg-navy-900 py-4 overflow-hidden border-y border-gold-500/20">
        <div className="marquee-track">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="flex items-center gap-7 sm:gap-10 pr-7 sm:pr-10 text-parchment-200 text-[10px] tracking-[0.35em] sm:tracking-[0.45em] whitespace-nowrap"
            >
              <span>VETERAN OWNED</span>
              <span className="text-gold-500/70">&#10022;</span>
              <span>COLD PROCESS</span>
              <span className="text-gold-500/70">&#10022;</span>
              <span>SMALL BATCH</span>
              <span className="text-gold-500/70">&#10022;</span>
              <span>USA MADE</span>
              <span className="text-gold-500/70">&#10022;</span>
              <span>NATURAL INGREDIENTS</span>
              <span className="text-gold-500/70">&#10022;</span>
              <span>CURED 4–6 WEEKS</span>
              <span className="text-gold-500/70">&#10022;</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Products ── */}
      <section id="shop" className="py-16 md:py-28 px-5 sm:px-6 bg-navy-800 grain-overlay stars-bg">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-12 md:mb-20">
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-3">THE COLLECTION</p>
            <h2 className="font-serif text-3xl md:text-4xl text-parchment-100">
              Crafted with Intention
            </h2>
            <div className="w-12 h-px bg-gold-500/50 mx-auto mt-6" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-14">
            {products.map((product, i) => (
              <ScrollReveal key={product.name} delay={i * 120} className="group">
                <ProductCard product={product} priority={i === 0} />
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-10 md:mt-14">
            <Link
              href="/shop"
              className="inline-block border border-gold-500/50 text-gold-400 px-10 py-4 text-[11px] tracking-[0.25em] hover:bg-gold-500 hover:text-midnight transition-all duration-300"
            >
              VISIT THE SHOP
            </Link>
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section id="process" className="py-16 md:py-28 px-5 sm:px-6 bg-midnight grain-overlay">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-12 md:mb-20">
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-3">HOW IT&apos;S MADE</p>
            <h2 className="font-serif text-3xl md:text-4xl text-parchment-100">Our Process</h2>
            <div className="w-12 h-px bg-gold-500/50 mx-auto mt-6" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10 md:gap-8 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gold-500/20" />

            {processSteps.map((step, i) => (
              <ScrollReveal key={step.step} delay={i * 150} className="text-center">
                <div className="w-16 h-16 border border-gold-500/40 rounded-full mx-auto mb-6 flex items-center justify-center bg-navy-800 relative z-10">
                  <span className="font-serif text-base text-gold-500">{step.step}</span>
                </div>
                <h3 className="font-serif text-lg text-parchment-100 mb-3">{step.title}</h3>
                <p className="text-sm text-parchment-400 leading-relaxed">{step.detail}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 md:py-24 px-5 sm:px-6 bg-navy-900 grain-overlay stars-bg">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-10 md:mb-16">
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-3">REVIEWS</p>
            <h2 className="font-serif text-3xl md:text-4xl text-parchment-100">
              What Our Customers Are Saying
            </h2>
            <div className="w-12 h-px bg-gold-500/50 mx-auto mt-6" />
          </ScrollReveal>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 pb-4 md:pb-0 scrollbar-hide">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 100} className="min-w-[85vw] sm:min-w-[70vw] md:min-w-0 snap-center">
                <div className="border border-gold-500/20 bg-midnight/60 p-5 sm:p-8 h-full flex flex-col hover:border-gold-500/40 transition-colors duration-300">
                  <p className="font-serif text-gold-500/80 text-3xl leading-none mb-4">&ldquo;</p>
                  <p className="text-parchment-300 text-sm leading-relaxed flex-1 mb-6">{t.quote}</p>
                  <div>
                    <div className="flex items-center gap-0.5 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <span key={j} className="text-crimson-500 text-xs">&#9733;</span>
                      ))}
                    </div>
                    <p className="text-parchment-100 text-xs tracking-wider">{t.author}</p>
                    <p className="text-parchment-500 text-xs mt-1">{t.location}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Soap Calculator CTA ── */}
      <section className="py-14 md:py-20 px-5 sm:px-6 bg-midnight grain-overlay border-y border-gold-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-4">FREE TOOL</p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-parchment-100 mb-4">
              Soap Calculator
            </h2>
            <div className="w-10 h-px bg-gold-500/50 mx-auto mb-5" />
            <p className="text-parchment-400 text-sm mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed">
              Design your own cold process recipes. Calculate lye and water amounts, explore our oils database, generate recipes by goal, and save your creations.
            </p>
            <a
              href={SOAP_ABACUS_LINK.href}
              target={SOAP_ABACUS_LINK.target}
              rel={SOAP_ABACUS_LINK.rel}
              className="inline-block border border-gold-500 text-gold-500 px-10 sm:px-14 py-4 text-[11px] tracking-[0.2em] sm:tracking-[0.3em] hover:bg-gold-500 hover:text-midnight transition-all duration-300 active:scale-[0.98]"
            >
              OPEN SOAP CALCULATOR
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-16 md:py-28 px-5 sm:px-6 bg-midnight grain-overlay">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <ScrollReveal>
            <div className="aspect-[4/3] md:aspect-square relative overflow-hidden border-l-2 border-gold-500/40">
              <Image
                src="/stone-forge.jpg"
                alt="Stone Forge soap bar"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-midnight/10 to-midnight/40" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-5">OUR STORY</p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-parchment-100 mb-6 sm:mb-8 leading-snug">
              Built with Purpose
            </h2>
            <p className="text-parchment-400 leading-relaxed mb-5 text-sm">
              Coldstone Soap Co. was founded on the belief that everyday essentials should be built
              with intention. As a veteran-owned small business, we bring the care and precision
              developed through service to the craft of soapmaking.
            </p>
            <p className="text-parchment-400 leading-relaxed mb-8 sm:mb-10 text-sm">
              Each batch is produced using the traditional cold process method and slow-cured to
              ensure durability, skin compatibility, and real performance. No fillers. No shortcuts.
              No compromise.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-[10px] tracking-[0.25em] sm:tracking-[0.35em] text-gold-500/70 border-t border-gold-500/20 pt-6 sm:pt-8">
              <span>VETERAN OWNED</span>
              <span className="text-gold-500/30">&middot;</span>
              <span>SMALL BATCH</span>
              <span className="text-gold-500/30">&middot;</span>
              <span>USA MADE</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
