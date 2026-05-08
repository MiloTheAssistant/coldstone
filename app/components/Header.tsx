'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../cart/CartProvider';
import { mainNavLinks } from '../data/site';
import AuthActions from './AuthActions';
import Logo from './Logo';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-navy-900/95 backdrop-blur-md border-b border-gold-500/20 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-4 lg:gap-8">
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

          <div className="hidden md:flex min-w-[248px] lg:min-w-[280px]">
            <Logo variant="header" scrolled={scrolled} />
          </div>

          <div className="md:hidden absolute left-1/2 -translate-x-1/2">
            <Logo variant="mobile" scrolled={scrolled} />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center justify-end gap-4 lg:gap-6 xl:gap-7 ml-auto min-w-0">
            {mainNavLinks.map((link) => {
              const className = `text-[10px] lg:text-[11px] tracking-[0.16em] lg:tracking-[0.2em] transition-colors duration-300 uppercase whitespace-nowrap ${
                scrolled
                  ? 'text-parchment-400 hover:text-parchment-100'
                  : 'text-parchment-200 hover:text-parchment-100'
              }`;
              return link.target ? (
                <a key={link.label} href={link.href} target={link.target} rel={link.rel} className={className}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={link.href} className={className}>
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/cart"
              className={`text-[10px] lg:text-[11px] tracking-[0.16em] lg:tracking-[0.2em] transition-colors duration-300 whitespace-nowrap ${
                scrolled
                  ? 'text-gold-400 hover:text-gold-300'
                  : 'text-gold-300 hover:text-gold-200'
              }`}
            >
              CART{itemCount > 0 ? ` (${itemCount})` : ''}
            </Link>
            <AuthActions scrolled={scrolled} />
            <Link
              href="/shop"
              className={`text-[10px] lg:text-[11px] tracking-[0.16em] lg:tracking-[0.2em] px-4 lg:px-6 py-2.5 transition-all duration-300 whitespace-nowrap ${
                scrolled
                  ? 'bg-crimson-600 text-parchment-100 hover:bg-crimson-500'
                  : 'border border-crimson-600 text-parchment-100 hover:bg-crimson-600'
              }`}
            >
              SHOP NOW
            </Link>
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
        <nav className="relative h-full flex flex-col items-center justify-center gap-1 px-8 pt-10">
          <div
            className={`mb-8 transition-all duration-500 ${
              menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: menuOpen ? '70ms' : '0ms' }}
          >
            <Logo variant="mobile" />
          </div>

          {mainNavLinks.map((link, i) => {
            const className = `block py-4 text-center transition-all duration-500 ${
              menuOpen
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`;
            const style = { transitionDelay: menuOpen ? `${i * 80 + 100}ms` : '0ms' };
            const children = (
              <span className="font-serif text-3xl tracking-[0.15em] text-parchment-100 hover:text-gold-400 transition-colors">
                {link.label.toUpperCase()}
              </span>
            );

            return link.target ? (
              <a
                key={link.label}
                href={link.href}
                target={link.target}
                rel={link.rel}
                onClick={() => setMenuOpen(false)}
                className={className}
                style={style}
              >
                {children}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={className}
                style={style}
              >
                {children}
              </Link>
            );
          })}

          {/* Divider */}
          <div
            className={`w-12 h-px bg-gold-500/40 my-3 transition-all duration-500 ${
              menuOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
            style={{ transitionDelay: menuOpen ? '340ms' : '0ms' }}
          />

          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            className={`block py-4 text-center transition-all duration-500 ${
              menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: menuOpen ? '400ms' : '0ms' }}
          >
            <span className="font-serif text-2xl tracking-[0.15em] text-gold-400 hover:text-gold-300 transition-colors">
              CART{itemCount > 0 ? ` (${itemCount})` : ''}
            </span>
          </Link>

          <Link
            href="/sign-in"
            onClick={() => setMenuOpen(false)}
            className={`block py-4 text-center transition-all duration-500 ${
              menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: menuOpen ? '440ms' : '0ms' }}
          >
            <span className="font-serif text-2xl tracking-[0.15em] text-parchment-200 hover:text-gold-300 transition-colors">
              ACCOUNT
            </span>
          </Link>

          <Link
            href="/shop"
            onClick={() => setMenuOpen(false)}
            className={`mt-6 px-12 py-4 bg-crimson-600 text-parchment-100 text-sm tracking-[0.25em] hover:bg-crimson-500 transition-all duration-500 ${
              menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: menuOpen ? '480ms' : '0ms' }}
          >
            SHOP NOW
          </Link>

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
