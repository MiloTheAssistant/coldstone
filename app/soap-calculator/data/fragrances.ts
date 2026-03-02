// Essential Oil & Fragrance Oil Database
// IFRA Category 9 (Bar Soap / Hard Soap) maximum usage rates
// Sources: IFRA 51st Amendment, Tisserand & Young "Essential Oil Safety" 2nd Edition

export interface FragranceData {
  id: string;
  name: string;
  type: 'essential-oil' | 'fragrance-oil' | 'absolute' | 'co2-extract';
  /** IFRA Category 9 (bar soap) max usage rate as percentage of total batch weight */
  ifraMaxPercent: number;
  /** Typical soapmaker usage rate (% of oil weight) */
  commonUsagePercent: number;
  /** Flash point in °F — relevant for melt & pour */
  flashPoint?: number;
  /** General notes */
  notes: string;
  /** Safety warnings */
  safetyNotes: string;
  /** Scent family */
  blendFamily: 'citrus' | 'floral' | 'herbal' | 'spicy' | 'woody' | 'earthy' | 'resinous' | 'minty';
  /** Note position in fragrance pyramid */
  notePosition: 'top' | 'middle' | 'base';
}

export const FRAGRANCES_DATABASE: FragranceData[] = [
  // ═══════════════════════════════════════
  // CITRUS
  // ═══════════════════════════════════════
  {
    id: 'bergamot',
    name: 'Bergamot',
    type: 'essential-oil',
    ifraMaxPercent: 3.0,
    commonUsagePercent: 2.0,
    flashPoint: 147,
    notes: 'Bright, citrusy with a floral undertone. Very popular in soap making.',
    safetyNotes: 'Phototoxic — use bergaptene-free (FCF) version for leave-on products. Cold process soap is generally safe at recommended usage.',
    blendFamily: 'citrus',
    notePosition: 'top',
  },
  {
    id: 'grapefruit-pink',
    name: 'Grapefruit (Pink)',
    type: 'essential-oil',
    ifraMaxPercent: 4.0,
    commonUsagePercent: 2.5,
    flashPoint: 115,
    notes: 'Fresh, sweet citrus. Fades faster than other EOs in cold process.',
    safetyNotes: 'Mildly phototoxic. Generally safe in wash-off products like soap.',
    blendFamily: 'citrus',
    notePosition: 'top',
  },
  {
    id: 'lemon',
    name: 'Lemon',
    type: 'essential-oil',
    ifraMaxPercent: 4.0,
    commonUsagePercent: 2.0,
    flashPoint: 118,
    notes: 'Clean, bright citrus. Scent fades in CP soap — use at higher end or anchor with base notes.',
    safetyNotes: 'Phototoxic when expressed (cold-pressed). Distilled lemon is not phototoxic.',
    blendFamily: 'citrus',
    notePosition: 'top',
  },
  {
    id: 'lemongrass',
    name: 'Lemongrass',
    type: 'essential-oil',
    ifraMaxPercent: 3.5,
    commonUsagePercent: 2.0,
    flashPoint: 167,
    notes: 'Strong, fresh lemony-herbal scent. Excellent staying power in cold process soap.',
    safetyNotes: 'Can be a skin sensitizer in high concentrations. Stick to recommended usage.',
    blendFamily: 'citrus',
    notePosition: 'top',
  },
  {
    id: 'lime',
    name: 'Lime (Distilled)',
    type: 'essential-oil',
    ifraMaxPercent: 4.0,
    commonUsagePercent: 2.0,
    flashPoint: 120,
    notes: 'Zesty, fresh lime. Distilled version is safer than cold-pressed.',
    safetyNotes: 'Cold-pressed lime is phototoxic. Use distilled for soap to avoid phototoxicity.',
    blendFamily: 'citrus',
    notePosition: 'top',
  },
  {
    id: 'orange-sweet',
    name: 'Orange (Sweet)',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 3.0,
    flashPoint: 115,
    notes: 'Sweet, warm citrus. Very affordable. Fades quickly in CP — anchor with patchouli or vanilla.',
    safetyNotes: 'Not phototoxic. Very well tolerated. One of the safest EOs.',
    blendFamily: 'citrus',
    notePosition: 'top',
  },
  {
    id: 'orange-blood',
    name: 'Orange (Blood)',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 3.0,
    flashPoint: 115,
    notes: 'Deeper, more complex citrus than sweet orange. Slightly better staying power.',
    safetyNotes: 'Not phototoxic. Safe at recommended usage.',
    blendFamily: 'citrus',
    notePosition: 'top',
  },
  {
    id: 'yuzu',
    name: 'Yuzu',
    type: 'essential-oil',
    ifraMaxPercent: 3.0,
    commonUsagePercent: 1.5,
    flashPoint: 130,
    notes: 'Distinctive Japanese citrus. Bright, tart, and floral. Trendy and unique.',
    safetyNotes: 'May be mildly phototoxic. Use distilled version when available.',
    blendFamily: 'citrus',
    notePosition: 'top',
  },

  // ═══════════════════════════════════════
  // FLORAL
  // ═══════════════════════════════════════
  {
    id: 'geranium',
    name: 'Geranium',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.0,
    flashPoint: 167,
    notes: 'Sweet, rosy, herbaceous. Excellent in floral blends. Good staying power.',
    safetyNotes: 'Generally safe. Rare sensitization in sensitive individuals.',
    blendFamily: 'floral',
    notePosition: 'middle',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.5,
    flashPoint: 156,
    notes: 'The most versatile and popular EO in soap making. Floral, calming, herbaceous.',
    safetyNotes: 'One of the safest EOs. Suitable for all skin types including sensitive skin.',
    blendFamily: 'floral',
    notePosition: 'middle',
  },
  {
    id: 'lavender-spike',
    name: 'Lavender (Spike)',
    type: 'essential-oil',
    ifraMaxPercent: 3.0,
    commonUsagePercent: 1.5,
    flashPoint: 145,
    notes: 'Sharper, more camphoraceous than true lavender. Good for men\'s blends.',
    safetyNotes: 'Higher in camphor than true lavender. Avoid during pregnancy.',
    blendFamily: 'floral',
    notePosition: 'middle',
  },
  {
    id: 'rose-geranium',
    name: 'Rose Geranium',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.0,
    flashPoint: 167,
    notes: 'Rose-like scent at a fraction of the cost of rose otto. Popular in luxury soaps.',
    safetyNotes: 'Generally safe. Same profile as regular geranium.',
    blendFamily: 'floral',
    notePosition: 'middle',
  },
  {
    id: 'ylang-ylang',
    name: 'Ylang Ylang',
    type: 'essential-oil',
    ifraMaxPercent: 3.0,
    commonUsagePercent: 1.0,
    flashPoint: 200,
    notes: 'Sweet, exotic, intensely floral. Use sparingly — very strong. Blends well with citrus.',
    safetyNotes: 'Can cause headaches if overused. May be sensitizing at high concentrations.',
    blendFamily: 'floral',
    notePosition: 'middle',
  },
  {
    id: 'jasmine-absolute',
    name: 'Jasmine Absolute',
    type: 'absolute',
    ifraMaxPercent: 3.0,
    commonUsagePercent: 0.5,
    flashPoint: 200,
    notes: 'Rich, sweet, intensely floral. Very expensive — use sparingly as an accent.',
    safetyNotes: 'Generally safe at recommended usage. Some individuals may be sensitive.',
    blendFamily: 'floral',
    notePosition: 'middle',
  },
  {
    id: 'chamomile-roman',
    name: 'Chamomile (Roman)',
    type: 'essential-oil',
    ifraMaxPercent: 4.0,
    commonUsagePercent: 1.0,
    flashPoint: 156,
    notes: 'Sweet, fruity-herbaceous. Calming. Very gentle — great for baby soaps.',
    safetyNotes: 'Very safe. Suitable for children and sensitive skin.',
    blendFamily: 'floral',
    notePosition: 'middle',
  },

  // ═══════════════════════════════════════
  // HERBAL
  // ═══════════════════════════════════════
  {
    id: 'basil-sweet',
    name: 'Basil (Sweet)',
    type: 'essential-oil',
    ifraMaxPercent: 2.0,
    commonUsagePercent: 1.0,
    flashPoint: 156,
    notes: 'Fresh, sweet, herbal-spicy. Interesting in kitchen/garden soap blends.',
    safetyNotes: 'Avoid during pregnancy. Contains estragole — use linalool chemotype when possible.',
    blendFamily: 'herbal',
    notePosition: 'top',
  },
  {
    id: 'clary-sage',
    name: 'Clary Sage',
    type: 'essential-oil',
    ifraMaxPercent: 4.0,
    commonUsagePercent: 2.0,
    flashPoint: 175,
    notes: 'Herbaceous, slightly sweet, musky. Excellent fixative for blends.',
    safetyNotes: 'Avoid during pregnancy. Do not combine with alcohol.',
    blendFamily: 'herbal',
    notePosition: 'middle',
  },
  {
    id: 'rosemary',
    name: 'Rosemary',
    type: 'essential-oil',
    ifraMaxPercent: 4.0,
    commonUsagePercent: 2.0,
    flashPoint: 109,
    notes: 'Fresh, camphoraceous, herbaceous. Great in kitchen and garden soaps.',
    safetyNotes: 'Avoid in high concentration during pregnancy or with epilepsy. ct. cineole is safest.',
    blendFamily: 'herbal',
    notePosition: 'middle',
  },
  {
    id: 'tea-tree',
    name: 'Tea Tree',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.0,
    flashPoint: 140,
    notes: 'Medicinal, clean, fresh. Popular for acne and problem skin soaps.',
    safetyNotes: 'Can oxidize and become sensitizing. Use fresh oil and store properly.',
    blendFamily: 'herbal',
    notePosition: 'middle',
  },
  {
    id: 'thyme',
    name: 'Thyme (ct. linalool)',
    type: 'essential-oil',
    ifraMaxPercent: 2.0,
    commonUsagePercent: 1.0,
    flashPoint: 147,
    notes: 'Warm, herbaceous. Linalool chemotype is gentler than thymol. Antimicrobial.',
    safetyNotes: 'Thymol chemotype is a strong skin irritant — only use linalool chemotype in soap.',
    blendFamily: 'herbal',
    notePosition: 'middle',
  },
  {
    id: 'sage',
    name: 'Sage (Common)',
    type: 'essential-oil',
    ifraMaxPercent: 2.0,
    commonUsagePercent: 1.0,
    flashPoint: 150,
    notes: 'Strong, herbaceous, camphoraceous. Use sparingly.',
    safetyNotes: 'High in thujone. Avoid during pregnancy. Use clary sage as safer alternative.',
    blendFamily: 'herbal',
    notePosition: 'middle',
  },

  // ═══════════════════════════════════════
  // MINTY
  // ═══════════════════════════════════════
  {
    id: 'peppermint',
    name: 'Peppermint',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.5,
    flashPoint: 156,
    notes: 'Strong, cooling, minty. Very popular. Creates a tingling sensation on skin.',
    safetyNotes: 'Can be irritating to sensitive skin at high usage. Keep away from eyes. Avoid on children under 6.',
    blendFamily: 'minty',
    notePosition: 'top',
  },
  {
    id: 'spearmint',
    name: 'Spearmint',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.5,
    flashPoint: 156,
    notes: 'Sweet, minty, gentler than peppermint. Great alternative for sensitive skin.',
    safetyNotes: 'Generally safer than peppermint. Well tolerated by most individuals.',
    blendFamily: 'minty',
    notePosition: 'top',
  },
  {
    id: 'eucalyptus-globulus',
    name: 'Eucalyptus (Globulus)',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.0,
    flashPoint: 120,
    notes: 'Strong, camphoraceous, fresh. Popular in cold/flu and menthol soaps.',
    safetyNotes: 'Not for use on children under 10. Can be irritating to sensitive skin.',
    blendFamily: 'minty',
    notePosition: 'top',
  },

  // ═══════════════════════════════════════
  // SPICY
  // ═══════════════════════════════════════
  {
    id: 'cinnamon-leaf',
    name: 'Cinnamon Leaf',
    type: 'essential-oil',
    ifraMaxPercent: 1.0,
    commonUsagePercent: 0.5,
    flashPoint: 167,
    notes: 'Warm, spicy. Use very sparingly. Can accelerate trace. Good holiday soap accent.',
    safetyNotes: 'Strong skin irritant and sensitizer. Never use cinnamon bark EO in soap. Leaf is safer but still use minimally.',
    blendFamily: 'spicy',
    notePosition: 'middle',
  },
  {
    id: 'clove-bud',
    name: 'Clove Bud',
    type: 'essential-oil',
    ifraMaxPercent: 1.5,
    commonUsagePercent: 0.5,
    flashPoint: 214,
    notes: 'Warm, rich, spicy. Use sparingly as accent note. Can discolor soap brown.',
    safetyNotes: 'Skin irritant — keep below 0.5%. Can cause sensitization. Never use clove stem or leaf.',
    blendFamily: 'spicy',
    notePosition: 'middle',
  },
  {
    id: 'ginger',
    name: 'Ginger',
    type: 'essential-oil',
    ifraMaxPercent: 3.0,
    commonUsagePercent: 1.5,
    flashPoint: 140,
    notes: 'Warm, spicy, fresh. Works beautifully with citrus EOs.',
    safetyNotes: 'Generally safe at recommended usage. May cause mild irritation on very sensitive skin.',
    blendFamily: 'spicy',
    notePosition: 'middle',
  },
  {
    id: 'black-pepper',
    name: 'Black Pepper',
    type: 'essential-oil',
    ifraMaxPercent: 3.0,
    commonUsagePercent: 1.0,
    flashPoint: 156,
    notes: 'Warm, sharp, spicy. Interesting accent note in men\'s blends.',
    safetyNotes: 'Can be irritating at high usage. Keep below 1.5% in soap.',
    blendFamily: 'spicy',
    notePosition: 'middle',
  },
  {
    id: 'cardamom',
    name: 'Cardamom',
    type: 'essential-oil',
    ifraMaxPercent: 4.0,
    commonUsagePercent: 1.5,
    flashPoint: 156,
    notes: 'Warm, sweet-spicy, aromatic. Wonderful in chai or exotic spice blends.',
    safetyNotes: 'Generally safe. Well tolerated in soap at recommended usage.',
    blendFamily: 'spicy',
    notePosition: 'middle',
  },

  // ═══════════════════════════════════════
  // WOODY
  // ═══════════════════════════════════════
  {
    id: 'cedarwood-atlas',
    name: 'Cedarwood (Atlas)',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 3.0,
    flashPoint: 185,
    notes: 'Warm, woody, slightly sweet. Excellent base note and fixative. Very affordable.',
    safetyNotes: 'Avoid during pregnancy. Generally well tolerated in soap.',
    blendFamily: 'woody',
    notePosition: 'base',
  },
  {
    id: 'cedarwood-virginia',
    name: 'Cedarwood (Virginia)',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 3.0,
    flashPoint: 175,
    notes: 'Pencil-wood scent. Drier than Atlas cedar. Great base for men\'s soaps.',
    safetyNotes: 'Avoid during pregnancy. Generally safe in soap.',
    blendFamily: 'woody',
    notePosition: 'base',
  },
  {
    id: 'pine-scotch',
    name: 'Pine (Scotch)',
    type: 'essential-oil',
    ifraMaxPercent: 4.0,
    commonUsagePercent: 2.0,
    flashPoint: 95,
    notes: 'Fresh, forest-like, clean. Evokes outdoors. Blends well with cedarwood.',
    safetyNotes: 'Can oxidize quickly and become sensitizing. Use fresh oil only.',
    blendFamily: 'woody',
    notePosition: 'middle',
  },
  {
    id: 'sandalwood',
    name: 'Sandalwood (Australian)',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.0,
    flashPoint: 200,
    notes: 'Creamy, warm, woody. Premium EO with excellent staying power in soap.',
    safetyNotes: 'Very safe. One of the gentlest EOs available.',
    blendFamily: 'woody',
    notePosition: 'base',
  },
  {
    id: 'fir-needle',
    name: 'Fir Needle (Siberian)',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.5,
    flashPoint: 107,
    notes: 'Clean, fresh, balsamic. Popular in holiday and forest-themed soaps.',
    safetyNotes: 'Can oxidize — use fresh. Generally well tolerated.',
    blendFamily: 'woody',
    notePosition: 'middle',
  },
  {
    id: 'cypress',
    name: 'Cypress',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.0,
    flashPoint: 107,
    notes: 'Fresh, clean, slightly woody. Great in men\'s and forest blends.',
    safetyNotes: 'Generally safe. Avoid during pregnancy.',
    blendFamily: 'woody',
    notePosition: 'middle',
  },

  // ═══════════════════════════════════════
  // EARTHY
  // ═══════════════════════════════════════
  {
    id: 'patchouli',
    name: 'Patchouli',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.0,
    flashPoint: 200,
    notes: 'Deep, earthy, musky. Excellent fixative — anchor for citrus blends. Improves with age.',
    safetyNotes: 'Very safe. Well tolerated by virtually everyone.',
    blendFamily: 'earthy',
    notePosition: 'base',
  },
  {
    id: 'vetiver',
    name: 'Vetiver',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 1.5,
    flashPoint: 200,
    notes: 'Deep, smoky, earthy. Very thick oil — warm slightly to pour. Excellent fixative.',
    safetyNotes: 'Very safe. Well tolerated.',
    blendFamily: 'earthy',
    notePosition: 'base',
  },
  {
    id: 'oakmoss-absolute',
    name: 'Oakmoss Absolute',
    type: 'absolute',
    ifraMaxPercent: 1.0,
    commonUsagePercent: 0.3,
    flashPoint: 200,
    notes: 'Rich, forest-floor scent. Very strong fixative. Classic chypre ingredient.',
    safetyNotes: 'Restricted by IFRA due to sensitization potential. Keep well below max.',
    blendFamily: 'earthy',
    notePosition: 'base',
  },

  // ═══════════════════════════════════════
  // RESINOUS
  // ═══════════════════════════════════════
  {
    id: 'frankincense',
    name: 'Frankincense (Boswellia)',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.0,
    flashPoint: 120,
    notes: 'Warm, balsamic, slightly citrusy. Sacred and luxurious. Good staying power.',
    safetyNotes: 'Very safe. Suitable for all skin types.',
    blendFamily: 'resinous',
    notePosition: 'base',
  },
  {
    id: 'myrrh',
    name: 'Myrrh',
    type: 'essential-oil',
    ifraMaxPercent: 4.0,
    commonUsagePercent: 1.5,
    flashPoint: 200,
    notes: 'Warm, balsamic, slightly medicinal. Thick consistency. Ancient and reverent.',
    safetyNotes: 'Avoid during pregnancy. Generally safe at recommended usage.',
    blendFamily: 'resinous',
    notePosition: 'base',
  },
  {
    id: 'benzoin',
    name: 'Benzoin Resinoid',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.0,
    flashPoint: 200,
    notes: 'Sweet, warm, vanilla-like. Excellent fixative. Creates a warm, cozy scent.',
    safetyNotes: 'Can be sensitizing in rare cases. Generally well tolerated in soap.',
    blendFamily: 'resinous',
    notePosition: 'base',
  },
  {
    id: 'copaiba',
    name: 'Copaiba Balsam',
    type: 'essential-oil',
    ifraMaxPercent: 5.0,
    commonUsagePercent: 2.0,
    flashPoint: 175,
    notes: 'Mild, sweet, balsamic. Good fixative. Rich in beta-caryophyllene. Affordable.',
    safetyNotes: 'Very safe. Well tolerated. Good choice for sensitive skin blends.',
    blendFamily: 'resinous',
    notePosition: 'base',
  },
  {
    id: 'peru-balsam',
    name: 'Peru Balsam',
    type: 'essential-oil',
    ifraMaxPercent: 0.4,
    commonUsagePercent: 0.2,
    flashPoint: 200,
    notes: 'Sweet, warm, vanilla-cinnamon. Very restricted by IFRA. Use minimally as accent.',
    safetyNotes: 'High sensitization potential. IFRA severely restricts usage. Keep below 0.4%.',
    blendFamily: 'resinous',
    notePosition: 'base',
  },
  {
    id: 'blue-tansy',
    name: 'Blue Tansy',
    type: 'essential-oil',
    ifraMaxPercent: 2.0,
    commonUsagePercent: 0.5,
    flashPoint: 150,
    notes: 'Sweet, herbaceous with a blue color from chamazulene. Trendy ingredient. Expensive.',
    safetyNotes: 'Do not confuse with common tansy (Tanacetum vulgare) which is toxic. Use Tanacetum annuum only.',
    blendFamily: 'herbal',
    notePosition: 'middle',
  },
];

