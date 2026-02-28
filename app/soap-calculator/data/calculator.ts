import { OILS_DATABASE, OilData, PROPERTY_RANGES, RECIPE_TEMPLATES, RecipeTemplate } from './oils';

// ─── Types ───────────────────────────────────────────────────────────────────

export type LyeType = 'NaOH' | 'KOH';
export type WeightUnit = 'oz' | 'lb' | 'g' | 'kg';

export interface RecipeOil {
  oil: OilData;
  percent: number;
  weight: number; // calculated from total oil weight
}

export interface SoapProperties {
  hardness: number;
  cleansing: number;
  conditioning: number;
  bubbly: number;
  creamy: number;
  iodine: number;
  ins: number;
}

export interface LyeResult {
  lyeWeight: number;
  waterWeight: number;
  totalOilWeight: number;
  superfatPercent: number;
  lyeType: LyeType;
  waterRatio: number;
  unit: WeightUnit;
}

export interface FullRecipeResult {
  oils: RecipeOil[];
  lye: LyeResult;
  properties: SoapProperties;
  totalBatchWeight: number;
}

// ─── Unit Conversion ─────────────────────────────────────────────────────────

const TO_GRAMS: Record<WeightUnit, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  const grams = value * TO_GRAMS[from];
  return grams / TO_GRAMS[to];
}

// ─── Property Calculation ────────────────────────────────────────────────────

/**
 * Calculate weighted soap properties from a list of oils + percentages.
 * Each property is the weighted average of the oils' fatty acid contributions.
 */
export function calculateProperties(oils: { oil: OilData; percent: number }[]): SoapProperties {
  const totalPercent = oils.reduce((s, o) => s + o.percent, 0);
  if (totalPercent === 0) {
    return { hardness: 0, cleansing: 0, conditioning: 0, bubbly: 0, creamy: 0, iodine: 0, ins: 0 };
  }

  let hardness = 0, cleansing = 0, conditioning = 0, bubbly = 0, creamy = 0, iodine = 0, ins = 0;

  for (const { oil, percent } of oils) {
    const w = percent / totalPercent; // normalized weight
    const fa = oil.fattyAcids;

    hardness     += w * (fa.lauric + fa.myristic + fa.palmitic + fa.stearic);
    cleansing    += w * (fa.lauric + fa.myristic);
    conditioning += w * (fa.oleic + fa.ricinoleic + fa.linoleic + fa.linolenic);
    bubbly       += w * (fa.lauric + fa.myristic + fa.ricinoleic);
    creamy       += w * (fa.palmitic + fa.stearic + fa.ricinoleic);
    iodine       += w * oil.iodine;
    ins          += w * oil.ins;
  }

  return {
    hardness: Math.round(hardness),
    cleansing: Math.round(cleansing),
    conditioning: Math.round(conditioning),
    bubbly: Math.round(bubbly),
    creamy: Math.round(creamy),
    iodine: Math.round(iodine),
    ins: Math.round(ins),
  };
}

// ─── Lye Calculation ─────────────────────────────────────────────────────────

const KOH_NAOH_RATIO = 1.403;

/**
 * Calculate the lye and water needed for a given recipe.
 *
 * @param oils - Array of oils with their weights (in the chosen unit)
 * @param superfatPercent - Superfat discount (default 5%)
 * @param lyeType - NaOH (bar) or KOH (liquid)
 * @param waterRatio - Water-to-lye ratio (default 2:1 i.e. 2)
 * @param unit - Weight unit
 */
export function calculateLye(
  oils: { oil: OilData; weight: number }[],
  superfatPercent: number = 5,
  lyeType: LyeType = 'NaOH',
  waterRatio: number = 2,
  unit: WeightUnit = 'oz',
): LyeResult {
  const totalOilWeight = oils.reduce((s, o) => s + o.weight, 0);
  let totalLye = 0;

  for (const { oil, weight } of oils) {
    const sap = lyeType === 'NaOH' ? oil.sapNaOH : oil.sapKOH / 1000;
    totalLye += weight * sap;
  }

  // Apply superfat discount
  const lyeWeight = totalLye * (1 - superfatPercent / 100);
  const waterWeight = lyeWeight * waterRatio;

  return {
    lyeWeight: round(lyeWeight, 2),
    waterWeight: round(waterWeight, 2),
    totalOilWeight: round(totalOilWeight, 2),
    superfatPercent,
    lyeType,
    waterRatio,
    unit,
  };
}

// ─── Full Recipe Calculation ─────────────────────────────────────────────────

/**
 * Calculate everything for a recipe given oil percentages and total batch oil weight.
 */
