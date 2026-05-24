import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const lookupPanelPath = new URL('../app/soap-calculator/components/SrcLookupPanel.tsx', import.meta.url);
const calculatorPagePath = new URL('../app/soap-calculator/page.tsx', import.meta.url);

test('Soap Abacus exposes SRC lookup panel source and renders it in Recipe Cache', () => {
  const lookupPanelSource = readFileSync(lookupPanelPath, 'utf8');
  const calculatorPageSource = readFileSync(calculatorPagePath, 'utf8');

  assert.match(lookupPanelSource, /Enter SRC/);
  assert.match(lookupPanelSource, /\/src\/\$\{normalized\}/);
  assert.match(calculatorPageSource, /import SrcLookupPanel from '\.\/components\/SrcLookupPanel';/);
  assert.match(calculatorPageSource, /<SrcLookupPanel \/>/);
});
