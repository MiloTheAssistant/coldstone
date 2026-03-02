# Soap Calculator — Next Phases Plan

## Current Architecture Summary
- **Next.js 15 App Router** with Tailwind CSS, fully client-side calculator
- `app/soap-calculator/page.tsx` — main page with 3 tabs (Calculator, Generator, Oils DB)
- `data/oils.ts` — 30+ oils/butters/fats/waxes with full SAP, fatty acid, iodine, INS data; 30+ recipe templates; additives database
- `data/calculator.ts` — property calculation, lye calculation, recipe generation, recipe evaluation
- All state lives in React `useState` — nothing persists between sessions
- No API routes, no database, no backend — everything is static/client-side

---

## Phase 1: Persistent Storage (Save/Load Recipes)
**Why first:** This is foundational infrastructure. Every subsequent feature (cost data, fragrance data, AI-generated recipes) needs a way to persist user data. Without it, users lose all work on page refresh — the single biggest usability gap right now. It also has zero external dependencies and unblocks phases 3–5.

### Implementation

**1a. Define a `SavedRecipe` type** in `data/calculator.ts`
```ts
interface SavedRecipe {
  id: string;           // crypto.randomUUID()
  name: string;
  createdAt: string;    // ISO date
  updatedAt: string;
  oils: { oilId: string; percent: number }[];
  totalOilWeight: number;
  unit: WeightUnit;
  lyeType: LyeType;
  superfat: number;
  waterRatio: number;
  notes?: string;
  // Future-proof fields (Phase 4 & 5 will populate these)
  oilCosts?: Record<string, number>;
  fragrances?: { name: string; percent: number; ifraMax: number }[];
}
```

**1b. Create `lib/storage.ts`** — a thin wrapper around `localStorage`
- `saveRecipe(recipe: SavedRecipe): void`
- `loadRecipes(): SavedRecipe[]`
- `deleteRecipe(id: string): void`
- `exportRecipes(): string` (JSON download)
- `importRecipes(json: string): void`
- All functions include try/catch for storage quota, SSR safety (`typeof window`)

**1c. Add "My Recipes" tab** to the tab nav (4th tab alongside Calculator, Generator, Oils DB)
- List saved recipes with name, date, oil count, quick-properties preview
- Click to load into calculator
- Delete with confirmation
- Import/export JSON buttons

**1d. Add "Save Recipe" button** to the Calculator tab
- Appears in the recipe settings panel
- Saves current state to localStorage
- Shows toast/flash confirmation
- If recipe was loaded from saved, offer "Update" vs "Save as New"

**Files touched:** `data/calculator.ts` (types), new `lib/storage.ts`, `page.tsx` (tab + save button + load handler)

---

## Phase 2: Print-Friendly Recipe Cards / PDF Export
**Why second:** Soapmakers need physical reference sheets at their workstation. This is a high-value, low-complexity feature that leverages everything already computed in the calculator. No new data or APIs needed — just presentation.

### Implementation

**2a. Create `components/PrintableRecipe.tsx`**
- A hidden-by-default `<div>` rendered with `@media print` styles
- Clean layout: recipe name, date, oil table (name, %, weight), lye/water amounts, properties summary, notes field
- Uses Coldstone branding (gold/navy color scheme adapted for print)
- Sized for US Letter / A4

**2b. Add CSS print styles** in `globals.css`
```css
@media print {
  body > *:not(.printable-recipe) { display: none; }
  .printable-recipe { display: block !important; }
}
```

**2c. Add "Print Recipe" button** to Calculator results section
- Triggers `window.print()` which activates the print stylesheet
- Browser's native print dialog handles PDF export (Save as PDF)
- No external library needed — keeps bundle small

**2d. Enhance with batch sheet format**
- Add a "Batch Sheet" variant with checkboxes for each step (weigh oils, mix lye, combine, etc.)
- Include space for handwritten batch notes, date, cure-by date

**Files touched:** new `components/PrintableRecipe.tsx`, `globals.css`, `page.tsx` (button + render)

---

## Phase 3: Custom AI-Powered Recipe Generator
**Why third:** The current generator matches from a static template list. An AI generator can create truly custom formulations by analyzing ingredient synergies, trending combinations, and specific user constraints. This is the marquee feature — but it depends on Phase 1 (to save generated recipes) and benefits from the existing properties engine.

### Implementation

**3a. Create API route `app/api/generate-recipe/route.ts`**
- POST endpoint accepting: goals, excluded oils, preferred properties, skin type, optional free-text prompt
- Calls Claude API (or OpenAI) with a system prompt that understands:
  - The oils database (passed as context or referenced)
  - SAP values, fatty acid profiles, property calculations
  - IFRA safety guidelines for fragrances
  - Trending ingredient combinations (e.g., tallow renaissance, J-beauty rice bran, African black soap)
- Returns a structured recipe: oil list with percentages, suggested additives, fragrance notes, recipe name, description
- Validates AI output server-side (percentages sum to 100, oils exist in DB, percentages within maxPercent)

**3b. Add `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`) to environment**
- Add to `.env.local` and Vercel environment variables
- Rate limit the endpoint (simple in-memory counter or Vercel KV)

**3c. Create "AI Generator" UI section** within the Generator tab
- Text input: "Describe your dream soap..."
- Constraint chips: skin type, budget, vegan, palm-free, etc.
- "Generate with AI" button with loading state
- Display result as a RecipeCard with a "Load into Calculator" action
- Show AI reasoning/explanation for ingredient choices

