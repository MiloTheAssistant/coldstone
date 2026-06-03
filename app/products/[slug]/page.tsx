import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '../../components/AddToCartButton';
import Breadcrumbs from '../../components/Breadcrumbs';
import Header from '../../components/Header';
import JsonLd from '../../components/JsonLd';
import SiteFooter from '../../components/SiteFooter';
import { checkoutTrustLinks, productTrustDetails } from '../../data/policies';
import { formatPrice, getProductBySlug, products } from '../../data/products';
import { SOAP_ABACUS_LINK } from '../../data/site';
import { SITE_NAME, SITE_URL, absoluteUrl, breadcrumbSchema } from '../../lib/seo';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

interface ProductGuideLink {
  label: string;
  href: string;
  target?: '_blank';
  rel?: 'noopener noreferrer';
}

interface ProductGuide {
  summary: string;
  care: string;
  links: ProductGuideLink[];
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

const productGuides: Record<string, ProductGuide> = {
  'black-granite': {
    summary:
      'Black Granite is Coldstone Soap Co.\'s charcoal-forward cold process soap bar. It combines olive oil, coconut oil, shea butter, activated charcoal, and tea tree oil in an approximate 4.5 oz bar designed for everyday washing. The bar leans crisp, herbal, and mineral-dark without making cosmetic or medical claims. Choose Black Granite when you want a straightforward handmade soap with a deep visual identity, clear ingredient list, and a cool tea tree scent direction.',
    care:
      'Use Black Granite like a daily wash bar, then keep it on a draining soap dish where air can reach the bottom between uses. Activated charcoal gives the bar its dark look, while cure time and dry storage help the bar stay practical in the shower, sink, or travel kit.',
    links: [
      { label: 'Read about activated charcoal soap', href: '/blog/activated-charcoal-soap-what-it-is' },
      { label: 'Learn why handmade soap cures', href: '/blog/why-handmade-soap-needs-to-cure' },
      { label: 'Use SoapAbacus for recipe planning', href: SOAP_ABACUS_LINK.href, target: SOAP_ABACUS_LINK.target, rel: SOAP_ABACUS_LINK.rel },
    ],
  },
  'stone-forge': {
    summary:
      'Stone Forge is Coldstone Soap Co.\'s cedar-and-sage cold process soap bar. It uses olive oil, coconut oil, shea butter, cocoa butter, cedar oil, and sage oil in an approximate 4.5 oz bar with a warmer wood-and-herb scent profile. The bar is built for ordinary daily washing, dense lather, and a grounded finish rather than perfume-heavy styling. Choose Stone Forge when you want a sturdy handmade soap with a richer butter-forward base and an earthy scent direction.',
    care:
      'Use Stone Forge as a daily bar and let it dry between washes. A draining dish, airflow, and avoiding standing water matter because handmade soap lasts longer when the bar can firm back up after each use.',
    links: [
      { label: 'Read about cedar and sage soap', href: '/blog/cedar-and-sage-earthy-soap-bar' },
      { label: 'Make a bar last longer', href: '/blog/make-a-bar-last-longer' },
      { label: 'Open the soapmaking lesson library', href: '/soap-making' },
    ],
  },
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Coldstone Soap Co.',
    };
  }

  return {
    title: `${product.name} | ${SITE_NAME}`,
    description: product.shortDescription,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description: product.shortDescription,
      url: `${SITE_URL}/products/${product.slug}`,
      images: [{ url: product.campaignImage, width: 1200, height: 630, alt: `${product.name} campaign image` }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/products/${product.slug}#product`,
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: [absoluteUrl(product.campaignImage), absoluteUrl(product.storyImage)],
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability:
        product.inventoryStatus === "in-stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: product.name, path: `/products/${product.slug}` },
  ];
  const guide = productGuides[product.slug];

  return (
    <div className="min-h-screen bg-midnight">
      <JsonLd data={[productSchema, breadcrumbSchema(breadcrumbs)]} />
      <Header />
      <main className="px-5 sm:px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-16 items-start">
          <div className="relative aspect-[4/3] overflow-hidden border border-gold-500/20 bg-navy-900">
            <Image
              src={product.campaignImage}
              alt={`${product.name} campaign image`}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/30 to-transparent" />
          </div>

          <section>
            <Breadcrumbs items={breadcrumbs} />
            <p className="text-[10px] tracking-[0.4em] text-gold-500 mb-4 uppercase">{product.notes}</p>
            <h1 className="font-serif text-4xl md:text-5xl text-parchment-100 leading-tight mb-3">
              {product.name}
            </h1>
            <p className="text-parchment-400 italic tracking-[0.12em] text-sm mb-5">{product.tagline}</p>
            <p className="text-gold-400 text-2xl font-semibold mb-6">{formatPrice(product.priceCents)}</p>
            <p className="text-parchment-300 text-sm leading-relaxed mb-8">{product.description}</p>

            <div className="mb-8 border border-gold-500/15 bg-navy-900/55 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold-400">
                  {product.inventoryStatus === 'in-stock' ? 'Ready to ship' : 'Currently unavailable'}
                </p>
                <p className="text-sm text-parchment-400">Secure checkout through Stripe</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <AddToCartButton
                  product={product}
                  label={`ADD TO CART - ${formatPrice(product.priceCents)}`}
                  className="bg-crimson-600 text-parchment-100 px-8 py-4 text-[11px] tracking-[0.18em] hover:bg-crimson-500 transition-colors disabled:cursor-not-allowed disabled:bg-navy-700 disabled:text-parchment-500"
                />
                <Link
                  href="/cart"
                  className="text-center border border-gold-500/40 text-gold-400 px-8 py-4 text-[11px] tracking-[0.22em] hover:bg-gold-500/10 transition-colors"
                >
                  REVIEW CART
                </Link>
              </div>
            </div>

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

            {guide ? (
              <section className="mb-8 space-y-4 border border-gold-500/20 bg-navy-900/55 p-5">
                <div>
                  <h2 className="mb-3 font-serif text-2xl text-parchment-100">What is {product.name}?</h2>
                  <p className="text-sm leading-8 text-parchment-300">{guide.summary}</p>
                </div>
                <div>
                  <h2 className="mb-3 text-gold-400 text-xs tracking-[0.25em] uppercase">Care and related guides</h2>
                  <p className="mb-4 text-sm leading-7 text-parchment-400">{guide.care}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {guide.links.map((link) =>
                      link.href.startsWith('http') ? (
                        <a
                          key={link.href}
                          href={link.href}
                          target={link.target}
                          rel={link.rel}
                          className="border border-gold-500/20 px-3 py-3 text-xs leading-5 text-parchment-300 hover:border-gold-500/50 hover:text-gold-300"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="border border-gold-500/20 px-3 py-3 text-xs leading-5 text-parchment-300 hover:border-gold-500/50 hover:text-gold-300"
                        >
                          {link.label}
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              </section>
            ) : null}

            <div className="mb-8 grid grid-cols-[0.7fr_1fr] gap-4 border border-gold-500/15 bg-navy-900/45 p-3">
              <div className="relative min-h-40 overflow-hidden">
                <Image
                  src={product.storyImage}
                  alt={`${product.name} vertical campaign crop`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 180px, 35vw"
                />
              </div>
              <div className="flex flex-col justify-center py-3 pr-2">
                <h2 className="text-gold-400 text-xs tracking-[0.25em] mb-3 uppercase">Built for the Kit</h2>
                <p className="text-parchment-400 text-sm leading-relaxed">
                  A field-ready bar with enough visual weight for the counter, the shower, and the travel kit.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href="/shop"
                className="text-center border border-gold-500/40 text-gold-400 px-8 py-4 text-[11px] tracking-[0.22em] hover:bg-gold-500/10 transition-colors sm:col-span-2"
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
