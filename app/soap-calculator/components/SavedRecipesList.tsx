'use client';

import { useState, useEffect, useRef } from 'react';
import { OILS_DATABASE } from '../data/oils';
import { calculateProperties } from '../data/calculator';
import type { SavedRecipe } from '../lib/storage';
import { loadRecipes, deleteRecipe, exportRecipesJSON, importRecipesJSON, updateRecipe } from '../lib/storage';
import { buildRecipeVaultPayloadFromSavedRecipe } from '../studio/recipe-studio-model';
import SrcStampDialog, { type SrcStampMode } from './SrcStampDialog';

interface SavedRecipesListProps {
  onLoadRecipe: (recipe: SavedRecipe) => void;
  refreshKey: number; // increment to trigger re-load
  canShare: boolean;
  canPdfExport: boolean;
  canImportExport: boolean;
  canStampSrc: boolean;
  canUpdateSrcRevision: boolean;
}

export default function SavedRecipesList({
  onLoadRecipe,
  refreshKey,
  canShare,
  canPdfExport,
  canImportExport,
  canStampSrc,
  canUpdateSrcRevision,
}: SavedRecipesListProps) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [vaultMsg, setVaultMsg] = useState<string | null>(null);
  const [stampRecipe, setStampRecipe] = useState<SavedRecipe | null>(null);
  const [stampMode, setStampMode] = useState<SrcStampMode>('new-src');
  const [stampError, setStampError] = useState<string | null>(null);
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

  const ensureVaultRecipe = async (recipe: SavedRecipe) => {
    if (recipe.cloudRecipeId) return recipe;

    setVaultMsg('Saving recipe to your vault...');
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRecipeVaultPayloadFromSavedRecipe(recipe, { oilCatalog: OILS_DATABASE })),
      });
      const data = await response.json();
      if (!response.ok) {
        setVaultMsg(data.error || 'Unable to save this recipe to your vault yet.');
        setTimeout(() => setVaultMsg(null), 4000);
        return null;
      }

      const cloudRecipeId = data.recipe?.id;
      if (!cloudRecipeId) {
        setVaultMsg('The recipe saved, but no vault id was returned.');
        setTimeout(() => setVaultMsg(null), 4000);
        return null;
      }

      const syncedRecipe = updateRecipe(recipe.id, {
        cloudRecipeId,
        visibility: 'private',
      }) || { ...recipe, cloudRecipeId, visibility: 'private' as const };
      setRecipes(loadRecipes());
      return syncedRecipe;
    } catch {
      setVaultMsg('Unable to reach the recipe vault right now.');
      setTimeout(() => setVaultMsg(null), 4000);
      return null;
    }
  };

  const handleShare = async (recipe: SavedRecipe) => {
    if (!canShare) {
      setVaultMsg('Upgrade to Plus to create share links.');
      setTimeout(() => setVaultMsg(null), 4000);
      return;
    }
    const vaultRecipe = await ensureVaultRecipe(recipe);
    if (!vaultRecipe?.cloudRecipeId) return;
    const recipeId = vaultRecipe.cloudRecipeId;
    try {
      const response = await fetch(`/api/recipes/${recipeId}/share`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        setVaultMsg(data.error || 'Unable to create a share link yet.');
        return;
      }
      await navigator.clipboard?.writeText(data.share.url);
      setVaultMsg('Share link copied.');
    } catch {
      setVaultMsg('Unable to create a share link right now.');
    } finally {
      setTimeout(() => setVaultMsg(null), 4000);
    }
  };

  const handlePdf = async (recipe: SavedRecipe) => {
    if (!canPdfExport) {
      setVaultMsg('Upgrade to Pro to export recipe PDFs.');
      setTimeout(() => setVaultMsg(null), 4000);
      return;
    }
    const vaultRecipe = await ensureVaultRecipe(recipe);
    if (!vaultRecipe?.cloudRecipeId) return;
    window.location.href = `/api/recipes/${vaultRecipe.cloudRecipeId}/pdf`;
  };

  const openStampDialog = (recipe: SavedRecipe, mode: SrcStampMode) => {
    if (!canStampSrc) {
      setVaultMsg('Upgrade to Plus to stamp Soap Recipe Codes.');
      setTimeout(() => setVaultMsg(null), 4000);
      return;
    }
    setStampError(null);
    setVaultMsg(null);
    setStampRecipe(recipe);
    setStampMode(mode);
  };

  const handleStamp = async ({ mode, revisionNotes }: { mode: SrcStampMode; revisionNotes: string }) => {
    if (!stampRecipe) return;
    setStampError(null);
    const vaultRecipe = await ensureVaultRecipe(stampRecipe);
    if (!vaultRecipe?.cloudRecipeId) {
      setStampError('Save this recipe to your vault before stamping.');
      return;
    }

    const recipeId = vaultRecipe.cloudRecipeId;
    try {
      const response = await fetch(`/api/recipes/${recipeId}/src`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          existingSrcCode: mode === 'same-src' ? vaultRecipe.srcCode : undefined,
          revisionNotes,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStampError(data.error || 'Unable to stamp this recipe yet.');
        return;
      }

      const release = data.release;
      const srcCode = release?.publication?.srcCode;
      const ilcCode = release?.ilc?.ilcCode;
      const revisionNumber = release?.revision?.revisionNumber;
      if (
        typeof srcCode !== 'string'
        || typeof ilcCode !== 'string'
        || !Number.isFinite(release?.revision?.revisionNumber)
      ) {
        setStampError('The SRC was created, but Soap Abacus could not read the stamp details. Reload Recipe Cache and try again.');
        return;
      }

      updateRecipe(stampRecipe.id, {
        cloudRecipeId: recipeId,
        visibility: 'private',
        srcCode,
        ilcCode,
        srcRevision: revisionNumber as number,
      });
      setRecipes(loadRecipes());
      setStampRecipe(null);
      setVaultMsg(mode === 'same-src' ? 'SRC revision updated.' : 'Recipe stamped with SRC and ILC codes.');
      setTimeout(() => setVaultMsg(null), 4000);
    } catch {
      setStampError('Unable to stamp this recipe right now.');
    }
  };

  const handleExport = () => {
    if (!canImportExport) {
      setVaultMsg('Upgrade to Plus to import and export Recipe Cache JSON.');
      setTimeout(() => setVaultMsg(null), 4000);
      return;
    }
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
    if (!canImportExport) {
      setVaultMsg('Upgrade to Plus to import and export Recipe Cache JSON.');
      setTimeout(() => setVaultMsg(null), 4000);
      e.target.value = '';
      return;
    }
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
            <h3 className="text-gold-400 font-serif text-lg">Maker Recipes</h3>
            <p className="text-parchment-500 text-sm mt-1">
              {recipes.length === 0 ? 'No saved recipes yet.' : `${recipes.length} recipe(s) saved`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={recipes.length === 0 || !canImportExport}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-navy-800 text-parchment-400 hover:bg-navy-700 border border-navy-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {canImportExport ? 'Export JSON' : 'Plus Export'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!canImportExport}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-navy-800 text-parchment-400 hover:bg-navy-700 border border-navy-600/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {canImportExport ? 'Import JSON' : 'Plus Import'}
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
        {vaultMsg && (
          <p className="text-gold-400 text-sm mt-3">{vaultMsg}</p>
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
                  {recipe.cloudRecipeId && <span className="text-gold-500/70"> · vault</span>}
                </div>

                {(recipe.srcCode || recipe.ilcCode) && (
                  <div className="mb-3 rounded-lg border border-gold-500/20 bg-gold-500/10 px-3 py-2 text-[10px] text-parchment-300">
                    {recipe.srcCode && <div>SRC {recipe.srcCode}</div>}
                    {recipe.ilcCode && <div>ILC {recipe.ilcCode}</div>}
                    {recipe.srcRevision && <div>Revision {recipe.srcRevision}</div>}
                  </div>
                )}

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
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleShare(recipe)}
                    className="flex-1 py-2 rounded-lg bg-navy-800/60 text-parchment-400 hover:text-gold-300 transition-colors text-xs font-medium border border-navy-600/30"
                  >
                    {canShare ? 'Share Link' : 'Plus Share'}
                  </button>
                  <button
                    onClick={() => handlePdf(recipe)}
                    className="flex-1 py-2 rounded-lg bg-navy-800/60 text-parchment-400 hover:text-gold-300 transition-colors text-xs font-medium border border-navy-600/30"
                  >
                    {canPdfExport ? 'PDF' : 'Pro PDF'}
                  </button>
                </div>
                {canStampSrc && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openStampDialog(recipe, 'new-src')}
                      className="flex-1 py-2 rounded-lg bg-navy-800/60 text-parchment-400 hover:text-gold-300 transition-colors text-xs font-medium border border-navy-600/30"
                      title="Stamp this recipe with a new SRC."
                    >
                      Stamp It
                    </button>
                    {recipe.srcCode && canUpdateSrcRevision && (
                      <button
                        onClick={() => openStampDialog(recipe, 'same-src')}
                        className="flex-1 py-2 rounded-lg bg-gold-500/20 text-gold-300 hover:bg-gold-500/30 transition-colors text-xs font-medium border border-gold-500/20"
                      >
                        Update SRC
                      </button>
                    )}
                  </div>
                )}
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
            Build a recipe in the Recipe Workspace tab, then click &ldquo;Save&rdquo; to keep it here.
          </p>
        </div>
      )}

      {stampRecipe && (
        <SrcStampDialog
          recipeName={stampRecipe.name}
          mode={stampMode}
          canUpdateSrcRevision={canUpdateSrcRevision}
          error={stampError}
          onCancel={() => {
            setStampError(null);
            setStampRecipe(null);
          }}
          onConfirm={handleStamp}
        />
      )}
    </div>
  );
}
