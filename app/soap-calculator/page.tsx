'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { OILS_DATABASE, OilData, PROPERTY_RANGES, RECIPE_TEMPLATES, RecipeTemplate, ADDITIVES, CATEGORY_LABELS } from './data/oils';
import {
  calculateProperties,
  calculateFullRecipe,
  generateRecipe,
  evaluateRecipe,
  type LyeType,
  type WeightUnit,
  type RecipeGoal,
  type FullRecipeResult,
} from './data/calculator';
import PropertyBar from './components/PropertyBar';
import OilSelector from './components/OilSelector';
import RecipeCard from './components/RecipeCard';
import OilInfo from './components/OilInfo';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecipeOilEntry {
  oilId: string;
  percent: number;
}

type Tab = 'calculator' | 'generator' | 'oils-db';

// ─── Page Component ──────────────────────────────────────────────────────────

export default function SoapCalculatorPage() {
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
  const [unit, setUnit] = useState<WeightUnit>('oz');
  const [recipeName, setRecipeName] = useState('My Soap Recipe');

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
    return calculateFullRecipe(oilEntries, totalOilWeight, superfat, lyeType, waterRatio, unit);
  }, [oilEntries, totalOilWeight, superfat, lyeType, waterRatio, unit, totalPercent]);

  const properties = useMemo(() => calculateProperties(oilEntries), [oilEntries]);
  const evaluation = useMemo(() => evaluateRecipe(properties), [properties]);

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

  // ── Render ──

  return (
    <div className="min-h-screen bg-midnight text-parchment-200">
      {/* Header */}
      <header className="border-b border-navy-600/30 bg-navy-950/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gold-400 hover:text-gold-300 transition-colors text-sm">
              &larr; Home
            </Link>
            <h1 className="text-gold-400 font-serif text-xl md:text-2xl tracking-wide">
              Soap Calculator
            </h1>
          </div>
          <span className="text-parchment-500 text-xs hidden md:block">Coldstone Soap Co.</span>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-navy-600/20 bg-navy-900/40">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {([
            { id: 'calculator', label: 'Lye Calculator' },
            { id: 'generator', label: 'Recipe Generator' },
            { id: 'oils-db', label: 'Oils Database' },
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
        {/* ═══════════════════════════════════════ */}
        {/* CALCULATOR TAB                          */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Recipe builder */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recipe Name & Settings */}
              <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
                <input
                  type="text"
                  value={recipeName}
                  onChange={e => setRecipeName(e.target.value)}
                  className="bg-transparent text-gold-300 font-serif text-xl border-none outline-none w-full mb-4 placeholder-parchment-600"
                  placeholder="Recipe Name..."
                />

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
                      onChange={e => setLyeType(e.target.value as LyeType)}
                      className="w-full bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
                    >
                      <option value="NaOH">NaOH (Bar Soap)</option>
                      <option value="KOH">KOH (Liquid Soap)</option>
                    </select>
                  </div>

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

                {/* Water:Lye Ratio */}
                <div className="mt-4">
                  <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1">
                    Water : Lye Ratio — {waterRatio}:1
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={waterRatio}
                    onChange={e => setWaterRatio(parseFloat(e.target.value))}
                    className="w-full accent-gold-500"
                  />
                  <div className="flex justify-between text-[10px] text-parchment-500">
                    <span>1:1 (Low water)</span>
                    <span>2:1 (Standard)</span>
                    <span>3:1 (High water)</span>
                  </div>
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
                    <ResultBox label="Water:Lye" value={`${waterRatio}:1`} />
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
                Oils, Butters, Fats & Waxes Database ({OILS_DATABASE.length} ingredients)
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
                      <th className="text-center py-3 px-2">Cost</th>
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
      </main>

      {/* Oil Info Modal */}
      {selectedOilInfo && (
        <OilInfo oil={selectedOilInfo} onClose={() => setSelectedOilInfo(null)} />
      )}

      {/* Footer */}
      <footer className="border-t border-navy-600/20 mt-12 py-6 text-center text-parchment-500 text-xs">
        <p>Coldstone Soap Co. &mdash; Soap Calculator</p>
        <p className="mt-1">
          SAP values are approximations. Always verify with your oil supplier.
          Superfat your recipes for safety.
        </p>
      </footer>
    </div>
  );
}

// ─── Helper Components ───────────────────────────────────────────────────────

function ResultBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg p-3 text-center ${accent ? 'bg-gold-500/10 border border-gold-500/20' : 'bg-navy-800/60'}`}>
      <div className="text-[10px] text-parchment-500 uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold ${accent ? 'text-gold-400' : 'text-parchment-200'}`}>{value}</div>
    </div>
  );
}
