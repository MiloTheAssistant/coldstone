'use client';

import { useState, useMemo } from 'react';
import { OILS_DATABASE, OilData, CATEGORY_LABELS } from '../data/oils';

interface OilSelectorProps {
  selectedOilIds: string[];
  onAddOil: (oil: OilData) => void;
}

export default function OilSelector({ selectedOilIds, onAddOil }: OilSelectorProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<OilData['category'] | 'all'>('all');

  const filteredOils = useMemo(() => {
    return OILS_DATABASE
      .filter(oil => !selectedOilIds.includes(oil.id))
      .filter(oil => categoryFilter === 'all' || oil.category === categoryFilter)
      .filter(oil => oil.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, categoryFilter, selectedOilIds]);

  const grouped = useMemo(() => {
    const groups: Record<string, OilData[]> = {};
    for (const oil of filteredOils) {
      const cat = CATEGORY_LABELS[oil.category];
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(oil);
    }
    return groups;
  }, [filteredOils]);

  return (
    <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-4">
      <h3 className="text-gold-400 font-serif text-lg mb-3">Add Oil / Butter / Fat</h3>

      {/* Search */}
      <input
        type="text"
        placeholder="Search oils..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-navy-800 border border-navy-600/40 rounded-lg px-3 py-2 text-sm text-parchment-200 placeholder-parchment-500 focus:outline-none focus:border-gold-500/60 mb-3"
      />

      {/* Category Filter */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {(['all', 'oil', 'butter', 'fat', 'wax'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-gold-500 text-navy-900'
                : 'bg-navy-800 text-parchment-400 hover:bg-navy-700'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Oil list */}
      <div className="max-h-64 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {Object.entries(grouped).map(([category, oils]) => (
          <div key={category}>
            <div className="text-xs text-parchment-500 uppercase tracking-wider mb-1 font-semibold">
              {category}
            </div>
            {oils.map(oil => (
              <button
                key={oil.id}
                onClick={() => onAddOil(oil)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-navy-700/60 transition-colors group flex justify-between items-center"
              >
                <div>
                  <span className="text-sm text-parchment-200 group-hover:text-gold-300">{oil.name}</span>
                  <span className="text-[10px] text-parchment-500 ml-2">SAP {oil.sapNaOH}</span>
                </div>
                <span className="text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity text-lg">+</span>
              </button>
            ))}
          </div>
        ))}
        {filteredOils.length === 0 && (
          <p className="text-parchment-500 text-sm text-center py-4">No oils match your search.</p>
        )}
      </div>
    </div>
  );
}
