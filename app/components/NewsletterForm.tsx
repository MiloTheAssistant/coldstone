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
      <p className="text-stone-300 tracking-[0.2em] text-xs">
        You're on the list. We'll be in touch.
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
        className="flex-1 bg-transparent border border-stone-700 text-stone-50 placeholder:text-stone-600 px-5 py-3.5 text-[11px] tracking-[0.15em] focus:outline-none focus:border-stone-400 transition-colors"
      />
      <button
        type="submit"
        className="bg-stone-50 text-stone-900 px-8 py-3.5 text-[11px] tracking-[0.25em] hover:bg-stone-200 transition-colors"
      >
        JOIN
      </button>
    </form>
  );
}
