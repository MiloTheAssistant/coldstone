import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '../../components/AddToCartButton';
import Header from '../../components/Header';
import SiteFooter from '../../components/SiteFooter';
import { checkoutTrustLinks, productTrustDetails } from '../../data/policies';
import { formatPrice, getProductBySlug, products } from '../../data/products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Coldstone Soap Co.',
    };
  }

  return {
    title: `${product.name} | Coldstone Soap Co.`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | Coldstone Soap Co.`,
      description: product.shortDescription,
      images: [{ url: product.image, width: 1200, height: 630, alt: `${product.name} soap bar` }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-midnight">
      <Header />
      <main className="px-5 sm:px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-16 items-start">
          <div className="relative aspect-[4/3] overflow-hidden border border-gold-500/20 bg-navy-900">
            <Image
              src={product.image}
              alt={`${product.name} soap bar`}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/30 to-transparent" />
          </div>

          <section>
            <p className="text-[10px] tracking-[0.4em] text-gold-500 mb-4 uppercase">{product.notes}</p>
            <h1 className="font-serif text-4xl md:text-5xl text-parchment-100 leading-tight mb-3">
              {product.name}
            </h1>
            <p className="text-parchment-400 italic tracking-[0.12em] text-sm mb-5">{product.tagline}</p>
            <p className="text-gold-400 text-2xl font-semibold mb-6">{formatPrice(product.priceCents)}</p>
            <p className="text-parchment-300 text-sm leading-relaxed mb-8">{product.description}</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="border border-gold-500/15 bg-navy-900/60 p-4">
                <h2 className="text-gold-400 text-xs tracking-[0.25em] mb-2 uppercase">Scent</h2>
                <p className="text-parchment-300 text-sm">{product.scentProfile.join(' / ')}</p>
              </div>
              <div className="border border-gold-500/15 bg-navy-900/60 p-4">
                <h2 className="text-gold-400 text-xs tracking-[0.25em] mb-2 uppercase">Bar</h2>
                <p className="text-parchment-300 text-sm">{product.weight}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-gold-400 text-xs tracking-[0.25em] mb-3 uppercase">Ingredients</h2>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="text-[10px] tracking-wider border border-gold-500/20 text-parchment-400 px-3 py-1.5"
                  >
                    {ingredient.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-parchment-400 text-sm leading-relaxed mb-8">{product.skinFeel}</p>

            <div className="grid sm:grid-cols-2 gap-3">
              <AddToCartButton
                product={product}
                className="bg-crimson-600 text-parchment-100 px-8 py-4 text-[11px] tracking-[0.22em] hover:bg-crimson-500 transition-colors disabled:cursor-not-allowed disabled:bg-navy-700 disabled:text-parchment-500"
              />
              <Link
                href="/shop"
                className="text-center border border-gold-500/40 text-gold-400 px-8 py-4 text-[11px] tracking-[0.22em] hover:bg-gold-500/10 transition-colors"
              >
                BACK TO SHOP
              </Link>
            </div>

            <div className="border-t border-gold-500/15 mt-8 pt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {productTrustDetails.map((item) => (
                  <article key={item.title} className="border border-gold-500/15 bg-navy-900/60 p-4">
                    <h2 className="text-gold-400 text-[11px] tracking-[0.22em] uppercase mb-2">{item.title}</h2>
                    <p className="text-parchment-400 text-sm leading-relaxed">{item.body}</p>
                  </article>
                ))}
              </div>

              <nav className="flex flex-wrap gap-x-4 gap-y-2 mt-5 text-[11px] tracking-[0.16em] text-parchment-500">
                {checkoutTrustLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-gold-300 transition-colors">
                    {link.label.toUpperCase()}
                  </Link>
                ))}
              </nav>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
