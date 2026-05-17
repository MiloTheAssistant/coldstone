import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton';
import { formatPrice, type Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="group bg-navy-900 border border-gold-500/20 overflow-hidden hover:border-gold-500/50 transition-colors duration-500 rounded-sm h-full flex flex-col">
      <Link href={`/products/${product.slug}`} className="block aspect-[3/2] sm:aspect-[4/3] relative overflow-hidden">
        <Image
          src={product.campaignImage}
          alt={`${product.name} campaign image`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-crimson-600 text-parchment-100 px-3 py-1.5 text-xs tracking-wider font-medium">
          {formatPrice(product.priceCents)}
        </div>
      </Link>

      <div className="p-5 sm:p-8 flex flex-col flex-1">
        <p className="text-[9px] tracking-[0.35em] sm:tracking-[0.45em] text-gold-500/70 mb-2">
          {product.notes.toUpperCase()}
        </p>
        <h3 className="font-serif text-xl sm:text-2xl text-parchment-100 mb-1">{product.name}</h3>
        <p className="text-xs tracking-[0.15em] sm:tracking-[0.2em] text-parchment-400 mb-4 italic">
          {product.tagline}
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.16em]">
          <span className="font-semibold text-gold-400">{formatPrice(product.priceCents)}</span>
          <span className="text-parchment-500">{product.weight}</span>
          <span className="text-parchment-500">
            {product.inventoryStatus === 'in-stock' ? 'In stock' : 'Out of stock'}
          </span>
        </div>
        <p className="text-parchment-400 text-sm leading-relaxed mb-6">{product.shortDescription}</p>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
          {product.ingredients.slice(0, 5).map((ingredient) => (
            <span
              key={ingredient}
              className="text-[8px] sm:text-[9px] tracking-wider border border-gold-500/20 text-parchment-500 px-2 sm:px-2.5 py-1"
            >
              {ingredient.toUpperCase()}
            </span>
          ))}
        </div>

        <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/products/${product.slug}`}
            className="text-center border border-gold-500 text-gold-500 py-3.5 text-[11px] tracking-[0.18em] hover:bg-gold-500 hover:text-midnight transition-colors duration-300"
          >
            VIEW DETAILS
          </Link>
          <AddToCartButton product={product} label={`ADD - ${formatPrice(product.priceCents)}`} />
        </div>
      </div>
    </article>
  );
}
