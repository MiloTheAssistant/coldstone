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
      "A rugged blend of cedar and sage essential oils grounded in a triple-butter base. Dense lather, long-lasting bar, earthy finish. For those who demand more from every wash.",
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
    <div className="min-h-screen bg-stone-50">
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
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/65 via-stone-900/50 to-stone-900/80" />
        </div>

        <div className="relative z-10 text-center text-stone-50 px-6 max-w-5xl mx-auto">
          <p className="font-sans text-[10px] tracking-[0.6em] text-stone-300 mb-8 uppercase">
            Veteran Owned &nbsp;·&nbsp; Small Batch &nbsp;·&nbsp; USA Made
          </p>
          <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.08] mb-10 tracking-wide">
            Pure.<br />American.<br />Uncompromising.
          </h2>
          <a
            href="#shop"
            className="inline-block border border-stone-50/80 text-stone-50 px-14 py-4 text-[11px] tracking-[0.3em] hover:bg-stone-50 hover:text-stone-900 transition-all duration-300"
          >
            SHOP THE COLLECTION
          </a>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-stone-400 scroll-indicator">
          <span className="text-[9px] tracking-[0.45em]">SCROLL</span>
          <svg width="16" height="26" viewBox="0 0 16 26" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1" y="1" width="14" height="24" rx="7" />
            <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
          </svg>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="bg-stone-800 py-4 overflow-hidden">
        <div className="marquee-track">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="flex items-center gap-10 pr-10 text-stone-50 text-[10px] tracking-[0.45em] whitespace-nowrap"
            >
              <span>VETERAN OWNED</span>
              <span className="text-stone-600">✦</span>
              <span>COLD PROCESS</span>
              <span className="text-stone-600">✦</span>
              <span>SMALL BATCH</span>
              <span className="text-stone-600">✦</span>
              <span>USA MADE</span>
              <span className="text-stone-600">✦</span>
              <span>NATURAL INGREDIENTS</span>
              <span className="text-stone-600">✦</span>
              <span>CURED 4–6 WEEKS</span>
              <span className="text-stone-600">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Products ── */}
      <section id="shop" className="py-24 md:py-32 px-6 bg-stone-100">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-20">
            <p className="text-[10px] tracking-[0.5em] text-stone-400 mb-3">THE COLLECTION</p>
            <h3 className="font-serif text-3xl md:text-4xl text-stone-800">
              Crafted with Intention
            </h3>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
            {products.map((product, i) => (
              <ScrollReveal key={product.name} delay={i * 120} className="group">
                <div className="bg-stone-50 overflow-hidden">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-stone-900 text-stone-50 px-3.5 py-1.5 text-xs tracking-wider font-medium">
                      {product.price}
                    </div>
                  </div>

                  <div className="p-8">
                    <p className="text-[9px] tracking-[0.5em] text-stone-400 mb-2">{product.notes}</p>
                    <h4 className="font-serif text-2xl text-stone-800 mb-1">{product.name}</h4>
                    <p className="text-xs tracking-[0.2em] text-stone-400 mb-5 italic">{product.tagline}</p>
                    <p className="text-stone-500 text-sm leading-relaxed mb-7">{product.description}</p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {product.ingredients.map((ing) => (
                        <span
                          key={ing}
                          className="text-[9px] tracking-wider border border-stone-200 text-stone-400 px-3 py-1"
                        >
                          {ing.toUpperCase()}
                        </span>
                      ))}
                    </div>

                    <button className="w-full border border-stone-800 text-stone-800 py-3.5 text-[11px] tracking-[0.25em] hover:bg-stone-800 hover:text-stone-50 transition-colors duration-300">
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
      <section id="process" className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-20">
            <p className="text-[10px] tracking-[0.5em] text-stone-400 mb-3">HOW IT'S MADE</p>
            <h3 className="font-serif text-3xl md:text-4xl text-stone-800">Our Process</h3>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-14 md:gap-8 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-stone-200" />

            {processSteps.map((step, i) => (
              <ScrollReveal key={step.step} delay={i * 150} className="text-center">
                <div className="w-16 h-16 border border-stone-200 rounded-full mx-auto mb-7 flex items-center justify-center bg-stone-50 relative z-10">
                  <span className="font-serif text-base text-stone-600">{step.step}</span>
                </div>
                <h4 className="font-serif text-lg text-stone-800 mb-4">{step.title}</h4>
                <p className="text-sm text-stone-500 leading-relaxed">{step.detail}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 bg-stone-800">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <p className="text-[10px] tracking-[0.5em] text-stone-500 mb-3">REVIEWS</p>
            <h3 className="font-serif text-3xl md:text-4xl text-stone-50">
              What Men Are Saying
            </h3>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="border border-stone-700 p-8 h-full flex flex-col">
                  <p className="font-serif text-stone-600 text-3xl leading-none mb-4">"</p>
                  <p className="text-stone-300 text-sm leading-relaxed flex-1 mb-8">{t.quote}</p>
                  <div>
                    <div className="flex items-center gap-0.5 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <span key={j} className="text-stone-400 text-xs">★</span>
                      ))}
                    </div>
                    <p className="text-stone-50 text-xs tracking-wider">{t.author}</p>
                    <p className="text-stone-500 text-xs mt-1">{t.location}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div className="aspect-square relative overflow-hidden">
              <Image
                src="/black-granite.jpg"
                alt="Black Granite soap bar"
                fill
                className="object-cover"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <p className="text-[10px] tracking-[0.5em] text-stone-400 mb-5">OUR STORY</p>
            <h3 className="font-serif text-3xl md:text-4xl text-stone-800 mb-8 leading-snug">
              Built on Discipline
            </h3>
            <p className="text-stone-500 leading-relaxed mb-5 text-sm">
              Coldstone Soap Co. was founded on the belief that everyday essentials should be built
              with intention. As a veteran-owned small business, we apply the discipline and
              precision learned in service to the craft of soapmaking.
            </p>
            <p className="text-stone-500 leading-relaxed mb-10 text-sm">
              Each batch is produced using the traditional cold process method and slow-cured to
              ensure durability, skin compatibility, and real performance. No fillers. No shortcuts.
              No compromise.
            </p>
            <div className="flex flex-wrap gap-6 text-[10px] tracking-[0.35em] text-stone-400 border-t border-stone-200 pt-8">
              <span>VETERAN OWNED</span>
              <span>·</span>
              <span>SMALL BATCH</span>
              <span>·</span>
              <span>USA MADE</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-20 px-6 bg-stone-900">
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-[10px] tracking-[0.5em] text-stone-600 mb-4">STAY CONNECTED</p>
            <h3 className="font-serif text-2xl md:text-3xl text-stone-50 mb-4">
              Join the Inner Circle
            </h3>
            <p className="text-stone-400 text-sm mb-10">
              New batches. Limited runs. Early access. No spam — ever.
            </p>
            <NewsletterForm />
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-14 px-6 border-t border-stone-200 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div>
              <h5 className="font-serif text-xl tracking-[0.25em] text-stone-800">COLDSTONE</h5>
              <p className="text-[9px] tracking-[0.4em] text-stone-400 mt-1">SOAP CO.</p>
              <p className="text-stone-400 text-xs mt-5 max-w-xs leading-relaxed">
                Handcrafted cold process soap. Veteran owned. Made in the USA.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12 text-xs tracking-[0.15em] text-stone-400">
              <div className="flex flex-col gap-3">
                <p className="text-stone-600 text-[10px] tracking-[0.25em] mb-1">NAVIGATE</p>
                <a href="#shop" className="hover:text-stone-800 transition-colors">Shop</a>
                <a href="#process" className="hover:text-stone-800 transition-colors">Our Process</a>
                <a href="#about" className="hover:text-stone-800 transition-colors">About</a>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-stone-600 text-[10px] tracking-[0.25em] mb-1">INFO</p>
                <a href="#" className="hover:text-stone-800 transition-colors">Shipping</a>
                <a href="#" className="hover:text-stone-800 transition-colors">Returns</a>
                <a href="#" className="hover:text-stone-800 transition-colors">FAQ</a>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-stone-400">
              © 2026 Coldstone Soap Co. All rights reserved.
            </p>
            <p className="text-[10px] text-stone-400 tracking-[0.3em]">
              VETERAN OWNED &nbsp;·&nbsp; USA MADE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
