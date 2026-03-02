'use client';

import { useState, useMemo, useCallback } from 'react';
import type { WeightUnit } from '../data/calculator';
import {
  FRAGRANCES_DATABASE,
  BLEND_FAMILY_LABELS,
  NOTE_LABELS,
  calculateFragranceAmounts,
  analyzeBlendHarmony,
  type FragranceData,
  type FragranceEntry,
} from '../data/fragrances';

// Unit conversion to ounces
const TO_OZ: Record<WeightUnit, number> = { oz: 1, lb: 16, g: 0.035274, kg: 35.274 };

interface FragrancePanelProps {
  totalOilWeight: number;
  unit: WeightUnit;
}

export default function FragrancePanel({ totalOilWeight, unit }: FragrancePanelProps) {
  const [entries, setEntries] = useState<FragranceEntry[]>([]);
  const [search, setSearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState<FragranceData['blendFamily'] | 'all'>('all');
  const [showBrowser, setShowBrowser] = useState(false);

  const totalOilWeightOz = totalOilWeight * TO_OZ[unit];

  // Filtered database
  const filteredFragrances = useMemo(() => {
    return FRAGRANCES_DATABASE
      .filter(f => familyFilter === 'all' || f.blendFamily === familyFilter)
      .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
      .filter(f => !entries.some(e => e.fragranceId === f.id));
  }, [search, familyFilter, entries]);

  // Calculate amounts
  const results = useMemo(() => {
    return calculateFragranceAmounts(entries, totalOilWeightOz);
  }, [entries, totalOilWeightOz]);

  // Blend harmony
  const harmony = useMemo(() => {
    return analyzeBlendHarmony(entries);
  }, [entries]);

  const handleAdd = useCallback((fragrance: FragranceData) => {
    setEntries(prev => [...prev, {
      fragranceId: fragrance.id,
      usagePercent: fragrance.commonUsagePercent,
    }]);
    setShowBrowser(false);
    setSearch('');
  }, []);

  const handleRemove = useCallback((fragranceId: string) => {
    setEntries(prev => prev.filter(e => e.fragranceId !== fragranceId));
  }, []);

  const handlePercentChange = useCallback((fragranceId: string, percent: number) => {
    setEntries(prev => prev.map(e =>
      e.fragranceId === fragranceId
        ? { ...e, usagePercent: Math.max(0, Math.min(10, percent)) }
        : e
    ));
  }, []);

  return (
    <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gold-400 font-serif text-lg">Fragrance Calculator</h3>
        <button
          onClick={() => setShowBrowser(!showBrowser)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 transition-colors border border-gold-500/20"
        >
          {showBrowser ? 'Close' : '+ Add EO'}
        </button>
      </div>

      {/* IFRA Disclaimer */}
      <p className="text-parchment-600 text-[10px] mb-4 leading-relaxed">
        This calculator provides general guidance. Always verify IFRA compliance with your fragrance supplier&apos;s documentation. Not a substitute for professional safety assessment.
      </p>

      {/* Fragrance Browser */}
      {showBrowser && (
        <div className="mb-4 bg-navy-800/40 rounded-lg p-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search essential oils..."
            className="w-full bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 placeholder-parchment-500 focus:outline-none focus:border-gold-500/60 mb-2"
            autoFocus
          />

          {/* Family filter chips */}
          <div className="flex flex-wrap gap-1 mb-2">
            <button
              onClick={() => setFamilyFilter('all')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                familyFilter === 'all'
                  ? 'bg-gold-500 text-navy-900'
                  : 'bg-navy-800 text-parchment-400 hover:bg-navy-700'
              }`}
            >
              All
            </button>
            {(Object.keys(BLEND_FAMILY_LABELS) as FragranceData['blendFamily'][]).map(family => (
              <button
                key={family}
                onClick={() => setFamilyFilter(family)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                  familyFilter === family
                    ? 'bg-gold-500 text-navy-900'
                    : 'bg-navy-800 text-parchment-400 hover:bg-navy-700'
                }`}
              >
                {BLEND_FAMILY_LABELS[family]}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredFragrances.slice(0, 20).map(f => (
              <button
                key={f.id}
                onClick={() => handleAdd(f)}
                className="w-full text-left flex items-center justify-between bg-navy-800/60 hover:bg-navy-700/60 rounded-lg px-3 py-2 transition-colors group"
              >
                <div>
                  <span className="text-sm text-parchment-200 group-hover:text-gold-300 transition-colors">
                    {f.name}
                  </span>
                  <div className="flex gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      f.notePosition === 'top' ? 'bg-amber-900/30 text-amber-400' :
                      f.notePosition === 'middle' ? 'bg-green-900/30 text-green-400' :
                      'bg-purple-900/30 text-purple-400'
                    }`}>
                      {NOTE_LABELS[f.notePosition]}
                    </span>
                    <span className="text-[10px] text-parchment-500">
                      {BLEND_FAMILY_LABELS[f.blendFamily]}
                    </span>
                    <span className="text-[10px] text-parchment-600">
                      IFRA max: {f.ifraMaxPercent}%
                    </span>
                  </div>
                </div>
                <span className="text-gold-500/60 group-hover:text-gold-400 text-lg">+</span>
              </button>
            ))}
            {filteredFragrances.length === 0 && (
              <p className="text-parchment-500 text-sm text-center py-3">No matching fragrances found.</p>
            )}
          </div>
        </div>
      )}

      {/* Selected Fragrances */}
      {entries.length > 0 && (
        <div className="space-y-3 mb-4">
          {results.map(result => {
            const fragrance = FRAGRANCES_DATABASE.find(f => f.id === result.fragranceId);
            if (!fragrance) return null;

            return (
              <div key={result.fragranceId} className="bg-navy-800/40 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm text-parchment-200 font-medium">{result.name}</span>
                    <div className="flex gap-1.5 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        fragrance.notePosition === 'top' ? 'bg-amber-900/30 text-amber-400' :
                        fragrance.notePosition === 'middle' ? 'bg-green-900/30 text-green-400' :
                        'bg-purple-900/30 text-purple-400'
                      }`}>
                        {NOTE_LABELS[fragrance.notePosition]}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        result.complianceStatus === 'safe' ? 'bg-green-900/30 text-green-400' :
                        result.complianceStatus === 'warning' ? 'bg-amber-900/30 text-amber-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {result.complianceStatus === 'safe' ? 'IFRA Safe' :
                         result.complianceStatus === 'warning' ? 'Near IFRA Limit' :
                         'OVER IFRA LIMIT'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(result.fragranceId)}
                    className="text-red-500/60 hover:text-red-400 text-lg leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Usage slider */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="number"
                      value={entries.find(e => e.fragranceId === result.fragranceId)?.usagePercent || 0}
                      onChange={e => handlePercentChange(result.fragranceId, parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      max="10"
                      className="w-16 bg-navy-800 border border-navy-600/40 rounded px-2 py-1 text-sm text-right text-parchment-200 focus:outline-none focus:border-gold-500/60"
                    />
                    <span className="text-xs text-parchment-500">% of oil weight</span>
                    <span className="text-[10px] text-parchment-600 ml-auto">max: {fragrance.ifraMaxPercent}%</span>
                  </div>
                  <input
                    type="range"
                    value={entries.find(e => e.fragranceId === result.fragranceId)?.usagePercent || 0}
                    onChange={e => handlePercentChange(result.fragranceId, parseFloat(e.target.value))}
                    step="0.1"
                    min="0"
                    max={Math.min(fragrance.ifraMaxPercent * 1.2, 10)}
                    className="w-full accent-gold-500"
                  />
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-parchment-500">oz</div>
                    <div className="text-sm font-bold text-parchment-200">{result.amountOz}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-parchment-500">grams</div>
                    <div className="text-sm font-bold text-parchment-200">{result.amountG}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-parchment-500">ml</div>
                    <div className="text-sm font-bold text-parchment-200">{result.amountMl}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-parchment-500">drops</div>
                    <div className="text-sm font-bold text-parchment-200">~{result.drops}</div>
                  </div>
                </div>

                {/* Safety note */}
                {fragrance.safetyNotes && (
                  <p className="text-[10px] text-parchment-600 mt-2 leading-relaxed">
                    {fragrance.safetyNotes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Blend Harmony */}
      {entries.length > 0 && (
        <div className="border-t border-navy-600/30 pt-4">
          <h4 className="text-parchment-300 text-sm font-medium mb-3">Blend Harmony</h4>

          {/* Note balance bar */}
          <div className="mb-3">
            <div className="flex rounded-full overflow-hidden h-4">
              {harmony.topPercent > 0 && (
                <div
                  className="bg-amber-500/60 flex items-center justify-center"
                  style={{ width: `${harmony.topPercent}%` }}
                >
                  <span className="text-[8px] text-white font-bold">{harmony.topPercent}%</span>
                </div>
              )}
              {harmony.middlePercent > 0 && (
                <div
                  className="bg-green-500/60 flex items-center justify-center"
                  style={{ width: `${harmony.middlePercent}%` }}
                >
                  <span className="text-[8px] text-white font-bold">{harmony.middlePercent}%</span>
                </div>
              )}
              {harmony.basePercent > 0 && (
                <div
                  className="bg-purple-500/60 flex items-center justify-center"
                  style={{ width: `${harmony.basePercent}%` }}
                >
                  <span className="text-[8px] text-white font-bold">{harmony.basePercent}%</span>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-amber-400">Top</span>
              <span className="text-[10px] text-green-400">Middle</span>
              <span className="text-[10px] text-purple-400">Base</span>
            </div>
          </div>

          {/* Harmony status */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-1 rounded-full ${
              harmony.harmony === 'balanced' ? 'bg-green-900/40 text-green-400' :
              harmony.harmony === 'no-base' ? 'bg-amber-900/40 text-amber-400' :
              harmony.harmony === 'no-top' ? 'bg-amber-900/40 text-amber-400' :
              'bg-amber-900/40 text-amber-400'
            }`}>
              {harmony.harmony === 'balanced' ? 'Well Balanced' :
               harmony.harmony === 'top-heavy' ? 'Top Heavy — add base notes for longevity' :
               harmony.harmony === 'base-heavy' ? 'Base Heavy — add top notes for brightness' :
               harmony.harmony === 'no-base' ? 'No Base Notes — scent will fade quickly' :
               harmony.harmony === 'no-top' ? 'No Top Notes — may lack initial impact' :
               'Balanced'}
            </span>
          </div>

          {/* Total fragrance load */}
          <div className="mt-3 flex justify-between text-xs">
            <span className="text-parchment-400">Total Fragrance Load</span>
            <span className="text-parchment-200 font-medium">{harmony.totalPercent}% of oil weight</span>
          </div>

          {/* IFRA compliance summary */}
          {!harmony.isOverallCompliant && (
            <p className="text-red-400 text-[10px] mt-2 font-medium">
              One or more fragrances exceed IFRA limits. Reduce usage to comply.
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && !showBrowser && (
        <p className="text-parchment-500 text-sm text-center py-4">
          Add essential oils to calculate amounts and check IFRA compliance.
        </p>
      )}
    </div>
  );
}
