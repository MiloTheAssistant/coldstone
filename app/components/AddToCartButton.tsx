'use client';

import { useState } from 'react';
import { useCart } from '../cart/CartProvider';
import type { Product } from '../data/products';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  label?: string;
}

export default function AddToCartButton({
  product,
  className,
  label = 'ADD TO CART',
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
      disabled={product.inventoryStatus === 'out-of-stock'}
      className={
        className ??
        'w-full border border-crimson-600 text-parchment-100 py-3.5 text-[11px] tracking-[0.18em] hover:bg-crimson-600 transition-colors duration-300 disabled:cursor-not-allowed disabled:border-parchment-600 disabled:text-parchment-600'
      }
      aria-label={`Add ${product.name} to cart`}
    >
      {product.inventoryStatus === 'out-of-stock' ? 'OUT OF STOCK' : added ? 'ADDED' : label}
    </button>
  );
}