export function calculateFullRecipe(
  oilEntries: { oil: OilData; percent: number }[],
  totalOilWeight: number,
  superfatPercent: number = 5,
  lyeType: LyeType = 'NaOH',
  waterRatio: number = 2,
  unit: WeightUnit = 'oz',
): FullRecipeResult {
  const oils: RecipeOil[] = oilEntries.map(({ oil, percent }) => ({
    oil,
    percent,
    weight: round((percent / 100) * totalOilWeight, 2),
  }));

  const properties = calculateProperties(oilEntries);

  const lye = calculateLye(
    oils.map(o => ({ oil: o.oil, weight: o.weight })),
    superfatPercent,
    lyeType,
    waterRatio,
    unit,
  );

  const totalBatchWeight = round(lye.totalOilWeight + lye.lyeWeight + lye.waterWeight, 2);

  return { oils, lye, properties, totalBatchWeight };
}

// ─── Recipe Generator ────────────────────────────────────────────────────────

export type RecipeGoal =
  | 'moisturizing'
  | 'cleansing'
  | 'hard-bar'
  | 'luxury'
  | 'budget'
  | 'vegan'
  | 'palm-free'
  | 'tallow-based'
  | 'lard-based'
  | 'trendy'
  | 'gentle'
  | 'all-purpose'
  | 'exfoliating';

/**
 * Generate a recipe based on goals/preferences.
 * Uses template matching + property optimization.
 */
export function generateRecipe(
  goals: RecipeGoal[],
  excludeOilIds: string[] = [],
): { template: RecipeTemplate; properties: SoapProperties } | null {
  // Score templates based on matching tags
  const goalToTags: Record<RecipeGoal, string[]> = {
    'moisturizing': ['moisturizing', 'conditioning', 'luxury', 'gentle'],
    'cleansing': ['cleansing', 'detox', 'exfoliating', 'heavy-duty'],
    'hard-bar': ['hard-bar', 'long-lasting', 'salt-bar'],
    'luxury': ['luxury', 'spa', 'premium', 'gift'],
    'budget': ['budget', 'everyday', 'beginner'],
    'vegan': ['vegan', 'palm-free', 'sustainable', 'ethical'],
    'palm-free': ['palm-free', 'sustainable', 'vegan'],
    'tallow-based': ['tallow', 'traditional', 'hard-bar'],
    'lard-based': ['everyday', 'creamy', 'traditional', 'budget'],
    'trendy': ['trendy', 'unique', 'exotic', 'j-beauty', 'african'],
    'gentle': ['gentle', 'sensitive-skin', 'baby', 'soothing'],
    'all-purpose': ['everyday', 'beginner', 'classic'],
    'exfoliating': ['exfoliating', 'heavy-duty', 'scrub'],
  };

  const scoredTemplates = RECIPE_TEMPLATES.map(template => {
    let score = 0;
    const matchTags = goals.flatMap(g => goalToTags[g] || []);
    for (const tag of template.tags) {
      if (matchTags.includes(tag)) score += 2;
    }
    // Penalty if template uses excluded oils
    const hasExcluded = template.oils.some(o => excludeOilIds.includes(o.oilId));
    if (hasExcluded) score -= 10;

    return { template, score };
  })
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scoredTemplates.length === 0) return null;

  // Pick a random template from the top 3 for variety
  const topN = scoredTemplates.slice(0, Math.min(3, scoredTemplates.length));
  const chosen = topN[Math.floor(Math.random() * topN.length)];

  // Calculate properties
  const oilEntries = chosen.template.oils
    .map(o => {
      const oil = OILS_DATABASE.find(db => db.id === o.oilId);
      return oil ? { oil, percent: o.percent } : null;
    })
    .filter((e): e is { oil: OilData; percent: number } => e !== null);

  const properties = calculateProperties(oilEntries);

  return { template: chosen.template, properties };
}

/**
 * Get all templates matching certain tags
 */
export function searchRecipes(searchTags: string[]): { template: RecipeTemplate; properties: SoapProperties }[] {
  return RECIPE_TEMPLATES
    .filter(t => searchTags.some(tag => t.tags.includes(tag)))
    .map(template => {
      const oilEntries = template.oils
        .map(o => {
          const oil = OILS_DATABASE.find(db => db.id === o.oilId);
          return oil ? { oil, percent: o.percent } : null;
        })
        .filter((e): e is { oil: OilData; percent: number } => e !== null);

      return { template, properties: calculateProperties(oilEntries) };
    });
}

/**
 * Evaluate how well a recipe's properties fall within recommended ranges
 */
export function evaluateRecipe(properties: SoapProperties): {
  property: string;
  value: number;
  min: number;
  max: number;
  status: 'low' | 'good' | 'high';
}[] {
  return Object.entries(PROPERTY_RANGES).map(([key, range]) => {
    const value = properties[key as keyof SoapProperties];
    let status: 'low' | 'good' | 'high';
    if (value < range.min) status = 'low';
    else if (value > range.max) status = 'high';
    else status = 'good';

    return { property: range.label, value, min: range.min, max: range.max, status };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function round(n: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}
