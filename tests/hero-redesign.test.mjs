import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const pageSource = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('homepage uses art-directed desktop and mobile hero assets', () => {
  assert.match(pageSource, /coldstone-field-kit-ritual-desktop\.png/);
  assert.match(pageSource, /coldstone-field-kit-ritual-mobile\.png/);
  assert.doesNotMatch(pageSource, /Pure\.<br \/>Natural\.<br \/>Uncompromising\./);
  assert.match(pageSource, /Built for the Ritual/);
  assert.match(pageSource, /Ready for Hard Use/);
  assert.match(pageSource, /Field Kit Ritual/);
});

test('homepage integrates the expanded campaign image library', () => {
  for (const asset of [
    'maker-bench-process.png',
    'ingredient-still-life.png',
    'packing-bench.png',
    'bathroom-ritual-use-context.png',
  ]) {
    assert.match(pageSource, new RegExp(asset));
  }
});

test('generated hero image files exist and are substantive pngs', () => {
  for (const file of [
    '../public/hero/coldstone-field-kit-ritual-desktop.png',
    '../public/hero/coldstone-field-kit-ritual-mobile.png',
  ]) {
    const url = new URL(file, import.meta.url);
    assert.equal(existsSync(url), true, `${file} is missing`);
    assert.ok(statSync(url).size > 40_000, `${file} is too small to be a real hero image`);
  }
});

test('homepage avoids the rejected black logo graphic', () => {
  assert.equal(pageSource.includes('/black-granite.jpg'), false);
});
