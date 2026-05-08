import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const siteSource = readFileSync(new URL('../app/data/site.ts', import.meta.url), 'utf8');
const calculatorSource = readFileSync(new URL('../app/soap-calculator/page.tsx', import.meta.url), 'utf8');
const calculatorLayoutSource = readFileSync(new URL('../app/soap-calculator/layout.tsx', import.meta.url), 'utf8');

test('Coldstone and Soap Abacus domains route to separate experiences', () => {
  assert.match(middlewareSource, /COLDSTONE_HOSTS/);
  assert.match(middlewareSource, /SOAP_ABACUS_HOSTS/);
  assert.match(middlewareSource, /pathname\.startsWith\('\/soap-calculator'\)/);
  assert.match(middlewareSource, /https:\/\/www\.soapabacus\.com/);
  assert.match(middlewareSource, /NextResponse\.redirect\(soapAbacusUrl\)/);
  assert.match(middlewareSource, /NextResponse\.rewrite\(rewriteUrl\)/);
  assert.match(middlewareSource, /https:\/\/www\.coldstonesoap\.com/);
});

test('Coldstone calculator links advertise the Soap Abacus root in a new tab', () => {
  assert.match(siteSource, /SOAP_ABACUS_URL = 'https:\/\/www\.soapabacus\.com'/);
  assert.match(siteSource, /target:\s*'_blank'/);
  assert.match(siteSource, /rel:\s*'noopener noreferrer'/);
});

test('Soap Abacus Studio has Soap Abacus metadata and product-site home link', () => {
  assert.match(calculatorLayoutSource, /metadataBase:\s*new URL\('https:\/\/www\.soapabacus\.com'\)/);
  assert.match(calculatorLayoutSource, /Soap Abacus Studio \| Recipe Designer/);
  assert.match(calculatorSource, /href="https:\/\/www\.coldstonesoap\.com"/);
});
