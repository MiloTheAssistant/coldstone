'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { OILS_DATABASE } from '../data/oils';
import type { WeightUnit } from '../data/calculator';
import {
  loadCostEntries,
  saveCostEntry,
  removeCostEntry,
  getLyeCostPerOz,
  setLyeCostPerOz,
  calculateRecipeCost,
  type OilCostEntry,
  type CostBreakdown,
} from '../lib/costData';

interface CostPanelProps {
  recipeOils: { oilId: string; percent: number }[];
  totalOilWeight: number;
  unit: WeightUnit;
  lyeWeight: number;
  totalBatchWeight: number;
}

export default function CostPanel({ recipeOils, totalOilWeight, unit, lyeWeight, totalBatchWeight }: CostPanelProps) {
  const [costEntries, setCostEntries] = useState<OilCostEntry[]>([]);
  const [lyeCost, setLyeCost] = useState(0);
  const [barsPerBatch, setBarsPerBatch] = useState<number>(10);
  const [editingOilId, setEditingOilId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editSize, setEditSize] = useState('');
  const [editUnit, setEditUnit] = useState<WeightUnit>('oz');
  const [editSupplier, setEditSupplier] = useState('');

  // Load cost data from localStorage
  useEffect(() => {
    setCostEntries(loadCostEntries());
    setLyeCost(getLyeCostPerOz());
  }, []);

  const handleSavePrice = useCallback((oilId: string) => {
    const price = parseFloat(editPrice);
    const size = parseFloat(editSize);
    if (isNaN(price) || isNaN(size) || price <= 0 || size <= 0) return;

    saveCostEntry({
      oilId,
      pricePerUnit: price,
      unitSize: size,
      unit: editUnit,
      supplier: editSupplier || undefined,
      lastUpdated: new Date().toISOString(),
    });
    setCostEntries(loadCostEntries());
    setEditingOilId(null);
  }, [editPrice, editSize, editUnit, editSupplier]);

  const handleRemovePrice = useCallback((oilId: string) => {
    removeCostEntry(oilId);
    setCostEntries(loadCostEntries());
  }, []);

  const handleLyeCostChange = useCallback((value: string) => {
    const cost = parseFloat(value) || 0;
    setLyeCost(cost);
    setLyeCostPerOz(cost);
  }, []);

  const startEditing = useCallback((oilId: string) => {
    const existing = costEntries.find(e => e.oilId === oilId);
    setEditingOilId(oilId);
    setEditPrice(existing?.pricePerUnit?.toString() || '');
    setEditSize(existing?.unitSize?.toString() || '16');
    setEditUnit(existing?.unit || 'oz');
    setEditSupplier(existing?.supplier || '');
  }, [costEntries]);

  // Calculate costs
  const breakdown: CostBreakdown | null = useMemo(() => {
    if (recipeOils.length === 0 || totalOilWeight === 0) return null;

    const oilsWithNames = recipeOils.map(o => {
      const oil = OILS_DATABASE.find(db => db.id === o.oilId);
      return {
        oilId: o.oilId,
        oilName: oil?.name || o.oilId,
        weight: (o.percent / 100) * totalOilWeight,
      };
    });

    return calculateRecipeCost(oilsWithNames, lyeWeight, unit, barsPerBatch, totalBatchWeight);
  }, [recipeOils, totalOilWeight, unit, lyeWeight, totalBatchWeight, barsPerBatch, costEntries, lyeCost]);

  const costMap = useMemo(() => new Map(costEntries.map(e => [e.oilId, e])), [costEntries]);

  return (
    <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
      <h3 className="text-gold-400 font-serif text-lg mb-4">Cost Calculator</h3>

      {/* Lye Cost Input */}
      <div className="mb-4">
        <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1">
          Lye Cost (per oz)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-parchment-400 text-sm">$</span>
          <input
            type="number"
            value={lyeCost || ''}
            onChange={e => handleLyeCostChange(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-24 bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-1.5 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
          />
          <span className="text-parchment-500 text-xs">/ oz</span>
        </div>
      </div>

      {/* Bars Per Batch */}
      <div className="mb-4">
        <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-1">
          Bars Per Batch
        </label>
        <input
          type="number"
          value={barsPerBatch}
          onChange={e => setBarsPerBatch(Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
          className="w-24 bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-1.5 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
        />
      </div>

      {/* Oil Prices */}
      <div className="mb-4">
        <label className="text-xs text-parchment-500 uppercase tracking-wider block mb-2">
          Oil Prices
        </label>
        <div className="space-y-2">
          {recipeOils.map(entry => {
            const oil = OILS_DATABASE.find(o => o.id === entry.oilId);
            if (!oil) return null;
            const costEntry = costMap.get(entry.oilId);
            const isEditing = editingOilId === entry.oilId;

            return (
              <div key={entry.oilId} className="bg-navy-800/40 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-parchment-200">{oil.name}</span>
                  {costEntry && !isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400">
                        ${costEntry.pricePerUnit} / {costEntry.unitSize} {costEntry.unit}
                      </span>
                      <button
                        onClick={() => startEditing(entry.oilId)}
                        className="text-[10px] text-parchment-500 hover:text-gold-400 transition-colors"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => handleRemovePrice(entry.oilId)}
                        className="text-[10px] text-red-500/60 hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : !isEditing ? (
                    <button
                      onClick={() => startEditing(entry.oilId)}
                      className="text-xs text-gold-500/60 hover:text-gold-400 transition-colors"
                    >
                      + Add Price
                    </button>
                  ) : null}
                </div>

                {/* Inline editor */}
                {isEditing && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-parchment-600 block mb-0.5">Price ($)</label>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          placeholder="12.99"
                          step="0.01"
                          min="0"
                          className="w-full bg-navy-800 border border-navy-600/40 rounded px-2 py-1 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
                          autoFocus
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-parchment-600 block mb-0.5">Size</label>
                        <input
                          type="number"
                          value={editSize}
                          onChange={e => setEditSize(e.target.value)}
                          placeholder="16"
                          min="0"
                          className="w-full bg-navy-800 border border-navy-600/40 rounded px-2 py-1 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-parchment-600 block mb-0.5">Unit</label>
                        <select
                          value={editUnit}
                          onChange={e => setEditUnit(e.target.value as WeightUnit)}
                          className="bg-navy-800 border border-navy-600/40 rounded px-2 py-1 text-sm text-parchment-200 focus:outline-none focus:border-gold-500/60"
                        >
                          <option value="oz">oz</option>
                          <option value="lb">lb</option>
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-parchment-600 block mb-0.5">Supplier (optional)</label>
                      <input
                        type="text"
                        value={editSupplier}
                        onChange={e => setEditSupplier(e.target.value)}
                        placeholder="e.g., Bramble Berry"
                        className="w-full bg-navy-800 border border-navy-600/40 rounded px-2 py-1 text-sm text-parchment-200 placeholder-parchment-600 focus:outline-none focus:border-gold-500/60"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSavePrice(entry.oilId)}
                        className="px-3 py-1 rounded text-xs font-medium bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingOilId(null)}
                        className="px-3 py-1 rounded text-xs font-medium text-parchment-500 hover:text-parchment-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost Breakdown */}
      {breakdown && (
        <div className="border-t border-navy-600/30 pt-4">
          <h4 className="text-parchment-300 text-sm font-medium mb-3">Cost Breakdown</h4>

          {/* Per-oil costs */}
          <div className="space-y-1 mb-3">
            {breakdown.oilCosts.map(oc => (
              <div key={oc.oilId} className="flex justify-between text-xs">
                <span className={oc.hasPricing ? 'text-parchment-300' : 'text-parchment-600 italic'}>
                  {oc.oilName}
                </span>
                <span className={oc.hasPricing ? 'text-parchment-200' : 'text-parchment-600'}>
                  {oc.hasPricing ? `$${oc.cost.toFixed(2)}` : 'no price'}
                </span>
              </div>
            ))}
            {breakdown.lyeCost > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-parchment-300">Lye</span>
                <span className="text-parchment-200">${breakdown.lyeCost.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="bg-navy-800/60 rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-parchment-400">Total Raw Cost</span>
              <span className="text-sm font-bold text-gold-400">${breakdown.totalRawCost.toFixed(2)}</span>
            </div>
            {breakdown.costPerBar !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-parchment-400">Cost Per Bar</span>
                <span className="text-sm font-bold text-parchment-200">${breakdown.costPerBar.toFixed(2)}</span>
              </div>
            )}
            {breakdown.costPerOz !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-parchment-400">Cost Per Oz</span>
                <span className="text-sm font-bold text-parchment-200">${breakdown.costPerOz.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Suggested Retail */}
          {breakdown.costPerBar !== null && breakdown.costPerBar > 0 && (
            <div className="mt-3">
              <span className="text-[10px] text-parchment-500 uppercase tracking-wider block mb-1">
                Suggested Retail Price
              </span>
              <div className="flex gap-2">
                {[2.5, 3, 4].map(markup => (
                  <div key={markup} className="flex-1 bg-navy-800/40 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-parchment-500">{markup}x markup</div>
                    <div className="text-sm font-bold text-gold-400">
                      ${(breakdown.costPerBar! * markup).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing pricing warning */}
          {breakdown.missingPricing.length > 0 && (
            <p className="text-amber-400 text-[10px] mt-2">
              Missing prices for: {breakdown.missingPricing.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