// ─── Fragrance Blend Families ────────────────────────────────────────────────

export const BLEND_FAMILY_LABELS: Record<FragranceData['blendFamily'], string> = {
  citrus: 'Citrus',
  floral: 'Floral',
  herbal: 'Herbal',
  spicy: 'Spicy',
  woody: 'Woody',
  earthy: 'Earthy',
  resinous: 'Resinous',
  minty: 'Minty',
};

export const NOTE_LABELS: Record<FragranceData['notePosition'], string> = {
  top: 'Top Note',
  middle: 'Middle Note',
  base: 'Base Note',
};

// ─── Fragrance Calculation Functions ─────────────────────────────────────────

export interface FragranceEntry {
  fragranceId: string;
  usagePercent: number;  // percentage of total oil weight
}

export interface FragranceResult {
  fragranceId: string;
  name: string;
  usagePercent: number;
  ifraMaxPercent: number;
  amountOz: number;
  amountG: number;
  amountMl: number;
  drops: number;          // approximate: 1 drop ≈ 0.05 ml
  isCompliant: boolean;
  complianceStatus: 'safe' | 'warning' | 'over-limit';
}

export interface BlendHarmony {
  topPercent: number;
  middlePercent: number;
  basePercent: number;
  harmony: 'balanced' | 'top-heavy' | 'base-heavy' | 'no-base' | 'no-top';
  totalPercent: number;
  isOverallCompliant: boolean;
}

