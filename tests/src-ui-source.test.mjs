import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const lookupPanelPath = new URL('../app/soap-calculator/components/SrcLookupPanel.tsx', import.meta.url);
const stampDialogPath = new URL('../app/soap-calculator/components/SrcStampDialog.tsx', import.meta.url);
const savedRecipesListPath = new URL('../app/soap-calculator/components/SavedRecipesList.tsx', import.meta.url);
const calculatorPagePath = new URL('../app/soap-calculator/page.tsx', import.meta.url);

test('Soap Abacus exposes SRC lookup panel source and renders it in Recipe Cache', () => {
  const lookupPanelSource = readFileSync(lookupPanelPath, 'utf8');
  const calculatorPageSource = readFileSync(calculatorPagePath, 'utf8');

  assert.match(lookupPanelSource, /Enter SRC/);
  assert.match(lookupPanelSource, /\/src\/\$\{normalized\}/);
  assert.match(calculatorPageSource, /import SrcLookupPanel from '\.\/components\/SrcLookupPanel';/);
  assert.match(calculatorPageSource, /<SrcLookupPanel \/>/);
});

test('Soap Abacus exposes SRC stamping dialog and saved recipe actions', () => {
  const stampDialogSource = readFileSync(stampDialogPath, 'utf8');
  const savedRecipesListSource = readFileSync(savedRecipesListPath, 'utf8');

  assert.match(stampDialogSource, /Stamp SRC only when this recipe is ready for production or sale/);
  assert.match(stampDialogSource, /revisionNotes/);
  assert.match(savedRecipesListSource, /canStampSrc/);
  assert.match(savedRecipesListSource, /Stamp It/);
  assert.match(savedRecipesListSource, /\/api\/recipes\/\$\{recipeId\}\/src/);
  assert.match(savedRecipesListSource, /stampError/);
  assert.match(stampDialogSource, /error\?: string \| null/);
  assert.match(savedRecipesListSource, /release\?\.publication\?\.srcCode/);
  assert.match(savedRecipesListSource, /release\?\.ilc\?\.ilcCode/);
  assert.match(savedRecipesListSource, /Number\.isFinite\(release\?\.revision\?\.revisionNumber\)/);
});
