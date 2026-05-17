'use client';

import Image from 'next/image';
import Link from 'next/link';
import CheckoutButton from './CheckoutButton';
import { useCart } from './CartProvider';
import { checkoutTrustLinks } from '../data/policies';
import { formatPrice } from '../data/products';

export default function CartPageContent() {
  const { items, itemCount, subtotalCents, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto border border-gold-500/15 bg-navy-900/70 p-6 sm:p-8 text-center">
        <h2 className="font-serif text-2xl text-parchment-100 mb-4">Your cart is empty.</h2>
        <p className="text-parchment-400 text-sm leading-relaxed mb-8">
          Add a bar or two and they will stay here while you keep browsing.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-crimson-600 text-parchment-100 px-8 py-4 text-[11px] tracking-[0.22em] hover:bg-crimson-500 transition-colors"
        >
          SHOP SOAP
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-10">
      <section className="space-y-4">
        {items.map((item) => (
          <article key={item.productId} className="border border-gold-500/15 bg-navy-900/70 p-4 sm:p-5">
            <div className="grid grid-cols-[96px_1fr] sm:grid-cols-[120px_1fr_auto] gap-4 items-center">
              <Link href={`/products/${item.slug}`} className="relative aspect-square overflow-hidden bg-midnight">
                <Image src={item.image} alt={`${item.name} soap bar`} fill className="object-cover" />
              </Link>

              <div>
                <Link href={`/products/${item.slug}`} className="font-serif text-xl text-parchment-100 hover:text-gold-300">
                  {item.name}
                </Link>
                <p className="text-gold-400 text-sm mt-1">{formatPrice(item.priceCents)}</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-[11px] tracking-[0.18em] text-parchment-500 hover:text-parchment-200 mt-4"
                >
                  REMOVE
                </button>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-end gap-3">
                <div className="flex items-center border border-gold-500/20">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-10 h-10 text-parchment-200 hover:bg-gold-500/10"
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
                    className="w-14 h-10 bg-transparent text-center text-parchment-100 text-sm focus:outline-none"
                    aria-label={`${item.name} quantity`}
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-10 h-10 text-parchment-200 hover:bg-gold-500/10"
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    +
                  </button>
                </div>
                <p className="text-parchment-100 font-semibold min-w-20 text-right">
                  {formatPrice(item.priceCents * item.quantity)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="border border-gold-500/20 bg-navy-900/80 p-5 sm:p-6 h-fit sticky top-28">
        <h2 className="font-serif text-2xl text-parchment-100 mb-5">Order Summary</h2>
        <div className="space-y-3 text-sm text-parchment-400 mb-6">
          <div className="flex justify-between">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-parchment-100">{formatPrice(subtotalCents)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Shipping & tax</span>
            <span className="text-right">Calculated in Checkout</span>
          </div>
        </div>
        <CheckoutButton />
        <Link
          href="/shop"
          className="mt-3 block text-center border border-gold-500/40 text-gold-400 px-8 py-4 text-[11px] tracking-[0.22em] hover:bg-gold-500/10 transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
        <div className="border-t border-gold-500/15 mt-5 pt-5">
          <p className="text-[11px] tracking-[0.18em] text-gold-500 mb-3 uppercase">Review before checkout</p>
          <div className="grid grid-cols-2 gap-2">
            {checkoutTrustLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border border-gold-500/15 px-3 py-2 text-center text-[10px] tracking-[0.16em] text-parchment-400 hover:border-gold-500/40 hover:text-gold-300 transition-colors"
              >
                {link.label.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="w-full text-[11px] tracking-[0.2em] text-parchment-500 hover:text-parchment-200 mt-5"
        >
          CLEAR CART
        </button>
      </aside>
    </div>
  );
}