/**
 * Calculate fragrance amounts for a recipe
 */
export function calculateFragranceAmounts(
  entries: FragranceEntry[],
  totalOilWeightOz: number,
): FragranceResult[] {
  return entries.map(entry => {
    const fragrance = FRAGRANCES_DATABASE.find(f => f.id === entry.fragranceId);
    if (!fragrance) {
      return {
        fragranceId: entry.fragranceId,
        name: 'Unknown',
        usagePercent: entry.usagePercent,
        ifraMaxPercent: 0,
        amountOz: 0,
        amountG: 0,
        amountMl: 0,
        drops: 0,
        isCompliant: false,
        complianceStatus: 'over-limit' as const,
      };
    }

    const amountOz = (entry.usagePercent / 100) * totalOilWeightOz;
    const amountG = amountOz * 28.3495;
    // EO density ~0.9 g/ml on average
    const amountMl = amountG / 0.9;
    const drops = Math.round(amountMl / 0.05);

    let complianceStatus: 'safe' | 'warning' | 'over-limit';
    if (entry.usagePercent > fragrance.ifraMaxPercent) {
      complianceStatus = 'over-limit';
    } else if (entry.usagePercent > fragrance.ifraMaxPercent * 0.8) {
      complianceStatus = 'warning';
    } else {
      complianceStatus = 'safe';
    }

    return {
      fragranceId: entry.fragranceId,
      name: fragrance.name,
      usagePercent: entry.usagePercent,
      ifraMaxPercent: fragrance.ifraMaxPercent,
      amountOz: Math.round(amountOz * 100) / 100,
      amountG: Math.round(amountG * 10) / 10,
      amountMl: Math.round(amountMl * 10) / 10,
      drops,
      isCompliant: entry.usagePercent <= fragrance.ifraMaxPercent,
      complianceStatus,
    };
  });
}

