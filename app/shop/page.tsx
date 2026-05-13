import type { Metadata } from 'next';
import Header from '../components/Header';
import PageIntro from '../components/PageIntro';
import ProductCard from '../components/ProductCard';
import SiteFooter from '../components/SiteFooter';
import { trustHighlights } from '../data/policies';
import { products } from '../data/products';

export const metadata: Metadata = {
  title: 'Shop Cold Process Soap | Coldstone Soap Co.',
  description:
    'Shop handcrafted cold process soap from Coldstone Soap Co. Small batch, veteran owned, and made in the USA.',
  alternates: {
    canonical: '/shop',
  },
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-midnight">
      <Header />
      <PageIntro
        eyebrow="Shop"
        title="Small-batch bars built for daily use."
        description="Explore Coldstone bars made with traditional cold process methods, slow cure time, and ingredient choices that stay focused on performance."
      />
      <main className="px-5 sm:px-6 pb-16 md:pb-24 bg-navy-800 grain-overlay stars-bg">
        <div className="max-w-6xl mx-auto pt-12">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index === 0} />
            ))}
          </div>

          <section className="mt-12 md:mt-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trustHighlights.map((item) => (
                <article key={item.title} className="border border-gold-500/15 bg-midnight/55 p-5">
                  <h2 className="text-gold-400 text-[11px] tracking-[0.22em] uppercase mb-3">{item.title}</h2>
                  <p className="text-parchment-400 text-sm leading-relaxed">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
