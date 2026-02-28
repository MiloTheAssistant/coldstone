'use client';

interface PropertyBarProps {
  label: string;
  value: number;
  min: number;
  max: number;
  maxScale?: number;
}

export default function PropertyBar({ label, value, min, max, maxScale = 100 }: PropertyBarProps) {
  const pct = Math.min((value / maxScale) * 100, 100);
  const inRange = value >= min && value <= max;
  const rangeStart = (min / maxScale) * 100;
  const rangeEnd = (max / maxScale) * 100;

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-parchment-200 font-medium">{label}</span>
        <span className={`font-bold ${inRange ? 'text-green-400' : value < min ? 'text-amber-400' : 'text-red-400'}`}>
          {value}
        </span>
      </div>
      <div className="relative h-4 bg-navy-800 rounded-full overflow-hidden border border-navy-600/40">
        {/* Recommended range indicator */}
        <div
          className="absolute top-0 bottom-0 bg-green-900/40 border-l border-r border-green-600/30"
          style={{ left: `${rangeStart}%`, width: `${rangeEnd - rangeStart}%` }}
        />
        {/* Value bar */}
        <div
          className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500 ${
            inRange ? 'bg-gradient-to-r from-green-600 to-green-500' :
            value < min ? 'bg-gradient-to-r from-amber-700 to-amber-500' :
            'bg-gradient-to-r from-red-700 to-red-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-parchment-400 mt-0.5">
        <span>{min}</span>
        <span className="text-parchment-500">recommended range</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
