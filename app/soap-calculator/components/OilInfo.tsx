'use client';

import { useEffect, useMemo, useState } from 'react';
import { OilData } from '../data/oils';
import type { WeightUnit } from '../data/calculator';
import { pricePerOz, type OilCostEntry } from '../lib/costData';

interface OilInfoProps {
  oil: OilData;
  costEntry?: OilCostEntry;
  canUseIngredientCosts?: boolean;
  onSaveCostEntry?: (entry: OilCostEntry) => void;
  onRemoveCostEntry?: (oilId: string) => void;
  onClose: () => void;
}

export default function OilInfo({
  oil,
  costEntry,
  canUseIngredientCosts = false,
  onSaveCostEntry,
  onRemoveCostEntry,
  onClose,
}: OilInfoProps) {
  const fa = oil.fattyAcids;
  const [itemCost, setItemCost] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [taxCost, setTaxCost] = useState('');
  const [unitSize, setUnitSize] = useState('16');
  const [unit, setUnit] = useState<WeightUnit>('oz');
  const [supplier, setSupplier] = useState('');

  useEffect(() => {
    setItemCost(costEntry?.pricePerUnit?.toString() || '');
    setShippingCost(costEntry?.shippingCost?.toString() || '');
    setTaxCost(costEntry?.taxCost?.toString() || '');
    setUnitSize(costEntry?.unitSize?.toString() || '16');
    setUnit(costEntry?.unit || 'oz');
    setSupplier(costEntry?.supplier || '');
  }, [costEntry, oil.id]);

  const draftCostEntry = useMemo<OilCostEntry | null>(() => {
    const price = parseFloat(itemCost);
    const size = parseFloat(unitSize);
    if (!Number.isFinite(price) || !Number.isFinite(size) || price <= 0 || size <= 0) return null;

    const shipping = parseFloat(shippingCost);
    const tax = parseFloat(taxCost);
    return {
      oilId: oil.id,
      pricePerUnit: price,
      shippingCost: Number.isFinite(shipping) && shipping > 0 ? shipping : undefined,
      taxCost: Number.isFinite(tax) && tax > 0 ? tax : undefined,
      unitSize: size,
      unit,
      supplier: supplier || undefined,
      lastUpdated: costEntry?.lastUpdated || new Date().toISOString(),
    };
  }, [costEntry?.lastUpdated, itemCost, oil.id, shippingCost, supplier, taxCost, unit, unitSize]);

  const landedCost = draftCostEntry
    ? draftCostEntry.pricePerUnit + (draftCostEntry.shippingCost || 0) + (draftCostEntry.taxCost || 0)
    : null;
  const acids = [
    { name: 'Lauric', value: fa.lauric, color: 'bg-blue-500' },
    { name: 'Myristic', value: fa.myristic, color: 'bg-sky-500' },
    { name: 'Palmitic', value: fa.palmitic, color: 'bg-amber-500' },
    { name: 'Stearic', value: fa.stearic, color: 'bg-orange-500' },
    { name: 'Oleic', value: fa.oleic, color: 'bg-green-500' },
    { name: 'Linoleic', value: fa.linoleic, color: 'bg-lime-500' },
    { name: 'Linolenic', value: fa.linolenic, color: 'bg-teal-500' },
    { name: 'Ricinoleic', value: fa.ricinoleic, color: 'bg-purple-500' },
  ].filter(a => a.value > 0);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-navy-900 border border-navy-600/50 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-gold-400 font-serif text-xl">{oil.name}</h3>
            <span className="text-xs text-parchment-500 uppercase tracking-wider">
              {oil.category} · {oil.costTier} tier
            </span>
          </div>
          <button onClick={onClose} className="text-parchment-500 hover:text-parchment-200 text-xl">×</button>
        </div>

        <p className="text-parchment-300 text-sm mb-4">{oil.notes}</p>

        <div className="mb-5 rounded-xl border border-navy-600/40 bg-navy-950/40 p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-medium text-parchment-200">Ingredient Cost</h4>
              <p className="mt-1 text-xs text-parchment-500">
                Track landed cost here; the batch Cost Calculator uses the same entry.
              </p>
            </div>
            {!canUseIngredientCosts && (
              <span className="rounded-full border border-gold-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-gold-400">
                Plus
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-[10px] uppercase tracking-wider text-parchment-500">
              Item Cost
              <input
                type="number"
                value={itemCost}
                onChange={e => setItemCost(e.target.value)}
                disabled={!canUseIngredientCosts}
                placeholder="12.99"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-navy-600/40 bg-navy-800 px-2 py-1.5 text-sm text-parchment-200 outline-none focus:border-gold-500/60 disabled:cursor-not-allowed disabled:text-parchment-600"
              />
            </label>
            <label className="text-[10px] uppercase tracking-wider text-parchment-500">
              Shipping
              <input
                type="number"
                value={shippingCost}
                onChange={e => setShippingCost(e.target.value)}
                disabled={!canUseIngredientCosts}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-navy-600/40 bg-navy-800 px-2 py-1.5 text-sm text-parchment-200 outline-none focus:border-gold-500/60 disabled:cursor-not-allowed disabled:text-parchment-600"
              />
            </label>
            <label className="text-[10px] uppercase tracking-wider text-parchment-500">
              Tax
              <input
                type="number"
                value={taxCost}
                onChange={e => setTaxCost(e.target.value)}
                disabled={!canUseIngredientCosts}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-navy-600/40 bg-navy-800 px-2 py-1.5 text-sm text-parchment-200 outline-none focus:border-gold-500/60 disabled:cursor-not-allowed disabled:text-parchment-600"
              />
            </label>
          </div>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
            <label className="text-[10px] uppercase tracking-wider text-parchment-500">
              Package Size
              <input
                type="number"
                value={unitSize}
                onChange={e => setUnitSize(e.target.value)}
                disabled={!canUseIngredientCosts}
                placeholder="16"
                min="0"
                className="mt-1 w-full rounded-lg border border-navy-600/40 bg-navy-800 px-2 py-1.5 text-sm text-parchment-200 outline-none focus:border-gold-500/60 disabled:cursor-not-allowed disabled:text-parchment-600"
              />
            </label>
            <label className="text-[10px] uppercase tracking-wider text-parchment-500">
              Unit
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as WeightUnit)}
                disabled={!canUseIngredientCosts}
                className="mt-1 rounded-lg border border-navy-600/40 bg-navy-800 px-2 py-1.5 text-sm text-parchment-200 outline-none focus:border-gold-500/60 disabled:cursor-not-allowed disabled:text-parchment-600"
              >
                <option value="oz">oz</option>
                <option value="lb">lb</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </label>
          </div>
          <label className="mt-2 block text-[10px] uppercase tracking-wider text-parchment-500">
            Supplier
            <input
              type="text"
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              disabled={!canUseIngredientCosts}
              placeholder="Amazon, Bramble Berry, local supplier..."
              className="mt-1 w-full rounded-lg border border-navy-600/40 bg-navy-800 px-2 py-1.5 text-sm text-parchment-200 placeholder-parchment-600 outline-none focus:border-gold-500/60 disabled:cursor-not-allowed disabled:text-parchment-600"
            />
          </label>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-parchment-500">
              Landed cost:{' '}
              <span className="font-mono text-gold-300">
                {draftCostEntry && landedCost !== null
                  ? `$${landedCost.toFixed(2)} / ${draftCostEntry.unitSize} ${draftCostEntry.unit} ($${pricePerOz(draftCostEntry).toFixed(2)}/oz)`
                  : 'Not set'}
              </span>
            </div>
            <div className="flex gap-2">
              {costEntry && (
                <button
                  type="button"
                  onClick={() => onRemoveCostEntry?.(oil.id)}
                  disabled={!canUseIngredientCosts}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:text-parchment-600"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => draftCostEntry && onSaveCostEntry?.(draftCostEntry)}
                disabled={!canUseIngredientCosts || !draftCostEntry}
                className="rounded-lg border border-gold-500/20 bg-gold-500/20 px-3 py-1.5 text-xs font-medium text-gold-400 transition-colors hover:bg-gold-500/30 disabled:cursor-not-allowed disabled:border-navy-700/40 disabled:bg-navy-800/40 disabled:text-parchment-600"
              >
                Save Cost
              </button>
            </div>
          </div>
        </div>

        {/* Key values */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'NaOH SAP', value: oil.sapNaOH.toFixed(4) },
            { label: 'KOH SAP', value: oil.sapKOH.toString() },
            { label: 'Iodine', value: oil.iodine.toString() },
            { label: 'INS', value: oil.ins.toString() },
            { label: 'Max %', value: `${oil.maxPercent}%` },
          ].map(item => (
            <div key={item.label} className="bg-navy-800/60 rounded-lg p-2.5 text-center">
              <div className="text-[10px] text-parchment-500 uppercase">{item.label}</div>
              <div className="text-sm font-bold text-parchment-200">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Fatty acid breakdown */}
        <h4 className="text-parchment-200 font-medium text-sm mb-3">Fatty Acid Profile</h4>
        <div className="space-y-2">
          {acids.map(acid => (
            <div key={acid.name} className="flex items-center gap-3">
              <span className="text-xs text-parchment-400 w-20">{acid.name}</span>
              <div className="flex-1 h-3 bg-navy-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${acid.color} rounded-full transition-all duration-300`}
                  style={{ width: `${acid.value}%` }}
                />
              </div>
              <span className="text-xs text-parchment-300 w-10 text-right">{acid.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
