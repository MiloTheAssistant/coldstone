'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { OILS_DATABASE, OilData, RECIPE_TEMPLATES, RecipeTemplate, ADDITIVES, CATEGORY_LABELS } from './data/oils';
import {
  calculateProperties,
  calculateFullRecipe,
  generateRecipe,
  evaluateRecipe,
  type LyeType,
  type WeightUnit,
  type WaterMethod,
  type RecipeGoal,
  type FullRecipeResult,
} from './data/calculator';
import { getModeProcess } from './studio/recipe-studio-model';
import PropertyBar from './components/PropertyBar';
import OilSelector from './components/OilSelector';
import RecipeCard from './components/RecipeCard';
import OilInfo from './components/OilInfo';
import PrintableRecipe from './components/PrintableRecipe';
import SavedRecipesList from './components/SavedRecipesList';
import CostPanel from './components/CostPanel';
import FragrancePanel from './components/FragrancePanel';
import AIRecipeGenerator from './components/AIRecipeGenerator';
import AuthActions from '../components/AuthActions';
import { saveRecipe, updateRecipe, type SavedRecipe } from './lib/storage';
import { loadCostEntries, pricePerOz, type OilCostEntry } from './lib/costData';
import {
  FEATURE_KEYS,
  hasFeature,
} from './studio/membership-model';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecipeOilEntry {
  oilId: string;
  percent: number;
}

type Tab = 'calculator' | 'generator' | 'oils-db' | 'my-recipes';
type CalculatorMode = 'easy' | 'intermediate' | 'expert';
type SoapAbacusTier = 'free' | 'plus' | 'pro';
type MembershipState = {
  tier: SoapAbacusTier;
  effectiveTier: SoapAbacusTier;
  status: string;
  features?: string[];
  trialEndsAt?: string | null;
  stripeCustomerId?: string | null;
};

const DEFAULT_MEMBERSHIP: MembershipState = {
  tier: 'free',
  effectiveTier: 'free',
  status: 'free',
  features: [],
};

const PREVIEW_MEMBERSHIP: MembershipState = {
  tier: 'pro',
  effectiveTier: 'pro',
  status: 'preview',
  features: [],
};

// ─── Page Component ──────────────────────────────────────────────────────────