**3d. Trending ingredients analysis**
- Hardcode a curated "trending" dataset (updated periodically):
  - Ingredients gaining popularity (tallow, bakuchiol, snow mushroom, blue tansy)
  - Seasonal suggestions (peppermint in winter, citrus in summer)
- AI can reference these when generating recipes

**Files touched:** new `app/api/generate-recipe/route.ts`, `page.tsx` (AI generator UI in generator tab), `.env.local`

---

## Phase 4: Cost Calculator
**Why fourth:** Builds directly on Phase 1's saved recipe infrastructure. Soapmakers need to price their products — knowing cost-per-bar is essential for anyone selling. The oils database already has `costTier` — this phase makes it precise with actual dollar amounts.

### Implementation

**4a. Extend `OilData` or create a separate cost store**
- Option A: Add optional `pricePerUnit` and `priceUnit` fields to saved user preferences
- Option B (chosen): Create `lib/costData.ts` with a localStorage-backed cost table
  ```ts
  interface OilCostEntry {
    oilId: string;
    pricePerUnit: number;  // e.g., 12.99
    unitSize: number;      // e.g., 16
    unit: WeightUnit;      // e.g., 'oz'
    supplier?: string;
    lastUpdated: string;
  }
  ```
- Users enter their actual supplier prices once; costs persist via localStorage

**4b. Add cost calculation functions** to `data/calculator.ts`
- `calculateRecipeCost(recipe, costTable)` — total raw material cost
- `calculateCostPerBar(recipeCost, barsPerBatch)` — user inputs mold cavity count
- `calculateCostPerOunce(recipeCost, totalBatchWeight)`
- Include lye cost, water is free, optional additive costs

**4c. Add "Cost" panel** to the Calculator tab (right column, below properties)
- Shows per-oil cost breakdown in a table
- Total raw material cost
- "Bars per batch" input → cost per bar
- Suggested retail price (2.5x–4x markup ranges shown)
- Highlights oils where price data is missing (prompt to add)

**4d. Add "My Prices" section** in the My Recipes tab (Phase 1)
- Table of all oils with price inputs
- Import/export price data
- "Price check" column showing cost per oz for easy comparison

**Files touched:** new `lib/costData.ts`, `data/calculator.ts` (cost functions), `page.tsx` (cost panel UI)

---

## Phase 5: Fragrance Calculator (EO Safe Usage Rates & IFRA Compliance)
**Why last:** This is the most specialized feature, requiring accurate IFRA compliance data and careful safety messaging. It depends on Phase 1 (persistence), Phase 4 (cost integration for EO pricing), and benefits from Phase 3's AI (suggesting fragrance blends). It's also the most liability-sensitive — must include disclaimers.

### Implementation

**5a. Create `data/fragrances.ts`** — essential oil & fragrance oil database
```ts
interface FragranceData {
  id: string;
  name: string;
  type: 'essential-oil' | 'fragrance-oil' | 'absolute' | 'co2-extract';
  ifraMaxPercent: number;      // IFRA Category 9 (bar soap) max usage rate
  ifraCategory: number;        // IFRA amendment category
  commonUsagePercent: number;  // typical soapmaker usage rate
  flashPoint?: number;         // °F — relevant for melt & pour
  notes: string;
  safetyNotes: string;         // phototoxicity, sensitization, pregnancy warnings
  blendFamily: 'citrus' | 'floral' | 'herbal' | 'spicy' | 'woody' | 'earthy' | 'resinous' | 'minty';
  topMiddleBase: 'top' | 'middle' | 'base';
}
```
- ~50 common essential oils with verified IFRA data
- Sources: IFRA 51st Amendment, Tisserand & Young safety data

**5b. Add fragrance calculation functions**
- `calculateFragranceAmount(totalBatchWeight, usagePercent)` — grams/oz of EO needed
- `validateIFRACompliance(fragrances, batchWeight)` — check each EO against IFRA limits
- `suggestBlend(family, notes)` — suggest complementary EOs (top/middle/base balance)

**5c. Add "Fragrance" tab or panel** to the Calculator
- Search/browse essential oils
- Add EOs to recipe with usage percentage (slider capped at IFRA max)
- Real-time display: amount needed in grams/oz/drops (1 drop ≈ 0.05ml)
- IFRA compliance indicator (green/yellow/red) per oil and overall
- Blend harmony indicator (top/middle/base ratio visualization)
- Safety warnings displayed prominently (phototoxic citrus oils, etc.)

**5d. Integration with cost calculator (Phase 4)**
- EO costs can be added to the cost table
- Total fragrance cost added to batch cost calculation

**5e. Mandatory safety disclaimer**
- Prominent disclaimer: "This calculator provides general guidance. Always verify IFRA compliance with your fragrance supplier's documentation. Not a substitute for professional safety assessment."

**Files touched:** new `data/fragrances.ts`, `data/calculator.ts` (fragrance functions), `page.tsx` (fragrance UI panel)

---

## Recommended Build Order & Dependencies

```
Phase 1: Persistent Storage ←── foundational, no dependencies
   ↓
Phase 2: Print/PDF Export ←── no dependency on Phase 1, but benefits from saved recipes
   ↓
Phase 3: AI Recipe Generator ←── needs Phase 1 to save results, first API route
   ↓
Phase 4: Cost Calculator ←── needs Phase 1 for price persistence
   ↓
Phase 5: Fragrance Calculator ←── needs Phase 1 + Phase 4, most complex
```

Phases 1 & 2 can be developed in parallel (no dependencies between them).
Phases 4 & 5 could also be developed in parallel after Phase 1 is complete.
Phase 3 is independent of 4 & 5 but should come after Phase 1.
