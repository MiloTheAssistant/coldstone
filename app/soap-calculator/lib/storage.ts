import type { LyeType, WeightUnit } from '../data/calculator';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SavedRecipe {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  oils: { oilId: string; percent: number }[];
  totalOilWeight: number;
  unit: WeightUnit;
  lyeType: LyeType;
  superfat: number;
  waterRatio: number;
  notes: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'coldstone-saved-recipes';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

export function loadRecipes(): SavedRecipe[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveRecipe(recipe: Omit<SavedRecipe, 'id' | 'createdAt' | 'updatedAt'>): SavedRecipe {
  const recipes = loadRecipes();
  const now = new Date().toISOString();
  const newRecipe: SavedRecipe = {
    ...recipe,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  recipes.unshift(newRecipe);
  persist(recipes);
  return newRecipe;
}

export function updateRecipe(id: string, updates: Partial<Omit<SavedRecipe, 'id' | 'createdAt'>>): SavedRecipe | null {
  const recipes = loadRecipes();
  const index = recipes.findIndex(r => r.id === id);
  if (index === -1) return null;
  recipes[index] = {
    ...recipes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  persist(recipes);
  return recipes[index];
}

export function deleteRecipe(id: string): boolean {
  const recipes = loadRecipes();
  const filtered = recipes.filter(r => r.id !== id);
  if (filtered.length === recipes.length) return false;
  persist(filtered);
  return true;
}

// ─── Import / Export ─────────────────────────────────────────────────────────

export function exportRecipesJSON(): string {
  return JSON.stringify(loadRecipes(), null, 2);
}

export function importRecipesJSON(json: string): { imported: number; errors: number } {
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) return { imported: 0, errors: 1 };

    const existing = loadRecipes();
    const existingIds = new Set(existing.map(r => r.id));
    let imported = 0;
    let errors = 0;

    for (const item of data) {
      if (!item.name || !Array.isArray(item.oils)) {
        errors++;
        continue;
      }
      // Skip duplicates by ID
      if (item.id && existingIds.has(item.id)) {
        continue;
      }
      const now = new Date().toISOString();
      existing.push({
        id: item.id || generateId(),
        name: item.name,
        createdAt: item.createdAt || now,
        updatedAt: item.updatedAt || now,
        oils: item.oils,
        totalOilWeight: item.totalOilWeight || 32,
        unit: item.unit || 'oz',
        lyeType: item.lyeType || 'NaOH',
        superfat: item.superfat ?? 5,
        waterRatio: item.waterRatio ?? 2,
        notes: item.notes || '',
      });
      imported++;
    }

    persist(existing);
    return { imported, errors };
  } catch {
    return { imported: 0, errors: 1 };
  }
}

// ─── Internal ────────────────────────────────────────────────────────────────

function persist(recipes: SavedRecipe[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch {
    // Storage quota exceeded — silently fail
  }
}
