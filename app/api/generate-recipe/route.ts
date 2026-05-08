import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_KEYS, requireSoapAbacusFeature } from '@/app/lib/soap-abacus-membership';

// ─── Rate Limiting (simple in-memory) ────────────────────────────────────────

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ─── Valid Oil IDs ───────────────────────────────────────────────────────────

const VALID_OIL_IDS = [
  'almond-sweet', 'apricot-kernel', 'argan', 'avocado', 'babassu', 'canola',
  'castor', 'coconut-76', 'coconut-92', 'coconut-fractionated', 'corn',
  'evening-primrose', 'flaxseed', 'grapeseed', 'hazelnut', 'hemp-seed',
  'jojoba', 'kukui-nut', 'macadamia', 'meadowfoam', 'neem', 'olive',
  'olive-pomace', 'palm', 'palm-kernel', 'peanut', 'rice-bran',
  'safflower-high-oleic', 'sesame', 'soybean', 'sunflower-high-oleic',
  'walnut', 'wheat-germ', 'buriti', 'tamanu', 'marula', 'moringa',
  'watermelon-seed', 'pumpkin-seed', 'black-cumin', 'rosehip-seed', 'borage',
  'camellia', 'cocoa-butter', 'shea-butter', 'mango-butter', 'kokum-butter',
  'avocado-butter', 'illipe-butter', 'cupuacu-butter', 'sal-butter',
  'ucuuba-butter', 'murumuru-butter', 'lard', 'tallow-beef', 'tallow-goat',
  'tallow-deer', 'tallow-sheep', 'duck-fat', 'emu-oil', 'goat-milk-fat',
  'beeswax', 'carnauba-wax', 'candelilla-wax', 'soy-wax', 'lanolin',
] as const;

// ─── Oil data summary for the AI ─────────────────────────────────────────────

const OIL_REFERENCE = `Available oils (id | name | category | costTier | maxPercent):
almond-sweet | Almond Oil (Sweet) | oil | mid | 100%
apricot-kernel | Apricot Kernel Oil | oil | premium | 100%
argan | Argan Oil | oil | premium | 15%
avocado | Avocado Oil | oil | mid | 100%
babassu | Babassu Oil | oil | premium | 30%
canola | Canola Oil | oil | budget | 100%
castor | Castor Oil | oil | budget | 10%
coconut-76 | Coconut Oil (76°) | oil | budget | 33%
coconut-92 | Coconut Oil (92°) | oil | budget | 33%
corn | Corn Oil | oil | budget | 100%
grapeseed | Grapeseed Oil | oil | mid | 15%
hazelnut | Hazelnut Oil | oil | premium | 100%
hemp-seed | Hemp Seed Oil | oil | mid | 15%
jojoba | Jojoba Oil | oil | premium | 10%
kukui-nut | Kukui Nut Oil | oil | premium | 10%
macadamia | Macadamia Nut Oil | oil | premium | 100%
meadowfoam | Meadowfoam Seed Oil | oil | premium | 15%
neem | Neem Oil | oil | mid | 15%
olive | Olive Oil | oil | mid | 100%
olive-pomace | Olive Oil (Pomace) | oil | budget | 100%
palm | Palm Oil | oil | budget | 50%
palm-kernel | Palm Kernel Oil | oil | budget | 30%
peanut | Peanut Oil | oil | budget | 100%
rice-bran | Rice Bran Oil | oil | mid | 100%
safflower-high-oleic | Safflower Oil (HO) | oil | mid | 100%
sesame | Sesame Oil | oil | mid | 100%
soybean | Soybean Oil | oil | budget | 100%
sunflower-high-oleic | Sunflower Oil (HO) | oil | mid | 100%
walnut | Walnut Oil | oil | mid | 15%
buriti | Buriti Oil | oil | premium | 10%
tamanu | Tamanu Oil | oil | premium | 15%
marula | Marula Oil | oil | premium | 15%
moringa | Moringa Oil | oil | premium | 25%
watermelon-seed | Watermelon Seed Oil | oil | mid | 20%
pumpkin-seed | Pumpkin Seed Oil | oil | mid | 15%
black-cumin | Black Cumin Seed Oil | oil | premium | 10%
rosehip-seed | Rosehip Seed Oil | oil | premium | 10%
borage | Borage Oil | oil | premium | 10%
camellia | Camellia (Tsubaki) Oil | oil | premium | 100%
cocoa-butter | Cocoa Butter | butter | mid | 15%
shea-butter | Shea Butter | butter | mid | 15%
mango-butter | Mango Butter | butter | mid | 15%
kokum-butter | Kokum Butter | butter | premium | 15%
avocado-butter | Avocado Butter | butter | premium | 15%
illipe-butter | Illipe Butter | butter | premium | 15%
cupuacu-butter | Cupuacu Butter | butter | premium | 15%
sal-butter | Sal Butter | butter | mid | 15%
ucuuba-butter | Ucuuba Butter | butter | premium | 10%
murumuru-butter | Murumuru Butter | butter | premium | 10%
lard | Lard (Pig Fat) | fat | budget | 100%
tallow-beef | Beef Tallow | fat | budget | 100%
tallow-goat | Goat Tallow | fat | mid | 100%
tallow-deer | Deer Tallow | fat | mid | 100%
tallow-sheep | Sheep Tallow | fat | mid | 100%
duck-fat | Duck Fat | fat | mid | 50%
emu-oil | Emu Oil | fat | premium | 15%
goat-milk-fat | Goat Milk Fat | fat | premium | 20%
beeswax | Beeswax | wax | mid | 5%
candelilla-wax | Candelilla Wax | wax | premium | 5%
soy-wax | Soy Wax | wax | budget | 5%
lanolin | Lanolin | wax | mid | 5%`;

