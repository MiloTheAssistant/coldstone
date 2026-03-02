'use client';

import { OilData } from '../data/oils';

interface OilInfoProps {
  oil: OilData;
  onClose: () => void;
}

export default function OilInfo({ oil, onClose }: OilInfoProps) {
  const fa = oil.fattyAcids;
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
