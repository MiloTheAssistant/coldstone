import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const headerSource = readFileSync(new URL('../app/components/Header.tsx', import.meta.url), 'utf8');
const logoSource = readFileSync(new URL('../app/components/Logo.tsx', import.meta.url), 'utf8');
const siteSource = readFileSync(new URL('../app/data/site.ts', import.meta.url), 'utf8');
const layoutSource = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');

test('desktop header does not absolutely center the logo over navigation', () => {
  assert.equal(headerSource.includes('absolute left-1/2 -translate-x-1/2 text-center'), false);
  assert.equal(headerSource.includes('Logo — centered'), false);
  assert.match(headerSource, /hidden md:flex min-w-\[248px\]/);
});

test('header and footer use the shared Coldstone logo component', () => {
  const footerSource = readFileSync(new URL('../app/components/SiteFooter.tsx', import.meta.url), 'utf8');

  assert.match(headerSource, /import Logo from '\.\/Logo'/);
  assert.match(headerSource, /<Logo\s+variant="header"/);
  assert.match(footerSource, /import Logo from '\.\/Logo'/);
  assert.match(footerSource, /<Logo\s+variant="footer"/);
});

test('logo assets include selected horizontal and mark files', () => {
  const badge = readFileSync(new URL('../public/brand/coldstone-s-badge.svg', import.meta.url), 'utf8');
  const mark = readFileSync(new URL('../public/brand/coldstone-logo-mark.svg', import.meta.url), 'utf8');
  const icon = readFileSync(new URL('../app/icon.svg', import.meta.url), 'utf8');

  assert.match(badge, /feTurbulence/);
  assert.match(badge, />S</);
  assert.match(mark, />S</);
  assert.match(icon, />S</);
});

test('logo wordmark is real HTML text with centered Soap Co. copy', () => {
  assert.match(logoSource, />COLDSTONE</);
  assert.match(logoSource, />SOAP CO\.</);
  assert.doesNotMatch(logoSource, /SOAP COMPANY/);
  assert.doesNotMatch(logoSource, /coldstone-logo-horizontal\.svg/);
  assert.match(logoSource, /text-center/);
});

test('header logo avoids boxed plaque styling', () => {
  assert.doesNotMatch(logoSource, /border border-gold/);
  assert.doesNotMatch(logoSource, /bg-midnight\/70/);
  assert.doesNotMatch(logoSource, /radial-gradient/);
  assert.doesNotMatch(logoSource, /shadow-\[inset/);
  assert.match(logoSource, /rounded-full/);
});

test('soap calculator links open Soap Abacus in a new browser context', () => {
  const footerSource = readFileSync(new URL('../app/components/SiteFooter.tsx', import.meta.url), 'utf8');
  const homeSource = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

  assert.match(siteSource, /href:\s*SOAP_ABACUS_URL/);
  assert.match(siteSource, /https:\/\/www\.soapabacus\.com/);
  assert.match(siteSource, /target:\s*'_blank'/);
  assert.match(headerSource, /target=\{link\.target\}/);
  assert.match(headerSource, /rel=\{link\.rel\}/);
  assert.match(footerSource, /target=\{link\.target\}/);
  assert.match(footerSource, /rel=\{link\.rel\}/);
  assert.match(homeSource, /href=\{SOAP_ABACUS_LINK\.href\}/);
  assert.match(homeSource, /target=\{SOAP_ABACUS_LINK\.target\}/);
  assert.match(homeSource, /rel=\{SOAP_ABACUS_LINK\.rel\}/);
});

test('Coldstone website metadata uses the www production domain', () => {
  assert.match(layoutSource, /metadataBase:\s*new URL\("https:\/\/www\.coldstonesoap\.com"\)/);
});