/**
 * Analyze blend harmony (top/middle/base note balance)
 */
export function analyzeBlendHarmony(entries: FragranceEntry[]): BlendHarmony {
  let topTotal = 0;
  let middleTotal = 0;
  let baseTotal = 0;
  let allCompliant = true;

  for (const entry of entries) {
    const fragrance = FRAGRANCES_DATABASE.find(f => f.id === entry.fragranceId);
    if (!fragrance) continue;

    if (entry.usagePercent > fragrance.ifraMaxPercent) {
      allCompliant = false;
    }

    switch (fragrance.notePosition) {
      case 'top': topTotal += entry.usagePercent; break;
      case 'middle': middleTotal += entry.usagePercent; break;
      case 'base': baseTotal += entry.usagePercent; break;
    }
  }

  const total = topTotal + middleTotal + baseTotal;
  const topPct = total > 0 ? (topTotal / total) * 100 : 0;
  const midPct = total > 0 ? (middleTotal / total) * 100 : 0;
  const basePct = total > 0 ? (baseTotal / total) * 100 : 0;

  let harmony: BlendHarmony['harmony'];
  if (entries.length === 0 || total === 0) {
    harmony = 'balanced';
  } else if (basePct === 0 && topPct > 0) {
    harmony = 'no-base';
  } else if (topPct === 0 && basePct > 0) {
    harmony = 'no-top';
  } else if (topPct > 60) {
    harmony = 'top-heavy';
  } else if (basePct > 60) {
    harmony = 'base-heavy';
  } else {
    harmony = 'balanced';
  }

  return {
    topPercent: Math.round(topPct),
    middlePercent: Math.round(midPct),
    basePercent: Math.round(basePct),
    harmony,
    totalPercent: Math.round(total * 100) / 100,
    isOverallCompliant: allCompliant,
  };
}
