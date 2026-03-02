'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { label: 'Shop', href: '#shop' },
    { label: 'Process', href: '#process' },
    { label: 'About', href: '#about' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-navy-900/95 backdrop-blur-md border-b border-gold-500/20 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          {/* Hamburger — larger touch target on mobile */}
          <button
            className="md:hidden relative z-[60] flex flex-col justify-center items-center w-10 h-10 -ml-2 shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`block h-[1.5px] w-5 transition-all duration-300 origin-center ${
                menuOpen
                  ? 'rotate-45 translate-y-[5px] bg-parchment-100'
                  : scrolled ? 'bg-parchment-200' : 'bg-parchment-100'
              }`}
            />
            <span
              className={`block h-[1.5px] w-5 mt-[5px] transition-all duration-300 ${
                menuOpen
                  ? 'opacity-0 scale-x-0'
                  : scrolled ? 'bg-parchment-200' : 'bg-parchment-100'
              }`}
            />
            <span
              className={`block h-[1.5px] w-5 mt-[5px] transition-all duration-300 origin-center ${
                menuOpen
                  ? '-rotate-45 -translate-y-[7px] bg-parchment-100'
                  : scrolled ? 'bg-parchment-200' : 'bg-parchment-100'
              }`}
            />
          </button>

          {/* Logo — centered */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <Link href="/" className="inline-block">
              <span
                className={`font-serif text-xl sm:text-2xl font-bold tracking-[0.25em] transition-colors duration-500 ${
                  scrolled ? 'text-gold-500' : 'text-parchment-100'
                }`}
              >
                COLDSTONE
              </span>
              <p
                className={`font-sans text-[8px] sm:text-[9px] tracking-[0.45em] mt-0.5 transition-colors duration-500 ${
                  scrolled ? 'text-gold-500/60' : 'text-parchment-300'
                }`}
              >
                SOAP CO.
              </p>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 ml-auto">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-[11px] tracking-[0.2em] transition-colors duration-300 uppercase ${
                  scrolled
                    ? 'text-parchment-400 hover:text-parchment-100'
                    : 'text-parchment-200 hover:text-parchment-100'
                }`}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/soap-calculator"
              className={`text-[11px] tracking-[0.2em] transition-colors duration-300 ${
                scrolled
                  ? 'text-gold-400 hover:text-gold-300'
                  : 'text-gold-300 hover:text-gold-200'
              }`}
            >
              SOAP CALC
            </Link>
            <a
              href="#shop"
              className={`text-[11px] tracking-[0.2em] px-6 py-2.5 transition-all duration-300 ${
                scrolled
                  ? 'bg-crimson-600 text-parchment-100 hover:bg-crimson-500'
                  : 'border border-crimson-600 text-parchment-100 hover:bg-crimson-600'
              }`}
            >
              SHOP NOW
            </a>
          </nav>

          {/* Spacer — balances hamburger on mobile */}
          <div className="md:hidden w-10 shrink-0" />
        </div>
      </header>

      {/* ── Full-screen mobile menu overlay ── */}
      <div
        className={`md:hidden fixed inset-0 z-[55] transition-all duration-500 ${
          menuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-midnight/98 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Menu content — centered vertically */}
        <nav className="relative h-full flex flex-col items-center justify-center gap-1 px-8">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-4 text-center transition-all duration-500 ${
                menuOpen
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: menuOpen ? `${i * 80 + 100}ms` : '0ms' }}
            >
              <span className="font-serif text-3xl tracking-[0.15em] text-parchment-100 hover:text-gold-400 transition-colors">
                {link.label.toUpperCase()}
              </span>
            </a>
          ))}

          {/* Divider */}
          <div
            className={`w-12 h-px bg-gold-500/40 my-3 transition-all duration-500 ${
              menuOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
            style={{ transitionDelay: menuOpen ? '340ms' : '0ms' }}
          />

          <Link
            href="/soap-calculator"
            onClick={() => setMenuOpen(false)}
            className={`block py-4 text-center transition-all duration-500 ${
              menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: menuOpen ? '400ms' : '0ms' }}
          >
            <span className="font-serif text-2xl tracking-[0.15em] text-gold-400 hover:text-gold-300 transition-colors">
              SOAP CALC
            </span>
          </Link>

          <a
            href="#shop"
            onClick={() => setMenuOpen(false)}
            className={`mt-6 px-12 py-4 bg-crimson-600 text-parchment-100 text-sm tracking-[0.25em] hover:bg-crimson-500 transition-all duration-500 ${
              menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: menuOpen ? '480ms' : '0ms' }}
          >
            SHOP NOW
          </a>

          {/* Bottom branding */}
          <div
            className={`absolute bottom-10 left-0 right-0 text-center transition-all duration-500 ${
              menuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: menuOpen ? '550ms' : '0ms' }}
          >
            <p className="text-[9px] tracking-[0.4em] text-gold-500/40">
              VETERAN OWNED &nbsp;&middot;&nbsp; USA MADE
            </p>
          </div>
        </nav>
      </div>
    </>
  );
}
