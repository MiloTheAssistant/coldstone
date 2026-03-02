import type { WeightUnit } from '../data/calculator';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OilCostEntry {
  oilId: string;
  pricePerUnit: number;   // e.g., 12.99
  unitSize: number;        // e.g., 16
  unit: WeightUnit;        // e.g., 'oz'
  supplier?: string;
  lastUpdated: string;
}

export interface CostBreakdown {
  oilCosts: { oilId: string; oilName: string; weight: number; cost: number; pricePerUnit: number; hasPricing: boolean }[];
  lyeCost: number;
  totalRawCost: number;
  costPerBar: number | null;
  costPerOz: number | null;
  missingPricing: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COST_STORAGE_KEY = 'coldstone-oil-costs';
const LYE_COST_KEY = 'coldstone-lye-cost';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Unit conversion to ounces for normalization
const TO_OZ: Record<WeightUnit, number> = {
  oz: 1,
  lb: 16,
  g: 0.035274,
  kg: 35.274,
};

function pricePerOz(entry: OilCostEntry): number {
  const totalOz = entry.unitSize * TO_OZ[entry.unit];
  return totalOz > 0 ? entry.pricePerUnit / totalOz : 0;
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

export function loadCostEntries(): OilCostEntry[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(COST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCostEntry(entry: OilCostEntry): void {
  const entries = loadCostEntries();
  const idx = entries.findIndex(e => e.oilId === entry.oilId);
  if (idx >= 0) {
    entries[idx] = { ...entry, lastUpdated: new Date().toISOString() };
  } else {
    entries.push({ ...entry, lastUpdated: new Date().toISOString() });
  }
  persistCosts(entries);
}

export function removeCostEntry(oilId: string): void {
  const entries = loadCostEntries().filter(e => e.oilId !== oilId);
  persistCosts(entries);
}

export function getLyeCostPerOz(): number {
  if (!isClient()) return 0;
  try {
    const raw = localStorage.getItem(LYE_COST_KEY);
    return raw ? parseFloat(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

export function setLyeCostPerOz(cost: number): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(LYE_COST_KEY, String(cost));
  } catch {
    // quota exceeded
  }
}

// ─── Cost Calculation ────────────────────────────────────────────────────────

export function calculateRecipeCost(
  recipeOils: { oilId: string; oilName: string; weight: number }[],
  lyeWeight: number,
  unit: WeightUnit,
  barsPerBatch: number | null,
  totalBatchWeight: number,
): CostBreakdown {
  const costEntries = loadCostEntries();
  const lyeCostPerOz = getLyeCostPerOz();
  const costMap = new Map(costEntries.map(e => [e.oilId, e]));

  const missingPricing: string[] = [];
  const oilCosts = recipeOils.map(({ oilId, oilName, weight }) => {
    const entry = costMap.get(oilId);
    if (!entry) {
      missingPricing.push(oilName);
      return { oilId, oilName, weight, cost: 0, pricePerUnit: 0, hasPricing: false };
    }
    const ppo = pricePerOz(entry);
    const weightInOz = weight * TO_OZ[unit];
    const cost = weightInOz * ppo;
    return { oilId, oilName, weight, cost, pricePerUnit: ppo, hasPricing: true };
  });

  const lyeWeightOz = lyeWeight * TO_OZ[unit];
  const lyeCost = lyeWeightOz * lyeCostPerOz;
  const totalRawCost = oilCosts.reduce((s, o) => s + o.cost, 0) + lyeCost;

  const batchWeightOz = totalBatchWeight * TO_OZ[unit];
  const costPerOz = batchWeightOz > 0 ? totalRawCost / batchWeightOz : null;
  const costPerBar = barsPerBatch && barsPerBatch > 0 ? totalRawCost / barsPerBatch : null;

  return { oilCosts, lyeCost, totalRawCost, costPerBar, costPerOz, missingPricing };
}

// ─── Import / Export ─────────────────────────────────────────────────────────

export function exportCostDataJSON(): string {
  return JSON.stringify({
    oilCosts: loadCostEntries(),
    lyeCostPerOz: getLyeCostPerOz(),
  }, null, 2);
}

export function importCostDataJSON(json: string): { imported: number; errors: number } {
  try {
    const data = JSON.parse(json);
    if (data.oilCosts && Array.isArray(data.oilCosts)) {
      persistCosts(data.oilCosts);
    }
    if (typeof data.lyeCostPerOz === 'number') {
      setLyeCostPerOz(data.lyeCostPerOz);
    }
    return { imported: data.oilCosts?.length || 0, errors: 0 };
  } catch {
    return { imported: 0, errors: 1 };
  }
}

// ─── Internal ────────────────────────────────────────────────────────────────

function persistCosts(entries: OilCostEntry[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(COST_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage quota exceeded
  }
}
