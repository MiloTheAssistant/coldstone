import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const pageSource = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('homepage uses art-directed desktop and mobile hero assets', () => {
  assert.match(pageSource, /coldstone-hero-desktop\.jpg/);
  assert.match(pageSource, /coldstone-hero-mobile\.jpg/);
  assert.doesNotMatch(pageSource, /Pure\.<br \/>Natural\.<br \/>Uncompromising\./);
  assert.match(pageSource, /Stone-Stamped Soap/);
  assert.match(pageSource, /Built for Hard Use/);
  assert.match(pageSource, /Field Kit Soap/);
});

test('generated hero image files exist and are substantive jpegs', () => {
  for (const file of [
    '../public/hero/coldstone-hero-desktop.jpg',
    '../public/hero/coldstone-hero-mobile.jpg',
  ]) {
    const url = new URL(file, import.meta.url);
    assert.equal(existsSync(url), true, `${file} is missing`);
    assert.ok(statSync(url).size > 40_000, `${file} is too small to be a real hero image`);
  }
});

test('homepage avoids the rejected black logo graphic', () => {
  assert.equal(pageSource.includes('/black-granite.jpg'), false);
});
