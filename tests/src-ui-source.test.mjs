import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const lookupPanelPath = new URL('../app/soap-calculator/components/SrcLookupPanel.tsx', import.meta.url);
const stampDialogPath = new URL('../app/soap-calculator/components/SrcStampDialog.tsx', import.meta.url);
const savedRecipesListPath = new URL('../app/soap-calculator/components/SavedRecipesList.tsx', import.meta.url);
const recipeCardPath = new URL('../app/soap-calculator/components/RecipeCard.tsx', import.meta.url);
const oilInfoPath = new URL('../app/soap-calculator/components/OilInfo.tsx', import.meta.url);
const calculatorPagePath = new URL('../app/soap-calculator/page.tsx', import.meta.url);
const costDataPath = new URL('../app/soap-calculator/lib/costData.ts', import.meta.url);
const accountPagePath = new URL('../app/soap-calculator/account/page.tsx', import.meta.url);
const middlewarePath = new URL('../middleware.ts', import.meta.url);
const signInPagePath = new URL('../app/sign-in/[[...sign-in]]/page.tsx', import.meta.url);
const signUpPagePath = new URL('../app/sign-up/[[...sign-up]]/page.tsx', import.meta.url);

test('Soap Abacus exposes SRC lookup panel source and renders it in Recipe Cache', () => {
  const lookupPanelSource = readFileSync(lookupPanelPath, 'utf8');
  const calculatorPageSource = readFileSync(calculatorPagePath, 'utf8');

  assert.match(lookupPanelSource, /Enter SRC/);
  assert.match(lookupPanelSource, /\/src\/\$\{normalized\}/);
  assert.match(calculatorPageSource, /import SrcLookupPanel from '\.\/components\/SrcLookupPanel';/);
  assert.match(calculatorPageSource, /<SrcLookupPanel \/>/);
});

