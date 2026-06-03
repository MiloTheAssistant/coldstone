import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const globalsSource = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const calculatorSource = readFileSync(new URL('../app/soap-calculator/page.tsx', import.meta.url), 'utf8');
const accountSource = readFileSync(new URL('../app/soap-calculator/account/page.tsx', import.meta.url), 'utf8');
const calculatorLayoutSource = readFileSync(new URL('../app/soap-calculator/layout.tsx', import.meta.url), 'utf8');
const signInSource = readFileSync(new URL('../app/sign-in/[[...sign-in]]/page.tsx', import.meta.url), 'utf8');
const signUpSource = readFileSync(new URL('../app/sign-up/[[...sign-up]]/page.tsx', import.meta.url), 'utf8');
const ogImage = readFileSync(new URL('../public/soap-abacus/og-image.png', import.meta.url));

test('Soap Abacus uses a scoped clean-workshop theme wrapper', () => {
  assert.match(globalsSource, /\.soap-abacus-light/);
  assert.match(globalsSource, /--soap-bg:\s*#f7faf8/);
  assert.match(globalsSource, /--soap-sage:\s*#3f7f6a/);
  assert.match(globalsSource, /--soap-sky:\s*#1779b8/);
  assert.match(calculatorSource, /className="soap-abacus-light min-h-screen bg-midnight text-parchment-200"/);
  assert.match(accountSource, /className="soap-abacus-light min-h-screen bg-midnight text-parchment-200"/);
  assert.match(signInSource, /className="soap-abacus-light min-h-screen bg-midnight text-parchment-200/);
  assert.match(signUpSource, /className="soap-abacus-light min-h-screen bg-midnight text-parchment-200/);
});

test('Soap Abacus metadata uses the dedicated clean-workshop OG image', () => {
  assert.match(calculatorLayoutSource, /Soap Abacus \| Recipe Workspace for Makers/);
  assert.match(calculatorLayoutSource, /\/soap-abacus\/og-image\.png/);
  assert.match(calculatorLayoutSource, /A bright, maker-friendly soap recipe workspace/);
});

test('Soap Abacus lesson library promo stays readable in the light theme', () => {
  assert.match(calculatorSource, /LessonLibraryPromoBanner/);
  assert.match(calculatorSource, /rgba\(255, 255, 255, 0\.96\)/);
  assert.doesNotMatch(calculatorSource, /rgba\(2, 6, 14, 0\.94\)/);
});

test('Soap Abacus OG image is a nonempty 1200 by 630 PNG', () => {
  assert.ok(ogImage.length > 0);
  assert.equal(ogImage.subarray(1, 4).toString('ascii'), 'PNG');
  assert.equal(ogImage.readUInt32BE(16), 1200);
  assert.equal(ogImage.readUInt32BE(20), 630);
});
