'use client';

import { useState, useCallback } from 'react';
import type { RecipeGoal } from '../data/calculator';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AIRecipe {
  name: string;
  description: string;
  reasoning: string;
  oils: { oilId: string; percent: number }[];
  superfat: number;
  suggestedAdditives?: string[];
  fragranceNotes?: string;
}

interface AIRecipeGeneratorProps {
  selectedGoals: RecipeGoal[];
  excludedOils: string[];
  onLoadRecipe: (recipe: AIRecipe) => void;
}

// ─── Skin types & budget options ─────────────────────────────────────────────

const SKIN_TYPES = ['Normal', 'Dry', 'Oily', 'Sensitive', 'Combination', 'Mature'] as const;
const BUDGET_OPTIONS = ['Budget-friendly', 'Mid-range', 'Premium / Luxury'] as const;

export default function AIRecipeGenerator({ selectedGoals, excludedOils, onLoadRecipe }: AIRecipeGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [skinType, setSkinType] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIRecipe | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          goals: selectedGoals,
          excludedOils,
          skinType: skinType || undefined,
          budget: budget || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to generate recipe.');
        return;
      }

      setResult(data.recipe);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedGoals, excludedOils, skinType, budget]);

  return (
    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-gold-400 font-serif text-lg">AI Recipe Generator</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-medium">
          Powered by Claude
        </span>
      </div>
      <p className="text-parchment-500 text-sm mb-4">
        Describe your dream soap and our AI will create a custom formulation tailored to your needs.
      </p>

      {/* Prompt input */}
      <div className="mb-4">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe your dream soap... e.g., 'A luxurious facial bar with anti-aging oils, creamy lather, and a subtle woodsy scent' or 'A budget-friendly everyday bar that's vegan and palm-free'"
          rows={3}
          className="w-full bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 placeholder-parchment-600 focus:outline-none focus:border-gold-500/60 resize-none"
        />
      </div>

      {/* Constraint chips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Skin Type */}
        <div>
          <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1.5">
            Skin Type (optional)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SKIN_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSkinType(skinType === type ? '' : type)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  skinType === type
                    ? 'bg-gold-500 text-navy-900'
                    : 'bg-navy-800 text-parchment-400 hover:bg-navy-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1.5">
            Budget (optional)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BUDGET_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setBudget(budget === opt ? '' : opt)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  budget === opt
                    ? 'bg-gold-500 text-navy-900'
                    : 'bg-navy-800 text-parchment-400 hover:bg-navy-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Context from parent goals */}
      {selectedGoals.length > 0 && (
        <p className="text-parchment-600 text-xs mb-3">
          Also using your selected goals: {selectedGoals.join(', ')}
        </p>
      )}
      {excludedOils.length > 0 && (
        <p className="text-parchment-600 text-xs mb-3">
          Excluding: {excludedOils.join(', ')}
        </p>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading || (!prompt && selectedGoals.length === 0)}
        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${
          isLoading || (!prompt && selectedGoals.length === 0)
            ? 'bg-navy-700 text-parchment-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300 shadow-gold-500/20'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating...
          </span>
        ) : (
          'Generate with AI'
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-900/30 border border-red-600/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 bg-navy-800/60 border border-gold-500/20 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-gold-300 font-serif text-lg">{result.name}</h4>
              <p className="text-parchment-400 text-sm mt-1">{result.description}</p>
            </div>
            <button
              onClick={() => onLoadRecipe(result)}
              className="flex-shrink-0 ml-3 px-4 py-2 rounded-lg text-xs font-medium bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 transition-colors border border-gold-500/20"
            >
              Load into Calculator
            </button>
          </div>

          {/* Oil list */}
          <div className="mb-3">
            <h5 className="text-parchment-400 text-xs uppercase tracking-wider mb-2">Oils</h5>
            <div className="space-y-1">
              {result.oils.map(oil => (
                <div key={oil.oilId} className="flex justify-between text-sm">
                  <span className="text-parchment-300">{oil.oilId}</span>
                  <span className="text-gold-400 font-medium">{oil.percent}%</span>
                </div>
              ))}
            </div>
            <div className="mt-1 text-xs text-parchment-500">
              Superfat: {result.superfat}%
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="mb-3 bg-navy-900/40 rounded-lg p-3">
            <h5 className="text-parchment-400 text-xs uppercase tracking-wider mb-1">Why These Oils?</h5>
            <p className="text-parchment-300 text-sm leading-relaxed">{result.reasoning}</p>
          </div>

          {/* Suggested Additives */}
          {result.suggestedAdditives && result.suggestedAdditives.length > 0 && (
            <div className="mb-3">
              <h5 className="text-parchment-400 text-xs uppercase tracking-wider mb-1">Suggested Additives</h5>
              <div className="flex flex-wrap gap-1.5">
                {result.suggestedAdditives.map(additive => (
                  <span
                    key={additive}
                    className="text-xs px-2.5 py-1 rounded-full bg-navy-800 text-parchment-300 border border-navy-600/30"
                  >
                    {additive}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fragrance Notes */}
          {result.fragranceNotes && (
            <div>
              <h5 className="text-parchment-400 text-xs uppercase tracking-wider mb-1">Fragrance Suggestion</h5>
              <p className="text-parchment-300 text-sm">{result.fragranceNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
