import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import ScrollReveal from "./components/ScrollReveal";
import ProductCard from "./components/ProductCard";
import SiteFooter from "./components/SiteFooter";
import { trustHighlights } from "./data/policies";
import { products } from "./data/products";
import { SOAP_ABACUS_LINK } from "./data/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

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
      "Coldstone Soap Co. makes true cold process soap by combining oils with a measured lye solution, pouring the batch into molds, cutting bars, and letting time finish the work. The process creates soap and naturally occurring glycerin without cooking the batch after mixing. For shoppers, the important part is control: the maker can choose the oil blend, scent direction, bar feel, color, and cure window instead of relying on mass-market shortcuts.",
  },
  {
    step: "02",
    title: "Slow Cured",
    detail:
      "Every Coldstone bar is cured for 4-6 weeks before it is sold. During cure, water continues to leave the bar and the structure becomes firmer, which helps the soap hold up better in regular shower or sink use. Cure time does not replace good bar care, but it is part of the finished product: a draining dish, airflow between uses, and a properly cured bar work together to make handmade soap more practical day after day.",
  },
  {
    step: "03",
    title: "American Made",
    detail:
      "Coldstone Soap Co. is veteran-owned, small-batch, and based in the United States. The American-made claim refers to the bar production itself: batches are mixed, poured, cut, cured, wrapped, and prepared for sale by hand before they appear in the shop. The brand keeps the catalog intentionally focused so customers can compare a narrow set of core bars instead of sorting through a large fragrance lineup.",
  },
];

const answerBlocks = [
  {
    title: "What is Coldstone Soap Co.?",
    body:
      "Coldstone Soap Co. is a veteran-owned small-batch soap brand focused on cold process bars for daily washing, field-kit routines, and practical grooming. The catalog is intentionally narrow: Black Granite and Stone Forge are the core bars, supported by clear product pages, soap care guidance, and education for customers who want to understand what they are buying. The brand also publishes soapmaking articles and connects makers to SoapAbacus, a separate calculator tool for planning cold process recipes.",
  },
  {
    title: "What is cold process soap?",
    body:
      "Cold process soap is made by mixing oils with a lye solution so the ingredients go through saponification. The batch is poured into a mold, cut into bars, and cured before sale instead of being cooked after mixing. For Coldstone, cold process matters because it lets each bar be designed around a specific oil blend, scent profile, color direction, cure window, and daily-use feel. The result is still simple soap, but the finished bar reflects deliberate recipe choices.",
  },
  {
    title: "What are Black Granite and Stone Forge?",
    body:
      "Black Granite and Stone Forge are the two core Coldstone bars. Black Granite is the charcoal-forward bar, built with activated charcoal and tea tree essential oil for a dark mineral look and crisp herbal scent direction. Stone Forge is the warmer bar, built around cedar and sage essential oils in a richer butter-forward base. Both are cold process bars, both are sold by approximate bar weight, and both are positioned for ordinary daily washing rather than cosmetic or medical claims.",
  },
  {
    title: "What is SoapAbacus?",
    body:
      "SoapAbacus is Coldstone's companion soap calculator for people planning their own cold process recipes. It helps makers estimate lye and water amounts, compare oils, adjust batch size, document recipe choices, and save work in a structured workspace. SoapAbacus is not a replacement for safe soapmaking practice, protective equipment, or careful measuring. It is a planning tool that makes recipe math easier to review before a maker commits ingredients to a batch.",
  },
];

