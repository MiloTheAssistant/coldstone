'use client';

import { useState, useEffect, useRef } from 'react';
import { OILS_DATABASE } from '../data/oils';
import { calculateProperties } from '../data/calculator';
import type { SavedRecipe } from '../lib/storage';
import { loadRecipes, deleteRecipe, exportRecipesJSON, importRecipesJSON } from '../lib/storage';

interface SavedRecipesListProps {
  onLoadRecipe: (recipe: SavedRecipe) => void;
  refreshKey: number; // increment to trigger re-load
}

export default function SavedRecipesList({ onLoadRecipe, refreshKey }: SavedRecipesListProps) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecipes(loadRecipes());
  }, [refreshKey]);

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      deleteRecipe(id);
      setRecipes(loadRecipes());
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      // Auto-dismiss confirmation after 3 seconds
      setTimeout(() => setConfirmDeleteId(prev => prev === id ? null : prev), 3000);
    }
  };

  const handleExport = () => {
    const json = exportRecipesJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coldstone-recipes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importRecipesJSON(reader.result as string);
      setRecipes(loadRecipes());
      setImportMsg(`Imported ${result.imported} recipe(s)${result.errors > 0 ? `, ${result.errors} error(s)` : ''}`);
      setTimeout(() => setImportMsg(null), 4000);
    };
    reader.readAsText(file);
    // Reset input so re-importing same file works
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-gold-400 font-serif text-lg">My Saved Recipes</h3>
            <p className="text-parchment-500 text-sm mt-1">
              {recipes.length === 0 ? 'No saved recipes yet.' : `${recipes.length} recipe(s) saved`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={recipes.length === 0}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-navy-800 text-parchment-400 hover:bg-navy-700 border border-navy-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-navy-800 text-parchment-400 hover:bg-navy-700 border border-navy-600/30 transition-colors"
            >
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
        {importMsg && (
          <p className="text-green-400 text-sm mt-3">{importMsg}</p>
        )}
      </div>

      {/* Recipe Cards */}
      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map(recipe => {
            const oilEntries = recipe.oils
              .map(o => {
                const oil = OILS_DATABASE.find(db => db.id === o.oilId);
                return oil ? { oil, percent: o.percent } : null;
              })
              .filter((e): e is { oil: (typeof OILS_DATABASE)[0]; percent: number } => e !== null);
            const props = calculateProperties(oilEntries);
            const dateStr = new Date(recipe.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={recipe.id}
                className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5 hover:border-gold-500/40 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-gold-300 font-serif text-lg group-hover:text-gold-400 transition-colors truncate pr-2">
                    {recipe.name}
                  </h4>
                  <span className="text-[10px] text-parchment-500 whitespace-nowrap">{dateStr}</span>
                </div>

                {/* Quick properties */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div className="bg-navy-800/60 rounded-lg p-1.5">
                    <div className="text-[9px] text-parchment-500 uppercase">Hard</div>
                    <div className="text-xs font-bold text-parchment-200">{props.hardness}</div>
                  </div>
                  <div className="bg-navy-800/60 rounded-lg p-1.5">
                    <div className="text-[9px] text-parchment-500 uppercase">Clean</div>
                    <div className="text-xs font-bold text-parchment-200">{props.cleansing}</div>
                  </div>
                  <div className="bg-navy-800/60 rounded-lg p-1.5">
                    <div className="text-[9px] text-parchment-500 uppercase">Cond</div>
                    <div className="text-xs font-bold text-parchment-200">{props.conditioning}</div>
                  </div>
                </div>

                {/* Oil list */}
                <div className="text-xs text-parchment-500 mb-2">
                  {recipe.oils.map((o, i) => (
                    <span key={o.oilId}>
                      {o.percent}% {o.oilId.replace(/-/g, ' ')}{i < recipe.oils.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>

                <div className="text-[10px] text-parchment-500 mb-3">
                  {recipe.totalOilWeight} {recipe.unit} · {recipe.lyeType} · {recipe.superfat}% SF
                </div>

                {recipe.notes && (
                  <p className="text-xs text-parchment-400 mb-3 italic line-clamp-2">{recipe.notes}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onLoadRecipe(recipe)}
                    className="flex-1 py-2 rounded-lg bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 transition-colors text-sm font-medium border border-gold-500/20"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      confirmDeleteId === recipe.id
                        ? 'bg-red-900/40 text-red-400 border-red-600/30'
                        : 'bg-navy-800/60 text-parchment-500 border-navy-600/30 hover:text-red-400'
                    }`}
                  >
                    {confirmDeleteId === recipe.id ? 'Confirm?' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {recipes.length === 0 && (
        <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-10 text-center">
          <div className="text-3xl mb-3 opacity-30">&#128203;</div>
          <p className="text-parchment-400 text-sm mb-2">No saved recipes yet</p>
          <p className="text-parchment-500 text-xs">
            Build a recipe in the Lye Calculator tab, then click &ldquo;Save Recipe&rdquo; to keep it here.
          </p>
        </div>
      )}
    </div>
  );
}
