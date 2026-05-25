'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const SRC_PATTERN = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;

function normalizeSrcInput(value: string) {
  return value
    .replace(/[^A-Za-z0-9]/g, '')
    .match(/.{1,4}/g)
    ?.join('-') ?? '';
}

export default function SrcLookupPanel() {
  const router = useRouter();
  const [srcCode, setSrcCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalized = normalizeSrcInput(srcCode);
    if (!SRC_PATTERN.test(normalized)) {
      setMessage('Enter the full SRC in xxxx-xxxx-xxxx-xxxx-xxxx format.');
      return;
    }

    setMessage(null);
    router.push(`/src/${normalized}`);
  };

  return (
    <section className="rounded-xl border border-gold-500/20 bg-navy-900/60 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-gold-500/70">Soap Recipe Code</p>
          <h2 className="mt-1 font-serif text-xl text-gold-300">Enter SRC</h2>
          <p className="mt-2 max-w-2xl text-sm text-parchment-500">
            Look up a public Soap Abacus release by its stamped SRC.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-xl">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="src-code">
              Enter SRC
            </label>
            <input
              id="src-code"
              type="text"
              inputMode="text"
              autoComplete="off"
              value={srcCode}
              onChange={(event) => {
                setSrcCode(normalizeSrcInput(event.target.value));
                setMessage(null);
              }}
              placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
              className="min-w-0 flex-1 rounded-lg border border-navy-600/40 bg-navy-800 px-3 py-2 font-mono text-sm text-parchment-200 placeholder-parchment-600 outline-none transition-colors focus:border-gold-500/60"
            />
            <button
              type="submit"
              className="rounded-lg border border-gold-500/20 bg-gold-500/20 px-4 py-2 text-xs font-semibold text-gold-300 transition-colors hover:bg-gold-500/30"
            >
              Open SRC
            </button>
          </div>
          {message && (
            <p className="mt-2 text-xs text-gold-300" role="status">
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