// ─── Trending ingredients context ────────────────────────────────────────────

const TRENDING_CONTEXT = `Trending soapmaking ingredients (2024-2025):
- Tallow renaissance: Beef tallow is experiencing a major comeback for its skin-nourishing properties and hard bar results
- J-beauty influence: Camellia (tsubaki) oil and rice bran oil gaining popularity for luxury facial bars
- African botanicals: Marula oil, baobab-inspired recipes, African black soap formulations
- Regenerative ingredients: Goat milk fat, duck fat, emu oil from small farms
- Blue tansy: Trending in luxury skincare-inspired soaps for its blue color and calming properties
- Bakuchiol-adjacent: Plant-based retinol alternatives appearing in soap additives
- Snow mushroom / tremella: As a soap additive for hydration
- Seasonal suggestions: Peppermint/fir needle in winter, citrus/lemongrass in summer, pumpkin seed in autumn`;

const NVIDIA_NIM_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_NIM_MODEL = 'minimaxai/minimax-m2.7';
const OPENAI_MODEL = 'gpt-5.5';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GenerateRequest {
  prompt: string;
  goals: string[];
  excludedOils: string[];
  skinType?: string;
  budget?: string;
}

interface AIRecipeResponse {
  name: string;
  description: string;
  reasoning: string;
  oils: { oilId: string; percent: number }[];
  superfat: number;
  suggestedAdditives?: string[];
  fragranceNotes?: string;
}

type AIProvider = 'nvidia' | 'openai';

const RECIPE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    reasoning: { type: 'string' },
    oils: {
      type: 'array',
      minItems: 3,
      maxItems: 7,
      items: {
        type: 'object',
        properties: {
          oilId: { type: 'string', enum: VALID_OIL_IDS },
          percent: { type: 'number', minimum: 0, maximum: 100 },
        },
        required: ['oilId', 'percent'],
        additionalProperties: false,
      },
    },
    superfat: { type: 'number', minimum: 3, maximum: 8 },
    suggestedAdditives: {
      type: 'array',
      items: { type: 'string' },
    },
    fragranceNotes: { type: 'string' },
  },
  required: [
    'name',
    'description',
    'reasoning',
    'oils',
    'superfat',
    'suggestedAdditives',
    'fragranceNotes',
  ],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are an expert soapmaker and cosmetic chemist. You create balanced cold process soap recipes using precise oil percentages and deep knowledge of fatty acid profiles, SAP values, and soap properties.

${OIL_REFERENCE}

${TRENDING_CONTEXT}

Key soapmaking principles:
- Hardness comes from saturated fats (lauric, myristic, palmitic, stearic)
- Cleansing comes from lauric + myristic acids (coconut, babassu, palm kernel)
- Conditioning comes from oleic, ricinoleic, linoleic, linolenic acids
- Bubbly lather from lauric, myristic, ricinoleic
- Creamy lather from palmitic, stearic, ricinoleic
- Castor oil at 3-7% dramatically boosts lather
- Too much cleansing (>22) = drying; too little hardness (<29) = soft bar
- Ideal ranges: Hardness 29-54, Cleansing 12-22, Conditioning 44-69, INS 136-165
- Waxes (beeswax, etc.) should be kept under 5%
- Soft oils like grapeseed, hemp should be under 15% to avoid dreaded orange spots (DOS)