function SoapCalculatorExperience({
  membership,
  refreshMembership,
  isReadOnlyPreview = false,
}: {
  membership: MembershipState;
  refreshMembership: () => Promise<void>;
  isReadOnlyPreview?: boolean;
}) {
  // ── Active tab ──
  const [activeTab, setActiveTab] = useState<Tab>('calculator');

  // ── Calculator state ──
  const [recipeOils, setRecipeOils] = useState<RecipeOilEntry[]>([
    { oilId: 'olive', percent: 40 },
    { oilId: 'coconut-76', percent: 25 },
    { oilId: 'palm', percent: 20 },
    { oilId: 'castor', percent: 5 },
    { oilId: 'shea-butter', percent: 10 },
  ]);
  const [totalOilWeight, setTotalOilWeight] = useState(32);
  const [superfat, setSuperfat] = useState(5);
  const [lyeType, setLyeType] = useState<LyeType>('NaOH');
  const [waterRatio, setWaterRatio] = useState(2);
  const [waterMethod, setWaterMethod] = useState<WaterMethod>('water-lye-ratio');
  const [waterValue, setWaterValue] = useState(2);
  const [kohPurityPercent, setKohPurityPercent] = useState(100);
  const [unit, setUnit] = useState<WeightUnit>('oz');
  const [recipeName, setRecipeName] = useState('Recipe Console');
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>('easy');

  // ── Generator state ──
  const [selectedGoals, setSelectedGoals] = useState<RecipeGoal[]>(['all-purpose']);
  const [excludedOils, setExcludedOils] = useState<string[]>([]);
  const [generatedResults, setGeneratedResults] = useState<
    { template: RecipeTemplate; properties: ReturnType<typeof calculateProperties> }[]
  >([]);

  // ── Oil DB state ──
  const [dbSearch, setDbSearch] = useState('');
  const [dbCategory, setDbCategory] = useState<OilData['category'] | 'all'>('all');
  const [selectedOilInfo, setSelectedOilInfo] = useState<OilData | null>(null);

  // ── Persistent storage state ──
  const [loadedRecipeId, setLoadedRecipeId] = useState<string | null>(null);
  const [savedRecipesRefreshKey, setSavedRecipesRefreshKey] = useState(0);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const saveToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recipeNotes, setRecipeNotes] = useState('');
  const [costEntries, setCostEntries] = useState<OilCostEntry[]>([]);

  // ── Derived calculations ──
  const totalPercent = recipeOils.reduce((s, o) => s + o.percent, 0);

  const oilEntries = useMemo(() => {
    return recipeOils
      .map(entry => {
        const oil = OILS_DATABASE.find(o => o.id === entry.oilId);
        return oil ? { oil, percent: entry.percent } : null;
      })
      .filter((e): e is { oil: OilData; percent: number } => e !== null);
  }, [recipeOils]);

  const recipeResult: FullRecipeResult | null = useMemo(() => {
    if (oilEntries.length === 0 || totalPercent === 0) return null;
    return calculateFullRecipe(
      oilEntries,
      totalOilWeight,
      superfat,
      lyeType,
      { method: waterMethod, value: waterValue },
      unit,
      kohPurityPercent,
    );
  }, [oilEntries, totalOilWeight, superfat, lyeType, waterMethod, waterValue, unit, kohPurityPercent, totalPercent]);

  const properties = useMemo(() => calculateProperties(oilEntries), [oilEntries]);
  const evaluation = useMemo(() => evaluateRecipe(properties), [properties]);
  const processSteps = useMemo(() => getModeProcess(calculatorMode), [calculatorMode]);
  const canUseIntermediate = hasFeature(membership, FEATURE_KEYS.RECIPE_DESIGNER_INTERMEDIATE);
  const canUseExpert = hasFeature(membership, FEATURE_KEYS.RECIPE_DESIGNER_EXPERT);
  const canUseIngredientCosts = hasFeature(membership, FEATURE_KEYS.INGREDIENT_COSTS);
  const canUseRecipeBlenderAI = hasFeature(membership, FEATURE_KEYS.AI_RECIPE_BLENDER);
  const canUseAdvancedLye = hasFeature(membership, FEATURE_KEYS.ADVANCED_LYE);
  const costMap = useMemo(() => new Map(costEntries.map(entry => [entry.oilId, entry])), [costEntries]);

  useEffect(() => {
    setCostEntries(loadCostEntries());
  }, []);

  // ── Oil DB filtered list ──
  const filteredDbOils = useMemo(() => {
    return OILS_DATABASE
      .filter(oil => dbCategory === 'all' || oil.category === dbCategory)
      .filter(oil => oil.name.toLowerCase().includes(dbSearch.toLowerCase()));
  }, [dbSearch, dbCategory]);

  // ── Handlers ──

  const handleAddOil = useCallback((oil: OilData) => {
    if (recipeOils.some(o => o.oilId === oil.id)) return;
    setRecipeOils(prev => [...prev, { oilId: oil.id, percent: 0 }]);
  }, [recipeOils]);

  const handleRemoveOil = useCallback((oilId: string) => {
    setRecipeOils(prev => prev.filter(o => o.oilId !== oilId));
  }, []);

  const handlePercentChange = useCallback((oilId: string, percent: number) => {
    setRecipeOils(prev => prev.map(o => o.oilId === oilId ? { ...o, percent: Math.max(0, Math.min(100, percent)) } : o));
  }, []);

  const handleLoadTemplate = useCallback((template: RecipeTemplate) => {
    setRecipeOils(template.oils.map(o => ({ oilId: o.oilId, percent: o.percent })));
    setSuperfat(template.superfat);
    setRecipeName(template.name);
    setActiveTab('calculator');
  }, []);

  const handleLoadAIRecipe = useCallback((recipe: { name: string; oils: { oilId: string; percent: number }[]; superfat: number }) => {
    setRecipeOils(recipe.oils.map(o => ({ oilId: o.oilId, percent: o.percent })));
    setSuperfat(recipe.superfat);
    setRecipeName(recipe.name);
    setLoadedRecipeId(null);
    setActiveTab('calculator');
  }, []);

  const handleGenerate = useCallback(() => {
    const results: typeof generatedResults = [];
    const seen = new Set<string>();
    // Generate multiple unique results
    for (let i = 0; i < 20 && results.length < 6; i++) {
      const result = generateRecipe(selectedGoals, excludedOils);
      if (result && !seen.has(result.template.id)) {
        seen.add(result.template.id);
        results.push(result);
      }
    }
    setGeneratedResults(results);
  }, [selectedGoals, excludedOils]);

  const toggleGoal = useCallback((goal: RecipeGoal) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  }, []);

  // ── Save / Load / Print handlers ──

  const showToast = useCallback((msg: string) => {
    if (saveToastTimer.current) clearTimeout(saveToastTimer.current);
    setSaveToast(msg);
    saveToastTimer.current = setTimeout(() => setSaveToast(null), 3000);
  }, []);

  const handleModeChange = useCallback((mode: CalculatorMode) => {
    if (mode === 'intermediate' && !canUseIntermediate) {
      showToast('Upgrade to Plus to use Intermediate mode.');
      return;
    }
    if (mode === 'expert' && !canUseExpert) {
      showToast('Upgrade to Pro to use Expert mode.');
      return;
    }
    setCalculatorMode(mode);
  }, [canUseExpert, canUseIntermediate, showToast]);

  const syncRecipeToVault = useCallback(async (localRecipe: SavedRecipe) => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: localRecipe.cloudRecipeId || localRecipe.id,
          name: recipeName,
          description: recipeNotes,
          mode: calculatorMode,
          oils: recipeResult?.oils.map(o => ({
            oilId: o.oil.id,
            name: o.oil.name,
            percent: o.percent,
            weight: o.weight,
            unit,
          })) || recipeOils,
          liquids: recipeResult ? [{
            liquidId: 'water',
            name: 'Water',
            weight: recipeResult.lye.waterWeight,
            unit,
            method: recipeResult.lye.waterMethod,
            value: recipeResult.lye.waterValue,
          }] : [],
          fragrances: [],
          additives: [],
          costs: canUseIngredientCosts ? costEntries.map(entry => ({
            ingredientId: entry.oilId,
            supplier: entry.supplier,
            pricePerUnit: entry.pricePerUnit,
            unitSize: entry.unitSize,
            unit: entry.unit,
          })) : [],
          pricing: null,
          notes: recipeNotes,
        }),
      });

      if (!response.ok) {
        let message = 'Saved locally. Vault sync is not available right now.';
        try {
          const data = await response.json();
          if (response.status === 401) {
            message = 'Saved locally. Sign in to save this recipe to your vault.';
          } else if (data.error) {
            message = `Saved locally. ${data.error}`;
          }
        } catch {
          // Keep the default local-save message.
        }
        showToast(message);
        return;
      }
      const data = await response.json();
      if (data.recipe?.id) {
        updateRecipe(localRecipe.id, { cloudRecipeId: data.recipe.id });
        setSavedRecipesRefreshKey(k => k + 1);
        showToast('Recipe saved to your vault.');
      }
    } catch {
      showToast('Saved locally. Vault sync is offline right now.');
    }
  }, [calculatorMode, canUseIngredientCosts, costEntries, recipeName, recipeNotes, recipeOils, recipeResult, showToast, unit]);

  const handleSaveRecipe = useCallback(() => {
    let localRecipe: SavedRecipe | null = null;
    if (loadedRecipeId) {
      localRecipe = updateRecipe(loadedRecipeId, {
        name: recipeName,
        oils: recipeOils,
        totalOilWeight,
        unit,
        lyeType,
        superfat,
        waterRatio,
        waterMethod,
        waterValue,
        kohPurityPercent,
        notes: recipeNotes,
        mode: calculatorMode,
      });
      showToast('Recipe updated!');
    } else {
      const saved = saveRecipe({
        name: recipeName,
        oils: recipeOils,
        totalOilWeight,
        unit,
        lyeType,
        superfat,
        waterRatio,
        waterMethod,
        waterValue,
        kohPurityPercent,
        notes: recipeNotes,
        mode: calculatorMode,
      });
      localRecipe = saved;
      setLoadedRecipeId(saved.id);
      showToast('Recipe saved!');
    }
    setSavedRecipesRefreshKey(k => k + 1);
    if (localRecipe) void syncRecipeToVault(localRecipe);
  }, [recipeName, recipeOils, totalOilWeight, unit, lyeType, superfat, waterRatio, waterMethod, waterValue, kohPurityPercent, recipeNotes, calculatorMode, loadedRecipeId, showToast, syncRecipeToVault]);

  const handleSaveAsNew = useCallback(() => {
    const saved = saveRecipe({
      name: recipeName + ' (copy)',
      oils: recipeOils,
      totalOilWeight,
      unit,
      lyeType,
      superfat,
      waterRatio,
      waterMethod,
      waterValue,
      kohPurityPercent,
      notes: recipeNotes,
      mode: calculatorMode,
    });
    setLoadedRecipeId(saved.id);
    setRecipeName(saved.name);
    setSavedRecipesRefreshKey(k => k + 1);
    showToast('Saved as new recipe!');
    void syncRecipeToVault(saved);
  }, [recipeName, recipeOils, totalOilWeight, unit, lyeType, superfat, waterRatio, waterMethod, waterValue, kohPurityPercent, recipeNotes, calculatorMode, showToast, syncRecipeToVault]);

  const handleLoadSavedRecipe = useCallback((recipe: SavedRecipe) => {
    setRecipeOils(recipe.oils.map(o => ({ oilId: o.oilId, percent: o.percent })));
    setTotalOilWeight(recipe.totalOilWeight);
    setUnit(recipe.unit);
    setLyeType(recipe.lyeType);
    setSuperfat(recipe.superfat);
    setWaterRatio(recipe.waterRatio);
    setWaterMethod(recipe.waterMethod || 'water-lye-ratio');
    setWaterValue(recipe.waterValue ?? recipe.waterRatio ?? 2);
    setKohPurityPercent(recipe.kohPurityPercent ?? 100);
    setRecipeName(recipe.name);
    setRecipeNotes(recipe.notes);
    setCalculatorMode(recipe.mode || 'intermediate');
    setLoadedRecipeId(recipe.id);
    setActiveTab('calculator');
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Render ──

  return (
    <div className="min-h-screen bg-midnight text-parchment-200">
      {/* Header */}
      <header className="border-b border-navy-600/30 bg-navy-950/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="https://www.coldstonesoap.com" className="text-gold-400 hover:text-gold-300 transition-colors text-sm">
              &larr; Home
            </a>
            <h1 className="text-gold-400 font-serif text-xl md:text-2xl tracking-wide">
              Soap Abacus Studio
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isReadOnlyPreview ? (
              <>
                <SignInButton mode="modal">
                  <button className="rounded-lg bg-navy-800 px-3 py-2 text-xs font-semibold text-parchment-300 hover:bg-navy-700">
                    Log In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-gold-500/20 px-3 py-2 text-xs font-semibold text-gold-300 hover:bg-gold-500/30">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                <Link href="/soap-calculator/account" className="text-parchment-500 hover:text-gold-300 text-xs hidden md:block">
                  {membership.effectiveTier.toUpperCase()} Account
                </Link>
                <AuthActions />
              </>
            )}
          </div>
        </div>
      </header>

      {isReadOnlyPreview && <ReadOnlyPreviewBanner />}

      <div
        className={isReadOnlyPreview ? 'pointer-events-none select-none opacity-90' : undefined}
        inert={isReadOnlyPreview ? true : undefined}
      >
      {/* Tab Navigation */}
      <nav className="border-b border-navy-600/20 bg-navy-900/40">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {([
            { id: 'calculator', label: 'Recipe Designer' },
            { id: 'generator', label: 'Recipe Blender' },
            { id: 'oils-db', label: 'Ingredients DB' },
            { id: 'my-recipes', label: 'Recipe Cache' },
          ] as { id: Tab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-gold-500 text-gold-400'
                  : 'border-transparent text-parchment-500 hover:text-parchment-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!isReadOnlyPreview && <MembershipBanner membership={membership} refreshMembership={refreshMembership} />}

        {/* ═══════════════════════════════════════ */}
        {/* CALCULATOR TAB                          */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Recipe builder */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recipe Name & Settings */}
              <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
                <div className="mb-3">
                  <h2 className="text-gold-400 font-serif text-lg">Soap Designer</h2>
                </div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <input
                    type="text"
                    value={recipeName}
                    onChange={e => setRecipeName(e.target.value)}
                    className="bg-transparent text-gold-300 font-serif text-xl border-none outline-none flex-1 placeholder-parchment-600"
                    placeholder="Recipe Console..."
                  />
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={handleSaveRecipe}
                      className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 transition-colors border border-gold-500/20"
                    >
                      {loadedRecipeId ? 'Update' : 'Save'}
                    </button>
                    {loadedRecipeId && (
                      <button
                        onClick={handleSaveAsNew}
                        className="px-4 py-1.5 rounded-lg text-xs font-medium bg-navy-800 text-parchment-400 hover:bg-navy-700 transition-colors border border-navy-600/30"
                      >
                        Save as New
                      </button>
                    )}
                    {recipeResult && totalPercent === 100 && (
                      <button
                        onClick={handlePrint}
                        className="px-4 py-1.5 rounded-lg text-xs font-medium bg-navy-800 text-parchment-400 hover:bg-navy-700 transition-colors border border-navy-600/30 print:hidden"
                      >
                        Print
                      </button>
                    )}
                  </div>
                </div>

                {/* Calculator Mode */}
                <div className="mb-5">
                  <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-2">
                    Calculator Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: 'easy', label: 'Easy', hint: 'Guided', locked: false },
                      { id: 'intermediate', label: 'Intermediate', hint: 'Plus', locked: !canUseIntermediate },
                      { id: 'expert', label: 'Expert', hint: 'Pro', locked: !canUseExpert },
                    ] as { id: CalculatorMode; label: string; hint: string; locked: boolean }[]).map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => handleModeChange(mode.id)}
                        className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                          calculatorMode === mode.id
                            ? 'border-gold-500/50 bg-gold-500/15 text-gold-300'
                            : mode.locked
                              ? 'border-navy-700/30 bg-navy-900/40 text-parchment-600'
                              : 'border-navy-600/30 bg-navy-800/40 text-parchment-400 hover:border-navy-500/60'
                        }`}
                      >
                        <span className="block text-sm font-medium">{mode.label}{mode.locked ? ' Locked' : ''}</span>
                        <span className="block text-[10px] text-parchment-500">{mode.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Total Oil Weight */}
                  <div>
                    <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1">
                      Total Oil Weight
                    </label>
                    <input
                      type="number"
                      value={totalOilWeight}
                      onChange={e => setTotalOilWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1">Unit</label>
                    <select
                      value={unit}
                      onChange={e => setUnit(e.target.value as WeightUnit)}
                      className="w-full bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
                    >
                      <option value="oz">Ounces (oz)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                    </select>
                  </div>

                  {/* Lye Type */}
                  <div>
                    <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1">Lye Type</label>
                    <select
                      value={lyeType}
                      onChange={e => {
                        const next = e.target.value as LyeType;
                        if (next === 'KOH' && !canUseAdvancedLye) {
                          showToast('Upgrade to Pro to use advanced KOH controls.');
                          return;
                        }
                        setLyeType(next);
                      }}
                      className="w-full bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
                    >
                      <option value="NaOH">NaOH (Bar Soap)</option>
                      <option value="KOH">KOH (Liquid Soap)</option>
                    </select>
                  </div>

                  {lyeType === 'KOH' && (
                    <div>
                      <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1">
                        KOH Purity
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={kohPurityPercent}
                        onChange={e => setKohPurityPercent(Math.max(1, Math.min(100, parseFloat(e.target.value) || 90)))}
                        className="w-full bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
                      />
                    </div>
                  )}

                  {/* Superfat */}
                  <div>
                    <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1">
                      Superfat ({superfat}%)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      step={1}
                      value={superfat}
                      onChange={e => setSuperfat(parseInt(e.target.value))}
                      className="w-full accent-gold-500 mt-2"
                    />
                  </div>
                </div>

                {/* Water Method */}
                <div className="mt-4">
                  <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1">
                    Water Method
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_120px] gap-3">
                    <select
                      value={waterMethod}
                      onChange={e => {
                        const method = e.target.value as WaterMethod;
                        if (method !== 'water-lye-ratio' && !canUseIntermediate) {
                          showToast('Upgrade to Plus to use full water methods.');
                          return;
                        }
                        setWaterMethod(method);
                        const nextValue = method === 'lye-concentration' ? 33 : method === 'water-as-percent-of-oils' ? 38 : 2;
                        setWaterValue(nextValue);
                        if (method === 'water-lye-ratio') setWaterRatio(nextValue);
                      }}
                      className="w-full bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
                    >
                      <option value="water-lye-ratio">Water : Lye Ratio</option>
                      <option value="lye-concentration" disabled={!canUseIntermediate}>Lye Concentration (Plus)</option>
                      <option value="water-as-percent-of-oils" disabled={!canUseIntermediate}>Water as % of Oils (Plus)</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={waterMethod === 'lye-concentration' ? 1 : 0.5}
                        max={waterMethod === 'lye-concentration' ? 99 : 100}
                        step={waterMethod === 'water-lye-ratio' ? 0.1 : 1}
                        value={waterValue}
                        onChange={e => {
                          const value = parseFloat(e.target.value) || 0;
                          setWaterValue(value);
                          if (waterMethod === 'water-lye-ratio') setWaterRatio(value);
                        }}
                        className="w-full bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
                      />
                      <span className="text-xs text-parchment-500 whitespace-nowrap">
                        {waterMethod === 'water-lye-ratio' ? ':1' : '%'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-parchment-500">
                    {waterMethod === 'water-lye-ratio' && 'Easy default: 2:1. Lower water traces faster; higher water gives more working time.'}
                    {waterMethod === 'lye-concentration' && 'Intermediate/expert control: common cold process range is roughly 30-35%.'}
                    {waterMethod === 'water-as-percent-of-oils' && 'SoapCalc-style beginner default: 38% water as a percentage of oil weight.'}
                  </div>
                </div>

                {/* Recipe Notes */}
                <div className="mt-4">
                  <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={recipeNotes}
                    onChange={e => setRecipeNotes(e.target.value)}
                    placeholder="Fragrance, color, additives, special instructions..."
                    rows={2}
                    className="w-full bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 placeholder-parchment-600 focus:outline-none focus:border-gold-500/60 resize-none"
                  />
                </div>
              </div>

              {/* Guided Process Flow */}
              <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-gold-400 font-serif text-lg">Recipe Workbench</h3>
                    <p className="text-parchment-500 text-xs mt-1">
                      {calculatorMode === 'easy'
                        ? 'A guided path from idea to ready-to-save soap recipe.'
                        : calculatorMode === 'intermediate'
                          ? 'A hybrid workflow with stronger controls at each step.'
                          : 'Full-control audit path for experienced formulators.'}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-gold-500/70 border border-gold-500/20 rounded-full px-3 py-1">
                    {calculatorMode}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {processSteps.map((step: { id: string; label: string; description: string }, index: number) => (
                    <div key={step.id} className="flex gap-3 rounded-lg bg-navy-800/40 border border-navy-700/30 p-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-400 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm text-parchment-200 font-medium">{step.label}</div>
                        <p className="text-xs text-parchment-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Oil List */}
              <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gold-400 font-serif text-lg">Recipe Oils</h3>
                  <span className={`text-sm font-bold ${totalPercent === 100 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalPercent}% total {totalPercent !== 100 && '(must be 100%)'}
                  </span>
                </div>

                {recipeOils.length === 0 ? (
                  <p className="text-parchment-500 text-sm text-center py-8">
                    No oils added yet. Use the panel on the right to add oils.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recipeOils.map(entry => {
                      const oil = OILS_DATABASE.find(o => o.id === entry.oilId);
                      if (!oil) return null;
                      const weight = totalPercent > 0
                        ? ((entry.percent / 100) * totalOilWeight).toFixed(2)
                        : '0';
                      return (
                        <div
                          key={entry.oilId}
                          className="flex items-center gap-3 bg-navy-800/40 rounded-lg p-3 group"
                        >
                          <button
                            onClick={() => handleRemoveOil(entry.oilId)}
                            className="text-red-500/60 hover:text-red-400 text-lg leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove oil"
                          >
                            ×
                          </button>
                          <button
                            className="flex-1 text-left"
                            onClick={() => setSelectedOilInfo(oil)}
                          >
                            <span className="text-sm text-parchment-200 hover:text-gold-300 transition-colors">
                              {oil.name}
                            </span>
                          </button>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={entry.percent}
                              onChange={e => handlePercentChange(entry.oilId, parseFloat(e.target.value) || 0)}
                              className="w-16 bg-navy-800 border border-navy-600/40 rounded px-2 py-1 text-sm text-right text-parchment-200 focus:outline-none focus:border-gold-500/60"
                              min={0}
                              max={100}
                            />
                            <span className="text-xs text-parchment-500">%</span>
                            <span className="text-xs text-parchment-400 w-16 text-right">
                              {weight} {unit}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Lye Results */}
              {recipeResult && totalPercent === 100 && (
                <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-5">
                  <h3 className="text-gold-400 font-serif text-lg mb-4">Recipe Results</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <ResultBox label={`${lyeType} Needed`} value={`${recipeResult.lye.lyeWeight} ${unit}`} accent />
                    <ResultBox label="Water Needed" value={`${recipeResult.lye.waterWeight} ${unit}`} accent />
                    <ResultBox label="Total Oil" value={`${recipeResult.lye.totalOilWeight} ${unit}`} />
                    <ResultBox label="Total Batch" value={`${recipeResult.totalBatchWeight} ${unit}`} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ResultBox label="Superfat" value={`${superfat}%`} />
                    <ResultBox label="Water:Lye" value={`${recipeResult.lye.waterRatio}:1`} />
                    <ResultBox label="Lye Type" value={lyeType} />
                    <ResultBox label="Lye Purity" value="97%" />
                  </div>
                </div>
              )}

              {/* Individual Oil Weights */}
              {recipeResult && totalPercent === 100 && (
                <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
                  <h3 className="text-gold-400 font-serif text-lg mb-3">Oil Weights Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-navy-600/30 text-parchment-500 text-xs uppercase">
                          <th className="text-left py-2 pr-4">Oil</th>
                          <th className="text-right py-2 px-2">%</th>
                          <th className="text-right py-2 px-2">Weight ({unit})</th>
                          <th className="text-right py-2 px-2">{lyeType} ({unit})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipeResult.oils.map(o => {
                          const lyeForOil = lyeType === 'NaOH'
                            ? (o.weight * o.oil.sapNaOH * (1 - superfat / 100)).toFixed(2)
                            : (o.weight * (o.oil.sapKOH / 1000) * (1 - superfat / 100)).toFixed(2);
                          return (
                            <tr key={o.oil.id} className="border-b border-navy-800/40">
                              <td className="py-2 pr-4 text-parchment-200">{o.oil.name}</td>
                              <td className="py-2 px-2 text-right text-parchment-400">{o.percent}%</td>
                              <td className="py-2 px-2 text-right text-parchment-300">{o.weight}</td>
                              <td className="py-2 px-2 text-right text-gold-400">{lyeForOil}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Oil selector + Properties */}
            <div className="space-y-6">
              {/* Properties Panel */}
              <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
                <h3 className="text-gold-400 font-serif text-lg mb-4">Soap Properties</h3>
                {oilEntries.length === 0 ? (
                  <p className="text-parchment-500 text-sm text-center py-4">Add oils to see properties.</p>
                ) : (
                  <>
                    <PropertyBar label="Hardness" value={properties.hardness} min={29} max={54} />
                    <PropertyBar label="Cleansing" value={properties.cleansing} min={12} max={22} />
                    <PropertyBar label="Conditioning" value={properties.conditioning} min={44} max={69} />
                    <PropertyBar label="Bubbly Lather" value={properties.bubbly} min={14} max={46} />
                    <PropertyBar label="Creamy Lather" value={properties.creamy} min={16} max={48} />
                    <PropertyBar label="Iodine" value={properties.iodine} min={41} max={70} />
                    <PropertyBar label="INS" value={properties.ins} min={136} max={165} maxScale={300} />
                  </>
                )}

                {/* Evaluation summary */}
                {oilEntries.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-navy-600/30">
                    <div className="flex gap-2 flex-wrap">
                      {evaluation.map(e => (
                        <span
                          key={e.property}
                          className={`text-[10px] px-2 py-1 rounded-full ${
                            e.status === 'good' ? 'bg-green-900/40 text-green-400' :
                            e.status === 'low' ? 'bg-amber-900/40 text-amber-400' :
                            'bg-red-900/40 text-red-400'
                          }`}
                        >
                          {e.property}: {e.status === 'good' ? 'Good' : e.status === 'low' ? 'Low' : 'High'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Oil Selector */}
              <OilSelector
                selectedOilIds={recipeOils.map(o => o.oilId)}
                onAddOil={handleAddOil}
              />

              {/* Fragrance Calculator */}
              <FragrancePanel
                totalOilWeight={totalOilWeight}
                unit={unit}
              />

              {/* Cost Calculator */}
              {recipeResult && totalPercent === 100 && (
                <CostPanel
                  recipeOils={recipeOils}
                  totalOilWeight={totalOilWeight}
                  unit={unit}
                  lyeWeight={recipeResult.lye.lyeWeight}
                  totalBatchWeight={recipeResult.totalBatchWeight}
                  canUseIngredientCosts={canUseIngredientCosts}
                  onCostEntriesChange={setCostEntries}
                />
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* RECIPE GENERATOR TAB                    */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Goal Selection */}
            <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
              <h3 className="text-gold-400 font-serif text-lg mb-2">What kind of soap do you want?</h3>
              <p className="text-parchment-500 text-sm mb-4">
                Select one or more goals and we&apos;ll suggest recipes from our curated collection.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {([
                  { id: 'all-purpose', label: 'All Purpose' },
                  { id: 'moisturizing', label: 'Moisturizing' },
                  { id: 'cleansing', label: 'Deep Cleansing' },
                  { id: 'hard-bar', label: 'Hard Bar' },
                  { id: 'luxury', label: 'Luxury / Spa' },
                  { id: 'budget', label: 'Budget Friendly' },
                  { id: 'vegan', label: 'Vegan' },
                  { id: 'palm-free', label: 'Palm-Free' },
                  { id: 'tallow-based', label: 'Tallow Based' },
                  { id: 'lard-based', label: 'Lard Based' },
                  { id: 'trendy', label: 'Trendy / Unique' },
                  { id: 'gentle', label: 'Gentle / Baby-Safe' },
                  { id: 'exfoliating', label: 'Exfoliating' },
                ] as { id: RecipeGoal; label: string }[]).map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedGoals.includes(goal.id)
                        ? 'bg-gold-500 text-navy-900 shadow-lg shadow-gold-500/20'
                        : 'bg-navy-800 text-parchment-400 hover:bg-navy-700 border border-navy-600/30'
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>

              {/* Exclude oils */}
              <div className="mb-4">
                <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-2">
                  Exclude Oils (optional)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['palm', 'coconut-76', 'lard', 'tallow-beef'].map(oilId => {
                    const oil = OILS_DATABASE.find(o => o.id === oilId);
                    if (!oil) return null;
                    return (
                      <button
                        key={oilId}
                        onClick={() => setExcludedOils(prev =>
                          prev.includes(oilId) ? prev.filter(id => id !== oilId) : [...prev, oilId]
                        )}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          excludedOils.includes(oilId)
                            ? 'bg-red-900/40 text-red-400 border border-red-600/30'
                            : 'bg-navy-800 text-parchment-400 hover:bg-navy-700'
                        }`}
                      >
                        {excludedOils.includes(oilId) ? '✕ ' : ''}{oil.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-semibold text-sm hover:from-gold-400 hover:to-gold-300 transition-all shadow-lg shadow-gold-500/20"
              >
                Generate Recipes
              </button>
            </div>

            {/* AI Recipe Blender */}
            {canUseRecipeBlenderAI ? (
              <AIRecipeGenerator
                selectedGoals={selectedGoals}
                excludedOils={excludedOils}
                onLoadRecipe={handleLoadAIRecipe}
              />
            ) : (
              <LockedFeature
                title="AI Recipe Blender"
                copy="Upgrade to Pro to generate calculator-ready recipes with AI."
              />
            )}

            {/* Generated Results */}
            {generatedResults.length > 0 && (
              <div>
                <h3 className="text-gold-400 font-serif text-lg mb-4">
                  Recommended Recipes ({generatedResults.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedResults.map(result => (
                    <RecipeCard
                      key={result.template.id}
                      template={result.template}
                      properties={result.properties}
                      onLoad={handleLoadTemplate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates Browser */}
            <div>
              <h3 className="text-gold-400 font-serif text-lg mb-4">
                Browse All {RECIPE_TEMPLATES.length} Recipes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {RECIPE_TEMPLATES.map(template => {
                  const oilData = template.oils
                    .map(o => {
                      const oil = OILS_DATABASE.find(db => db.id === o.oilId);
                      return oil ? { oil, percent: o.percent } : null;
                    })
                    .filter((e): e is { oil: OilData; percent: number } => e !== null);
                  return (
                    <RecipeCard
                      key={template.id}
                      template={template}
                      properties={calculateProperties(oilData)}
                      onLoad={handleLoadTemplate}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* OILS DATABASE TAB                       */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'oils-db' && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
              <h3 className="text-gold-400 font-serif text-lg mb-3">
                Ingredients DB: Oils, Butters, Fats & Waxes ({OILS_DATABASE.length} ingredients)
              </h3>

              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search oils..."
                  value={dbSearch}
                  onChange={e => setDbSearch(e.target.value)}
                  className="flex-1 bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 placeholder-parchment-500 focus:outline-none focus:border-gold-500/60"
                />
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'oil', 'butter', 'fat', 'wax'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setDbCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                        dbCategory === cat
                          ? 'bg-gold-500 text-navy-900'
                          : 'bg-navy-800 text-parchment-400 hover:bg-navy-700'
                      }`}
                    >
                      {cat === 'all' ? `All (${OILS_DATABASE.length})` : CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-parchment-500 text-xs">
                Click any oil to see its full fatty acid profile, SAP values, and usage notes.
              </p>
            </div>

            {/* Oils Table */}
            <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-navy-800/60 border-b border-navy-600/30 text-parchment-500 text-xs uppercase">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-center py-3 px-2">Type</th>
                      <th className="text-right py-3 px-2">NaOH SAP</th>
                      <th className="text-right py-3 px-2">KOH SAP</th>
                      <th className="text-right py-3 px-2">Iodine</th>
                      <th className="text-right py-3 px-2">INS</th>
                      <th className="text-center py-3 px-2">Cost Tier</th>
                      <th className="text-right py-3 px-2">Cost</th>
                      <th className="text-right py-3 px-4">Max %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDbOils.map(oil => (
                      <tr
                        key={oil.id}
                        className="border-b border-navy-800/30 hover:bg-navy-800/40 cursor-pointer transition-colors"
                        onClick={() => setSelectedOilInfo(oil)}
                      >
                        <td className="py-2.5 px-4 text-parchment-200 hover:text-gold-300 transition-colors">
                          {oil.name}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            oil.category === 'oil' ? 'bg-green-900/30 text-green-400' :
                            oil.category === 'butter' ? 'bg-amber-900/30 text-amber-400' :
                            oil.category === 'fat' ? 'bg-red-900/30 text-red-400' :
                            'bg-purple-900/30 text-purple-400'
                          }`}>
                            {oil.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right text-parchment-300 font-mono text-xs">{oil.sapNaOH.toFixed(4)}</td>
                        <td className="py-2.5 px-2 text-right text-parchment-300 font-mono text-xs">{oil.sapKOH}</td>
                        <td className="py-2.5 px-2 text-right text-parchment-300">{oil.iodine}</td>
                        <td className="py-2.5 px-2 text-right text-parchment-300">{oil.ins}</td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            oil.costTier === 'budget' ? 'bg-green-900/30 text-green-400' :
                            oil.costTier === 'mid' ? 'bg-amber-900/30 text-amber-400' :
                            'bg-purple-900/30 text-purple-400'
                          }`}>
                            {oil.costTier}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right text-xs text-parchment-400">
                          {canUseIngredientCosts
                            ? formatIngredientCost(costMap.get(oil.id))
                            : 'Plus'}
                        </td>
                        <td className="py-2.5 px-4 text-right text-parchment-400">{oil.maxPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additives Section */}
            <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
              <h3 className="text-gold-400 font-serif text-lg mb-4">
                Soap Additives & Ingredients
              </h3>

              {(['colorant', 'exfoliant', 'botanical', 'special'] as const).map(category => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-parchment-200 font-medium text-sm uppercase tracking-wider mb-2 border-b border-navy-600/20 pb-1">
                    {category === 'colorant' ? 'Natural Colorants & Clays' :
                     category === 'exfoliant' ? 'Exfoliants' :
                     category === 'botanical' ? 'Botanicals' :
                     'Special Additives'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ADDITIVES.filter(a => a.category === category).map(additive => (
                      <div key={additive.id} className="bg-navy-800/40 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-parchment-200 font-medium">{additive.name}</span>
                          <span className="text-[10px] text-gold-500/60 ml-2 whitespace-nowrap">{additive.usageRate}</span>
                        </div>
                        <p className="text-xs text-parchment-500 mt-1">{additive.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* MY RECIPES TAB                          */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'my-recipes' && (
          <SavedRecipesList
            onLoadRecipe={handleLoadSavedRecipe}
            refreshKey={savedRecipesRefreshKey}
            canShare={hasFeature(membership, FEATURE_KEYS.SHARE_LINKS)}
            canPdfExport={hasFeature(membership, FEATURE_KEYS.PDF_EXPORT)}
            canImportExport={hasFeature(membership, FEATURE_KEYS.JSON_IMPORT_EXPORT)}
          />
        )}
      </main>

      {/* Printable Recipe (hidden on screen, shown when printing) */}
      {recipeResult && totalPercent === 100 && (
        <PrintableRecipe
          recipeName={recipeName}
          recipeResult={recipeResult}
          lyeType={lyeType}
          superfat={superfat}
          waterRatio={recipeResult.lye.waterRatio}
          unit={unit}
          notes={recipeNotes}
        />
      )}

      {/* Save toast notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-900/90 text-green-300 px-5 py-3 rounded-xl border border-green-600/30 text-sm font-medium shadow-lg animate-fade-in print:hidden">
          {saveToast}
        </div>
      )}

      {/* Oil Info Modal */}
      {selectedOilInfo && (
        <OilInfo oil={selectedOilInfo} onClose={() => setSelectedOilInfo(null)} />
      )}

      {/* Footer */}
      <footer className="border-t border-navy-600/20 mt-12 py-6 text-center text-parchment-500 text-xs">
        <p>Coldstone Soap Co. &mdash; Soap Abacus Studio</p>
        <p className="mt-1">
          SAP values are approximations. Always verify with your oil supplier.
          Superfat your recipes for safety.
        </p>
      </footer>
      </div>
    </div>
  );
}

// ─── Helper Components ───────────────────────────────────────────────────────

export default function SoapCalculatorPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!clerkEnabled) {
    return (
      <div className="min-h-screen bg-midnight text-parchment-200 flex items-center justify-center px-4">
        <div className="max-w-lg rounded-xl border border-navy-600/30 bg-navy-900/70 p-8 text-center">
          <h1 className="font-serif text-3xl text-gold-400">Soap Abacus Studio</h1>
          <p className="mt-3 text-sm text-parchment-400">
            Clerk is required before the membership paywall can run in this environment.
          </p>
        </div>
      </div>
    );
  }

  return <SoapStudioGate />;
}

function SoapStudioGate() {
  const { isLoaded, isSignedIn } = useUser();
  const [membership, setMembership] = useState<MembershipState>(DEFAULT_MEMBERSHIP);

  const refreshMembership = useCallback(async () => {
    try {
      const response = await fetch('/api/soap-abacus/membership');
      if (!response.ok) return;
      const data = await response.json();
      if (data.membership) {
        setMembership({
          ...DEFAULT_MEMBERSHIP,
          ...data.membership,
          effectiveTier: data.membership.effectiveTier || data.membership.tier || 'free',
        });
      }
    } catch {
      // Keep local Free fallback.
    }
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) void refreshMembership();
  }, [isLoaded, isSignedIn, refreshMembership]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-midnight text-parchment-200 flex items-center justify-center">
        <p className="text-sm text-parchment-500">Loading Soap Abacus Studio...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <SoapCalculatorExperience
        membership={PREVIEW_MEMBERSHIP}
        refreshMembership={async () => undefined}
        isReadOnlyPreview
      />
    );
  }

  return <SoapCalculatorExperience membership={membership} refreshMembership={refreshMembership} />;
}

function ReadOnlyPreviewBanner() {
  return (
    <section className="border-b border-gold-500/20 bg-navy-950/95">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold-500/70">Studio Preview</p>
          <h2 className="mt-1 font-serif text-2xl text-gold-300">Previewing the calculator in read-only mode</h2>
          <p className="mt-1 max-w-3xl text-sm text-parchment-400">
            Explore the Recipe Designer layout, lye and water outputs, property scoring, Ingredients DB, and pricing tiers.
            Create a free account to start editing recipes and saving to Recipe Cache.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SignUpButton mode="modal">
            <button className="rounded-lg bg-gold-500/20 px-4 py-2 text-xs font-semibold text-gold-300 hover:bg-gold-500/30">
              Create Free Account
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="rounded-lg bg-navy-800 px-4 py-2 text-xs font-semibold text-parchment-300 hover:bg-navy-700">
              Log In
            </button>
          </SignInButton>
        </div>
      </div>
    </section>
  );
}

function MembershipBanner({
  membership,
  refreshMembership,
}: {
  membership: MembershipState;
  refreshMembership: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const trialText = membership.trialEndsAt
    ? `Trial ends ${new Date(membership.trialEndsAt).toLocaleDateString()}`
    : null;

  const startNoCardTrial = async () => {
    setBusy('trial');
    try {
      await fetch('/api/soap-abacus/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_pro_trial' }),
      });
      await refreshMembership();
    } finally {
      setBusy(null);
    }
  };

  const startCheckout = async (
    tier: 'plus' | 'pro',
    trial: 'card' | 'none' = 'none',
    billingInterval: 'monthly' | 'annual' = 'monthly',
  ) => {
    setBusy(`${tier}-${billingInterval}-${trial}`);
    try {
      const response = await fetch('/api/soap-abacus/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, trial, billingInterval }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setBusy(null);
    }
  };

  const openPortal = async () => {
    setBusy('portal');
    try {
      const response = await fetch('/api/soap-abacus/portal', { method: 'POST' });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-navy-600/30 bg-navy-900/60 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-gold-500/70">Soap Abacus Membership</p>
        <p className="mt-1 text-sm text-parchment-300">
          {membership.effectiveTier.toUpperCase()} tier · {membership.status}
          {trialText ? ` · ${trialText}` : ''}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {membership.effectiveTier === 'free' && (
          <>
            <button
              onClick={startNoCardTrial}
              disabled={busy !== null}
              className="rounded-lg bg-gold-500/20 px-3 py-2 text-xs font-semibold text-gold-300 hover:bg-gold-500/30 disabled:opacity-50"
            >
              {busy === 'trial' ? 'Starting...' : 'Start No-Card Pro Trial'}
            </button>
            <button
              onClick={() => startCheckout('plus', 'none', 'monthly')}
              disabled={busy !== null}
              className="rounded-lg bg-navy-800 px-3 py-2 text-xs font-semibold text-parchment-300 hover:bg-navy-700 disabled:opacity-50"
            >
              Plus $7.99/mo
            </button>
            <button
              onClick={() => startCheckout('plus', 'none', 'annual')}
              disabled={busy !== null}
              className="rounded-lg bg-navy-800 px-3 py-2 text-xs font-semibold text-parchment-300 hover:bg-navy-700 disabled:opacity-50"
            >
              Plus $87.89/yr
            </button>
            <button
              onClick={() => startCheckout('pro', 'card', 'monthly')}
              disabled={busy !== null}
              className="rounded-lg bg-navy-800 px-3 py-2 text-xs font-semibold text-parchment-300 hover:bg-navy-700 disabled:opacity-50"
            >
              Pro $17.99/mo Trial
            </button>
            <button
              onClick={() => startCheckout('pro', 'card', 'annual')}
              disabled={busy !== null}
              className="rounded-lg bg-navy-800 px-3 py-2 text-xs font-semibold text-parchment-300 hover:bg-navy-700 disabled:opacity-50"
            >
              Pro $197.89/yr Trial
            </button>
          </>
        )}
        {membership.stripeCustomerId && (
          <button
            onClick={openPortal}
            disabled={busy !== null}
            className="rounded-lg bg-navy-800 px-3 py-2 text-xs font-semibold text-parchment-300 hover:bg-navy-700 disabled:opacity-50"
          >
            Manage Billing
          </button>
        )}
      </div>
    </div>
  );
}

function LockedFeature({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-xl border border-gold-500/20 bg-navy-900/60 p-5">
      <h3 className="text-gold-400 font-serif text-lg">{title}</h3>
      <p className="mt-2 text-sm text-parchment-500">{copy}</p>
      <Link href="/soap-calculator/account" className="mt-4 inline-block rounded-lg bg-gold-500/20 px-4 py-2 text-xs font-semibold text-gold-300 hover:bg-gold-500/30">
        View Membership
      </Link>
    </div>
  );
}

function formatIngredientCost(entry?: OilCostEntry) {
  if (!entry) return 'Not set';
  return `$${pricePerOz(entry).toFixed(2)}/oz`;
}

function ResultBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg p-3 text-center ${accent ? 'bg-gold-500/10 border border-gold-500/20' : 'bg-navy-800/60'}`}>
      <div className="text-[10px] text-parchment-500 uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold ${accent ? 'text-gold-400' : 'text-parchment-200'}`}>{value}</div>
    </div>
  );
}