const ritualScenes = [
  {
    eyebrow: "Maker Bench",
    title: "Cold process, handled like craft.",
    body:
      "Oils, tools, molds, cure time, and bench discipline carry the bar before it ever reaches the sink.",
    image: "/brand/campaign/maker-bench-process.png",
    alt: "Coldstone maker bench with cold process soapmaking tools",
  },
  {
    eyebrow: "Ingredient Standard",
    title: "Mineral-dark materials. No noise.",
    body:
      "Charcoal, stone, cedar, sage, and simple oils keep the visual language grounded in the bar itself.",
    image: "/brand/campaign/ingredient-still-life.png",
    alt: "Coldstone ingredient still life with charcoal, cedar, sage, oils, and stone",
  },
  {
    eyebrow: "Packing Bench",
    title: "Small-batch order, packed with intent.",
    body:
      "The same field-kit restraint carries into wrapping, packing, and the way the product shows up.",
    image: "/brand/campaign/packing-bench.png",
    alt: "Coldstone packing bench with wrapped soap bars and rugged tools",
  },
  {
    eyebrow: "Use Context",
    title: "Bright enough for product clarity.",
    body:
      "The ritual world gets cleaner and more usable when the soap needs to sell the daily routine.",
    image: "/brand/campaign/bathroom-ritual-use-context.png",
    alt: "Coldstone soap in a brighter bathroom field kit use context",
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
            src="/hero/coldstone-field-kit-ritual-desktop.png"
            alt="Coldstone Soap Co. bar in a rugged dopp kit sink ritual scene"
            fill
            className="hidden object-cover object-center md:block"
            priority
            sizes="100vw"
          />
          <Image
            src="/hero/coldstone-field-kit-ritual-mobile.png"
            alt="Coldstone Soap Co. bar with wet stone, canvas, and steel grooming kit materials"
            fill
            className="object-cover object-[50%_55%] md:hidden"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight/45 via-midnight/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-midnight/35 via-transparent to-midnight/82" />
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
              <p className="mb-5 flex flex-wrap gap-x-2 gap-y-1 font-sans text-[9px] uppercase leading-5 tracking-[0.16em] text-stone-300 sm:text-[11px] sm:tracking-[0.34em]">
                <span>Veteran Owned</span>
                <span className="text-stone-500">·</span>
                <span>Field Kit Ritual</span>
                <span className="text-stone-500">·</span>
                <span>USA Made</span>
              </p>
              <h1 className="font-serif text-[2.05rem] font-bold leading-[1.04] tracking-wide text-parchment-100 sm:text-6xl md:text-6xl lg:text-7xl">
                Built for the Ritual.<br />
                <span className="text-stone-300">Ready for the Real Work.</span>
              </h1>
              <div className="my-7 h-px w-16 bg-stone-400/80" />
              <p className="max-w-[320px] text-sm leading-7 text-parchment-300 sm:max-w-xl sm:text-base">
                Cold process bars with a slow cure, mineral-dark character, and disciplined utility for the sink, the shower kit, and the everyday field kit.
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

      {/* ── Trust Bar ── */}
      <section className="bg-midnight px-5 py-8 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustHighlights.map((item) => (
            <article key={item.title} className="border border-gold-500/15 bg-navy-900/55 p-4">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-gold-400">{item.title}</p>
              <p className="text-xs leading-6 text-parchment-400">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-midnight px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal className="mb-10 max-w-3xl">
            <p className="mb-3 text-[10px] uppercase tracking-[0.45em] text-gold-500">Plain Answers</p>
            <h2 className="font-serif text-3xl leading-tight text-parchment-100 md:text-4xl">
              Coldstone, cold process soap, and SoapAbacus in clear terms.
            </h2>
            <div className="my-6 h-px w-14 bg-gold-500/60" />
          </ScrollReveal>

          <div className="grid gap-5 md:grid-cols-2">
            {answerBlocks.map((block, index) => (
              <ScrollReveal key={block.title} delay={index * 80}>
                <article className="h-full border border-gold-500/15 bg-navy-900/55 p-5 sm:p-6">
                  <h2 className="mb-4 font-serif text-2xl text-parchment-100">{block.title}</h2>
                  <p className="text-sm leading-8 text-parchment-300">{block.body}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section id="shop" className="py-14 md:py-24 px-5 sm:px-6 bg-navy-800 grain-overlay stars-bg">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-12 md:mb-20">
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-3">THE COLLECTION</p>
            <h2 className="font-serif text-3xl md:text-4xl text-parchment-100">
              Start with the bars.
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

      {/* ── Ritual System ── */}
      <section className="bg-midnight px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="mb-10 max-w-3xl md:mb-14">
            <p className="mb-3 text-[10px] uppercase tracking-[0.45em] text-gold-500">BRAND RITUAL</p>
            <h2 className="font-serif text-3xl leading-tight text-parchment-100 md:text-5xl">
              The same standard from bench to sink.
            </h2>
            <div className="my-6 h-px w-14 bg-gold-500/60" />
            <p className="max-w-2xl text-sm leading-7 text-parchment-400">
              Coldstone should feel consistent wherever a customer meets it: process, ingredients, packing, product detail, and the daily wash ritual.
            </p>
          </ScrollReveal>

          <div className="grid gap-4 md:grid-cols-2">
            {ritualScenes.map((scene, index) => (
              <ScrollReveal key={scene.title} delay={index * 90}>
                <article className="group overflow-hidden border border-gold-500/15 bg-navy-900/60">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={scene.image}
                      alt={scene.alt}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight/75 via-midnight/10 to-transparent" />
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="mb-2 text-[9px] uppercase tracking-[0.34em] text-gold-500/80">{scene.eyebrow}</p>
                    <h3 className="mb-3 font-serif text-xl text-parchment-100 sm:text-2xl">{scene.title}</h3>
                    <p className="text-sm leading-6 text-parchment-400">{scene.body}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
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
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-parchment-400">
              Coldstone customer reviews are presented as buyer feedback about bar feel, scent direction,
              longevity, and support for a veteran-owned small business. They are not medical claims or
              guarantees. The comments below point to common purchase reasons: Black Granite for a crisp
              charcoal-and-tea-tree profile, Stone Forge for a warmer cedar-and-sage profile, and the overall
              preference for a simple handmade soap catalog.
            </p>
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
              SoapAbacus is a recipe-planning workspace for cold process soapmakers. Use it to calculate lye and water amounts, compare oil choices, explore recipe goals, and save batch notes before you make soap. The tool is designed for planning and documentation; makers still need careful measuring, safety gear, and their own process judgment at the bench.
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
                src="/brand/campaign/packing-bench.png"
                alt="Coldstone packing bench with wrapped soap bars"
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
              Built with Purpose is Coldstone Soap Co.&apos;s way of describing a focused, veteran-owned
              soap catalog built around practical cold process bars. Instead of offering a crowded
              fragrance lineup, Coldstone keeps the public shop centered on clear ingredients,
              visible bar details, straightforward care guidance, and product pages that explain what
              each bar is before a customer buys it.
            </p>
            <p className="text-parchment-400 leading-relaxed mb-8 sm:mb-10 text-sm">
              Each batch is made with the traditional cold process method, cut into bars, and cured
              before sale. Black Granite and Stone Forge anchor the catalog because they give customers
              two distinct choices: a charcoal-and-tea-tree bar with a crisp mineral profile, and a
              cedar-and-sage bar with a warmer wood profile. The site also supports soap education
              through blog guides, FAQ content, and the SoapAbacus calculator for makers planning their
              own recipes.
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