Return one practical, calculator-ready recipe. Use empty arrays or empty strings when optional additive or fragrance guidance is not needed.`;

function getAIProvider(): AIProvider | null {
  const provider = (process.env.AI_PROVIDER || 'nvidia').toLowerCase();
  if (provider === 'nvidia' || provider === 'openai') return provider;
  return null;
}

async function generateWithNvidia(userMessage: string) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return {
      error: 'AI generation is not configured. Please add an NVIDIA_API_KEY to your environment.',
    };
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.NVIDIA_NIM_BASE_URL || NVIDIA_NIM_BASE_URL,
  });

  const completion = await client.chat.completions.create({
    model: process.env.NVIDIA_NIM_MODEL || NVIDIA_NIM_MODEL,
    max_tokens: 4096,
    temperature: 0.3,
    stream: false,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `${userMessage}\n\nReturn only a JSON object that matches the provided schema. Do not include markdown or commentary.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'soap_recipe',
        schema: RECIPE_RESPONSE_SCHEMA,
        strict: true,
      },
    },
  } as Parameters<typeof client.chat.completions.create>[0] & {
    response_format: {
      type: 'json_schema';
      json_schema: {
        name: string;
        schema: typeof RECIPE_RESPONSE_SCHEMA;
        strict: boolean;
      };
    };
  });

  return { text: 'choices' in completion ? completion.choices[0]?.message?.content || '' : '' };
}

async function generateWithOpenAI(userMessage: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      error: 'AI generation is not configured. Please add an OPENAI_API_KEY to your environment.',
    };
  }

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model: OPENAI_MODEL,
    max_output_tokens: 1024,
    input: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    text: {
      verbosity: 'low',
      format: {
        type: 'json_schema',
        name: 'soap_recipe',
        schema: RECIPE_RESPONSE_SCHEMA,
        strict: true,
      },
    },
  });

  return { text: response.output_text };
}

// ─── POST Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const access = await requireSoapAbacusFeature(FEATURE_KEYS.AI_RECIPE_BLENDER);
  if (!access.ok) return access.response;

  // Rate limit check
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

  const provider = getAIProvider();
  if (!provider) {
    return NextResponse.json(
      { error: 'Unsupported AI_PROVIDER. Use "nvidia" or "openai".' },
      { status: 503 }
    );
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { prompt, goals, excludedOils, skinType, budget } = body;

  if (!prompt && (!goals || goals.length === 0)) {
    return NextResponse.json(
      { error: 'Please provide a description or select at least one goal.' },
      { status: 400 }
    );
  }

  // Build the AI prompt
  const excludeClause = excludedOils.length > 0
    ? `\nIMPORTANT: Do NOT use these oils: ${excludedOils.join(', ')}.`
    : '';

  const skinTypeClause = skinType ? `\nTarget skin type: ${skinType}.` : '';
  const budgetClause = budget ? `\nBudget preference: ${budget}.` : '';
  const goalsClause = goals.length > 0 ? `\nDesired qualities: ${goals.join(', ')}.` : '';

  const userMessage = `Create a cold process soap recipe based on this request:

"${prompt || goals.join(', ')}"
${goalsClause}${excludeClause}${skinTypeClause}${budgetClause}

Rules:
- Oil percentages MUST sum to exactly 100
- Each oil's percent must not exceed its maxPercent
- Use 3-7 oils for a well-balanced recipe
- Superfat should be 3-8% (5% is standard)
  - Only use oil IDs from the reference list
- Consider trending ingredients when appropriate`;

  try {
    const generation = provider === 'nvidia'
      ? await generateWithNvidia(userMessage)
      : await generateWithOpenAI(userMessage);

    if ('error' in generation) {
      return NextResponse.json({ error: generation.error }, { status: 503 });
    }

    // Extract text response
    const responseText = generation.text;
    if (!responseText) {
      return NextResponse.json({ error: 'AI returned an unexpected response format.' }, { status: 500 });
    }

    // Parse JSON from response
    let recipe: AIRecipeResponse;
    try {
      recipe = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.' },
        { status: 500 }
      );
    }

    // ── Validate the recipe ──

    // Check oils exist
    const invalidOils = recipe.oils.filter(o => !VALID_OIL_IDS.includes(o.oilId as typeof VALID_OIL_IDS[number]));
    if (invalidOils.length > 0) {
      return NextResponse.json(
        { error: `AI suggested invalid oils: ${invalidOils.map(o => o.oilId).join(', ')}. Please try again.` },
        { status: 500 }
      );
    }

    // Check percentages sum to 100
    const totalPercent = recipe.oils.reduce((s, o) => s + o.percent, 0);
    if (totalPercent !== 100) {
      // Try to fix minor rounding issues
      if (Math.abs(totalPercent - 100) <= 2) {
        const diff = 100 - totalPercent;
        // Adjust the largest oil
        const largest = recipe.oils.reduce((a, b) => a.percent > b.percent ? a : b);
        largest.percent += diff;
      } else {
        return NextResponse.json(
          { error: `Oil percentages sum to ${totalPercent}%, not 100%. Please try again.` },
          { status: 500 }
        );
      }
    }

    // Ensure superfat is reasonable
    if (!recipe.superfat || recipe.superfat < 0 || recipe.superfat > 25) {
      recipe.superfat = 5;
    }

    return NextResponse.json({ recipe });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('AI generation error:', message);
    return NextResponse.json(
      { error: 'Failed to generate recipe. Please try again.' },
      { status: 500 }
    );
  }
}
