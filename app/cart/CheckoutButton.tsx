'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

export default function CheckoutButton() {
  const { items } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Checkout could not be started.');
        return;
      }

      if (!data.url) {
        setError('Checkout did not return a payment URL.');
        return;
      }

      window.location.assign(data.url);
    } catch {
      setError('Network error starting checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isLoading || items.length === 0}
        className="w-full border border-gold-500 text-gold-400 px-8 py-4 text-[11px] tracking-[0.22em] hover:bg-gold-500 hover:text-midnight transition-colors disabled:cursor-wait disabled:opacity-70"
      >
        {isLoading ? 'STARTING CHECKOUT...' : 'SECURE CHECKOUT'}
      </button>
      {error && (
        <p className="mt-3 text-sm leading-relaxed text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
