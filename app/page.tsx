import Image from "next/image";
import Header from "./components/Header";
import ScrollReveal from "./components/ScrollReveal";
import NewsletterForm from "./components/NewsletterForm";

const products = [
  {
    name: "Black Granite",
    tagline: "Deep. Refreshing. Pure.",
    description:
      "Activated charcoal and tea tree essential oil combine to deliver a deep, clarifying cleanse. Crafted using traditional cold process methods and cured for weeks — nothing synthetic, nothing stripped.",
    ingredients: ["Olive oil", "Coconut oil", "Shea butter", "Activated charcoal", "Tea tree oil"],
    price: "$12",
    image: "/black-granite.jpg",
    notes: "Detox · Clarifying · Fresh",
  },
  {
    name: "Stone Forge",
    tagline: "Strength in Simplicity.",
    description:
      "A blend of cedar and sage essential oils grounded in a triple-butter base. Dense lather, long-lasting bar, earthy finish. For anyone who demands more from every wash.",
    ingredients: ["Olive oil", "Coconut oil", "Shea butter", "Cocoa butter", "Cedar oil", "Sage oil"],
    price: "$14",
    image: "/stone-forge.jpg",
    notes: "Grounding · Rich lather · Earthy",
  },
];

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
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/stone-forge.jpg"
            alt="Coldstone Soap — Stone Forge"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-midnight/85 via-midnight/70 to-midnight/95" />
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
          {/* Eyebrow — tighter tracking on small screens to prevent overflow */}
          <p className="font-sans text-[10px] tracking-[0.25em] sm:tracking-[0.5em] text-gold-500 mb-6 sm:mb-8 uppercase">
            Veteran Owned &nbsp;·&nbsp; Small Batch &nbsp;·&nbsp; USA Made
          </p>
          {/* Heading — smaller base size so "Uncompromising." fits on narrow phones */}
          <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6 sm:mb-8 tracking-tight sm:tracking-wide text-parchment-100">
            Pure.<br />Natural.<br />Uncompromising.
          </h2>
          <div className="w-14 h-px bg-gold-500 mx-auto mb-8 opacity-70" />
          <a
            href="#shop"
            className="inline-block border border-crimson-600 text-parchment-100 px-8 sm:px-14 py-4 text-[11px] tracking-[0.2em] sm:tracking-[0.3em] hover:bg-crimson-600 transition-all duration-300"
          >
            SHOP THE COLLECTION
          </a>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 scroll-indicator"
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
              <span className="text-gold-500/70">✦</span>
              <span>COLD PROCESS</span>
              <span className="text-gold-500/70">✦</span>
              <span>SMALL BATCH</span>
              <span className="text-gold-500/70">✦</span>
              <span>USA MADE</span>
              <span className="text-gold-500/70">✦</span>
              <span>NATURAL INGREDIENTS</span>
              <span className="text-gold-500/70">✦</span>
              <span>CURED 4–6 WEEKS</span>
              <span className="text-gold-500/70">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Products ── */}
      <section id="shop" className="py-16 md:py-28 px-4 sm:px-6 bg-navy-800 grain-overlay stars-bg">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-12 md:mb-20">
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-3">THE COLLECTION</p>
            <h3 className="font-serif text-3xl md:text-4xl text-parchment-100">
              Crafted with Intention
            </h3>
            <div className="w-12 h-px bg-gold-500/50 mx-auto mt-6" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
            {products.map((product, i) => (
              <ScrollReveal key={product.name} delay={i * 120} className="group">
                <div className="bg-navy-900 border border-gold-500/20 overflow-hidden hover:border-gold-500/50 transition-colors duration-500">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent" />
                    <div className="absolute top-4 right-4 bg-crimson-600 text-parchment-100 px-3 py-1.5 text-xs tracking-wider font-medium">
                      {product.price}
                    </div>
                  </div>

                  <div className="p-5 sm:p-8">
                    <p className="text-[9px] tracking-[0.5em] text-gold-500/70 mb-2">{product.notes}</p>
                    <h4 className="font-serif text-xl sm:text-2xl text-parchment-100 mb-1">{product.name}</h4>
                    <p className="text-xs tracking-[0.15em] sm:tracking-[0.2em] text-parchment-400 mb-4 italic">{product.tagline}</p>
                    <p className="text-parchment-400 text-sm leading-relaxed mb-6">{product.description}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {product.ingredients.map((ing) => (
                        <span
                          key={ing}
                          className="text-[9px] tracking-wider border border-gold-500/20 text-parchment-500 px-2.5 py-1"
                        >
                          {ing.toUpperCase()}
                        </span>
                      ))}
                    </div>

                    <button className="w-full border border-gold-500 text-gold-500 py-3.5 text-[11px] tracking-[0.2em] sm:tracking-[0.25em] hover:bg-gold-500 hover:text-midnight transition-colors duration-300">
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section id="process" className="py-16 md:py-28 px-4 sm:px-6 bg-midnight grain-overlay">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-12 md:mb-20">
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-3">HOW IT&apos;S MADE</p>
            <h3 className="font-serif text-3xl md:text-4xl text-parchment-100">Our Process</h3>
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
                <h4 className="font-serif text-lg text-parchment-100 mb-3">{step.title}</h4>
                <p className="text-sm text-parchment-400 leading-relaxed">{step.detail}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-navy-900 grain-overlay stars-bg">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-10 md:mb-16">
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-3">REVIEWS</p>
            <h3 className="font-serif text-3xl md:text-4xl text-parchment-100">
              What Our Customers Are Saying
            </h3>
            <div className="w-12 h-px bg-gold-500/50 mx-auto mt-6" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="border border-gold-500/20 bg-midnight/60 p-5 sm:p-8 h-full flex flex-col hover:border-gold-500/40 transition-colors duration-300">
                  <p className="font-serif text-gold-500/80 text-3xl leading-none mb-4">&ldquo;</p>
                  <p className="text-parchment-300 text-sm leading-relaxed flex-1 mb-6">{t.quote}</p>
                  <div>
                    <div className="flex items-center gap-0.5 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <span key={j} className="text-crimson-500 text-xs">★</span>
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

      {/* ── About ── */}
      <section id="about" className="py-16 md:py-28 px-4 sm:px-6 bg-midnight grain-overlay">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <ScrollReveal>
            {/* 4/3 ratio on mobile keeps image from dominating the screen */}
            <div className="aspect-[4/3] md:aspect-square relative overflow-hidden border-l-2 border-gold-500/40">
              <Image
                src="/black-granite.jpg"
                alt="Black Granite soap bar"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-midnight/10 to-midnight/40" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-5">OUR STORY</p>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-parchment-100 mb-6 sm:mb-8 leading-snug">
              Built with Purpose
            </h3>
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
              <span className="text-gold-500/30">·</span>
              <span>SMALL BATCH</span>
              <span className="text-gold-500/30">·</span>
              <span>USA MADE</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-14 md:py-20 px-4 sm:px-6 bg-navy-800 grain-overlay stars-bg">
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-gold-500 mb-4">STAY CONNECTED</p>
            <h3 className="font-serif text-2xl md:text-3xl text-parchment-100 mb-4">
              Join the Inner Circle
            </h3>
            <div className="w-10 h-px bg-gold-500/50 mx-auto mb-5" />
            <p className="text-parchment-400 text-sm mb-8 sm:mb-10">
              New batches. Limited runs. Early access. No spam — ever.
            </p>
            <NewsletterForm />
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 md:py-14 px-4 sm:px-6 border-t border-gold-500/20 bg-midnight">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12 mb-8 md:mb-12">
            <div>
              <h5 className="font-serif text-xl tracking-[0.25em] text-gold-500">COLDSTONE</h5>
              <p className="text-[9px] tracking-[0.4em] text-parchment-400 mt-1">SOAP CO.</p>
              <p className="text-parchment-500 text-xs mt-4 max-w-xs leading-relaxed">
                Handcrafted cold process soap. Veteran owned. Made in the USA.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:gap-12 text-xs tracking-[0.1em] sm:tracking-[0.15em] text-parchment-500">
              <div className="flex flex-col gap-3">
                <p className="text-gold-500/70 text-[10px] tracking-[0.25em] mb-1">NAVIGATE</p>
                <a href="#shop" className="hover:text-parchment-100 transition-colors">Shop</a>
                <a href="#process" className="hover:text-parchment-100 transition-colors">Our Process</a>
                <a href="#about" className="hover:text-parchment-100 transition-colors">About</a>
                <a href="/soap-calculator" className="text-gold-400 hover:text-gold-300 transition-colors">Soap Calculator</a>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-gold-500/70 text-[10px] tracking-[0.25em] mb-1">INFO</p>
                <a href="#" className="hover:text-parchment-100 transition-colors">Shipping</a>
                <a href="#" className="hover:text-parchment-100 transition-colors">Returns</a>
                <a href="#" className="hover:text-parchment-100 transition-colors">FAQ</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gold-500/20 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-parchment-500">
              © 2026 Coldstone Soap Co. All rights reserved.
            </p>
            <p className="text-[10px] text-gold-500/60 tracking-[0.25em] sm:tracking-[0.3em]">
              VETERAN OWNED &nbsp;·&nbsp; USA MADE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
