'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="text-gold-500 tracking-[0.2em] text-xs">
        You&apos;re on the list. We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="YOUR EMAIL ADDRESS"
        required
        className="flex-1 bg-transparent border border-gold-500/30 text-parchment-100 placeholder:text-parchment-500 px-5 py-3.5 text-[11px] tracking-[0.15em] focus:outline-none focus:border-gold-500 transition-colors"
      />
      <button
        type="submit"
        className="bg-crimson-600 text-parchment-100 px-8 py-3.5 text-[11px] tracking-[0.25em] hover:bg-crimson-500 transition-colors"
      >
        JOIN
      </button>
    </form>
  );
}