test('Soap Abacus local development can run without Clerk configured', () => {
  const calculatorPageSource = readFileSync(calculatorPagePath, 'utf8');

  assert.match(calculatorPageSource, /const clerkEnabled = Boolean\(process\.env\.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\)/);
  assert.match(calculatorPageSource, /const localDevWithoutClerk = !clerkEnabled && process\.env\.NODE_ENV !== 'production'/);
  assert.match(calculatorPageSource, /if \(localDevWithoutClerk\) \{/);
  assert.match(calculatorPageSource, /<LocalDevSoapStudio \/>/);
  assert.match(calculatorPageSource, /function LocalDevSoapStudio\(\)/);
  assert.match(calculatorPageSource, /membership=\{PREVIEW_MEMBERSHIP\}/);
  assert.match(calculatorPageSource, /isReadOnlyPreview=\{false\}/);
});

test('Soap Abacus exposes SRC stamping dialog and saved recipe actions', () => {
  const stampDialogSource = readFileSync(stampDialogPath, 'utf8');
  const savedRecipesListSource = readFileSync(savedRecipesListPath, 'utf8');

  assert.match(stampDialogSource, /Stamp SRC only when this recipe is ready for production or sale/);
  assert.match(stampDialogSource, /revisionNotes/);
  assert.match(savedRecipesListSource, /canStampSrc/);
  assert.match(savedRecipesListSource, /\{canStampSrc && \(/);
  assert.match(savedRecipesListSource, /Stamp It/);
  assert.doesNotMatch(savedRecipesListSource, /Plus Stamp/);
  assert.match(savedRecipesListSource, /\/api\/recipes\/\$\{recipeId\}\/src/);
  assert.match(savedRecipesListSource, /stampError/);
  assert.match(stampDialogSource, /error\?: string \| null/);
  assert.match(savedRecipesListSource, /release\?\.publication\?\.srcCode/);
  assert.match(savedRecipesListSource, /release\?\.ilc\?\.ilcCode/);
  assert.match(savedRecipesListSource, /Number\.isFinite\(release\?\.revision\?\.revisionNumber\)/);
});

test('Soap Abacus clones SRC releases from public-safe data only', () => {
  const calculatorPageSource = readFileSync(calculatorPagePath, 'utf8');

  assert.match(calculatorPageSource, /const recipe = readPublicRecipe\(data\)/);
  assert.doesNotMatch(calculatorPageSource, /recipeSnapshot/);
  assert.match(calculatorPageSource, /setRecipeNotes\(''\)/);
  assert.match(calculatorPageSource, /OILS_DATABASE\.some\(oil => oil\.id === oilId\)/);
  assert.match(calculatorPageSource, /Number\.isFinite\(percent\)/);
  assert.match(calculatorPageSource, /percent > 0/);
  assert.match(calculatorPageSource, /Math\.min\(100, Math\.max\(0, percent\)\)/);
  assert.match(calculatorPageSource, /if \(oils\.length === 0\) throw new Error\('SRC release has no cloneable oils\.'\)/);
});

test('Recipe Blender and loaded templates expose SRC and ILC shopping lists', () => {
  const recipeCardSource = readFileSync(recipeCardPath, 'utf8');
  const calculatorPageSource = readFileSync(calculatorPagePath, 'utf8');

  assert.match(recipeCardSource, /template\.srcCode/);
  assert.match(recipeCardSource, /template\.ilcCode/);
  assert.match(recipeCardSource, /ILC Shopping List/);
  assert.match(recipeCardSource, /affiliateUrl/);
  assert.match(calculatorPageSource, /loadedTemplate/);
  assert.match(calculatorPageSource, /setLoadedTemplateId\(template\.id\)/);
  assert.match(calculatorPageSource, /Template SRC/);
  assert.match(calculatorPageSource, /ILC Shopping List/);
});

test('Ingredients DB oil modal edits landed ingredient cost', () => {
  const oilInfoSource = readFileSync(oilInfoPath, 'utf8');
  const calculatorPageSource = readFileSync(calculatorPagePath, 'utf8');
  const costDataSource = readFileSync(costDataPath, 'utf8');

  assert.match(costDataSource, /shippingCost\?: number/);
  assert.match(costDataSource, /taxCost\?: number/);
  assert.match(costDataSource, /entry\.pricePerUnit \+ \(entry\.shippingCost \|\| 0\) \+ \(entry\.taxCost \|\| 0\)/);
  assert.match(oilInfoSource, /Item Cost/);
  assert.match(oilInfoSource, /Shipping/);
  assert.match(oilInfoSource, /Tax/);
  assert.match(oilInfoSource, /Landed cost/);
  assert.match(calculatorPageSource, /handleSaveIngredientCost/);
  assert.match(calculatorPageSource, /onSaveCostEntry=\{handleSaveIngredientCost\}/);
  assert.match(calculatorPageSource, /onRemoveCostEntry=\{handleRemoveIngredientCost\}/);
});

test('Ingredients DB separates base oils, fragrance, additives, liquids, and all ingredients', () => {
  const calculatorPageSource = readFileSync(calculatorPagePath, 'utf8');

  assert.match(calculatorPageSource, /FRAGRANCES_DATABASE/);
  assert.match(calculatorPageSource, /type IngredientsDbView = 'base-oils' \| 'fragrance' \| 'colorants' \| 'additives' \| 'liquids' \| 'all'/);
  assert.match(calculatorPageSource, /Essential Oils & Fragrances/);
  assert.match(calculatorPageSource, /IFRA Max/);
  assert.match(calculatorPageSource, /Flash Point/);
  assert.match(calculatorPageSource, /Colorants/);
  assert.match(calculatorPageSource, /Liquids/);
  assert.match(calculatorPageSource, /All Ingredients/);
  assert.match(calculatorPageSource, /ingredientCostKey\('fragrance'/);
  assert.match(calculatorPageSource, /ingredientCostKey\('additive'/);
});

test('Soap Abacus account page redirects signed-out users to Clerk sign in', () => {
  const accountPageSource = readFileSync(accountPagePath, 'utf8');

  assert.match(accountPageSource, /import \{ redirect \} from 'next\/navigation';/);
  assert.match(accountPageSource, /if \(!user\) \{/);
  assert.match(accountPageSource, /redirect\('\/sign-in\?redirect_url=\/soap-calculator\/account'\)/);
  assert.match(accountPageSource, /defaultFreeMembership\(user\.id\)/);
  assert.doesNotMatch(accountPageSource, /defaultFreeMembership\(user\?\.id \|\| ''\)/);
  assert.doesNotMatch(accountPageSource, /Signed-in account/);
});

test('Soap Abacus middleware keeps the root domain canonical for calculator traffic', () => {
  const middlewareSource = readFileSync(middlewarePath, 'utf8');

  assert.match(middlewareSource, /SOAP_ABACUS_CANONICAL_REDIRECTS/);
  assert.match(middlewareSource, /soapAbacusUrl\.pathname = '\/'/);
  assert.match(middlewareSource, /canonicalUrl\.pathname = '\/'/);
  assert.match(middlewareSource, /if \(pathname === '\/'\) \{/);
  assert.match(middlewareSource, /rewriteUrl\.pathname = '\/soap-calculator'/);
  assert.match(middlewareSource, /if \(isSoapAbacusRoute\(pathname\)\) return undefined/);
});

test('Soap Abacus Clerk auth pages keep hosted social login flow and account return path', () => {
  const signInPageSource = readFileSync(signInPagePath, 'utf8');
  const signUpPageSource = readFileSync(signUpPagePath, 'utf8');

  assert.match(signInPageSource, /const SOAP_ABACUS_ACCOUNT_URL = '\/soap-calculator\/account';/);
  assert.match(signUpPageSource, /const SOAP_ABACUS_ACCOUNT_URL = '\/soap-calculator\/account';/);
  assert.match(signInPageSource, /<SignIn[\s\S]*fallbackRedirectUrl=\{SOAP_ABACUS_ACCOUNT_URL\}[\s\S]*signUpUrl="\/sign-up"[\s\S]*\/>/);
  assert.match(signUpPageSource, /<SignUp[\s\S]*fallbackRedirectUrl=\{SOAP_ABACUS_ACCOUNT_URL\}[\s\S]*signInUrl="\/sign-in"[\s\S]*\/>/);
  assert.doesNotMatch(signInPageSource, /oauth_google|oauth_microsoft|oauth_apple/);
  assert.doesNotMatch(signUpPageSource, /oauth_google|oauth_microsoft|oauth_apple/);
});
