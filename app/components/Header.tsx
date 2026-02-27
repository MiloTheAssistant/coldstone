'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-stone-50/95 backdrop-blur-md border-b border-stone-200 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Hamburger (mobile only) */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 shrink-0"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-px bg-stone-800 transition-all duration-300 origin-center ${
              menuOpen ? 'rotate-45 translate-y-[7px] w-6' : 'w-6'
            }`}
          />
          <span
            className={`block h-px bg-stone-800 transition-all duration-300 w-6 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-px bg-stone-800 transition-all duration-300 origin-center ${
              menuOpen ? '-rotate-45 -translate-y-[7px] w-6' : 'w-6'
            }`}
          />
        </button>

        {/* Logo — centered on both mobile and desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <a href="/" className="inline-block">
            <span
              className={`font-serif text-2xl font-bold tracking-[0.25em] transition-colors duration-500 ${
                scrolled ? 'text-stone-800' : 'text-stone-50'
              }`}
            >
              COLDSTONE
            </span>
            <p
              className={`font-sans text-[9px] tracking-[0.45em] mt-0.5 transition-colors duration-500 ${
                scrolled ? 'text-stone-400' : 'text-stone-300'
              }`}
            >
              SOAP CO.
            </p>
          </a>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10 ml-auto">
          {['SHOP', 'PROCESS', 'ABOUT'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`text-[11px] tracking-[0.2em] transition-colors duration-300 hover:text-stone-900 ${
                scrolled ? 'text-stone-500' : 'text-stone-200'
              }`}
            >
              {item}
            </a>
          ))}
          <a
            href="#shop"
            className={`text-[11px] tracking-[0.2em] px-6 py-2.5 transition-all duration-300 ${
              scrolled
                ? 'bg-stone-800 text-stone-50 hover:bg-stone-700'
                : 'border border-stone-50 text-stone-50 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            SHOP NOW
          </a>
        </nav>

        {/* Spacer balances hamburger on mobile */}
        <div className="md:hidden w-8 shrink-0" />
      </div>

      {/* Mobile menu drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col items-center gap-7 py-9 bg-stone-50 border-t border-stone-200">
          {['SHOP', 'PROCESS', 'ABOUT'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className="text-sm tracking-[0.25em] text-stone-600 hover:text-stone-900 transition-colors"
            >
              {item}
            </a>
          ))}
          <a
            href="#shop"
            onClick={() => setMenuOpen(false)}
            className="text-sm tracking-[0.2em] bg-stone-800 text-stone-50 px-10 py-3 hover:bg-stone-700 transition-colors"
          >
            SHOP NOW
          </a>
        </nav>
      </div>
    </header>
  );
}
