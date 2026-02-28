'use client';

import { RecipeTemplate } from '../data/oils';
import { SoapProperties } from '../data/calculator';

interface RecipeCardProps {
  template: RecipeTemplate;
  properties: SoapProperties;
  onLoad: (template: RecipeTemplate) => void;
}

export default function RecipeCard({ template, properties, onLoad }: RecipeCardProps) {
  return (
    <div className="bg-navy-900/60 border border-navy-600/30 rounded-xl p-5 hover:border-gold-500/40 transition-all group">
      <h4 className="text-gold-300 font-serif text-lg group-hover:text-gold-400 transition-colors">
        {template.name}
      </h4>
      <p className="text-parchment-400 text-sm mt-1 mb-3 leading-relaxed">{template.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {template.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-0.5 text-[10px] rounded-full bg-navy-800 text-parchment-400 border border-navy-600/30"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Quick properties */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-navy-800/60 rounded-lg p-2">
          <div className="text-[10px] text-parchment-500 uppercase">Hardness</div>
          <div className="text-sm font-bold text-parchment-200">{properties.hardness}</div>
        </div>
        <div className="bg-navy-800/60 rounded-lg p-2">
          <div className="text-[10px] text-parchment-500 uppercase">Cleansing</div>
          <div className="text-sm font-bold text-parchment-200">{properties.cleansing}</div>
        </div>
        <div className="bg-navy-800/60 rounded-lg p-2">
          <div className="text-[10px] text-parchment-500 uppercase">Conditioning</div>
          <div className="text-sm font-bold text-parchment-200">{properties.conditioning}</div>
        </div>
      </div>

      {/* Oil list preview */}
      <div className="text-xs text-parchment-500 mb-4">
        {template.oils.map((o, i) => (
          <span key={o.oilId}>
            {o.percent}% {o.oilId.replace(/-/g, ' ')}{i < template.oils.length - 1 ? ' · ' : ''}
          </span>
        ))}
        <span className="ml-2 text-gold-500/60">({template.superfat}% SF)</span>
      </div>

      <button
        onClick={() => onLoad(template)}
        className="w-full py-2 rounded-lg bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 transition-colors text-sm font-medium border border-gold-500/20"
      >
        Load Recipe into Calculator
      </button>
    </div>
  );
}
