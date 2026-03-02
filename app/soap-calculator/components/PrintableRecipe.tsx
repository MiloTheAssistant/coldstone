'use client';

import { OILS_DATABASE } from '../data/oils';
import type { FullRecipeResult, LyeType, WeightUnit } from '../data/calculator';

interface PrintableRecipeProps {
  recipeName: string;
  recipeResult: FullRecipeResult;
  lyeType: LyeType;
  superfat: number;
  waterRatio: number;
  unit: WeightUnit;
  notes?: string;
}

export default function PrintableRecipe({
  recipeName,
  recipeResult,
  lyeType,
  superfat,
  waterRatio,
  unit,
  notes,
}: PrintableRecipeProps) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate cure-by date (6 weeks from today)
  const cureDate = new Date();
  cureDate.setDate(cureDate.getDate() + 42);
  const cureDateStr = cureDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="printable-recipe hidden print:block bg-white text-black p-8 max-w-[8in] mx-auto text-[11pt] leading-relaxed">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
            {recipeName}
          </h1>
          <p className="text-xs text-gray-600 mt-1">Coldstone Soap Co. — Batch Sheet</p>
        </div>
        <div className="text-right text-xs text-gray-600">
          <p>Date: {today}</p>
          <p>Cure by: {cureDateStr}</p>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-5 gap-3 mb-6 text-center">
        <SummaryBox label="Total Oils" value={`${recipeResult.lye.totalOilWeight} ${unit}`} />
        <SummaryBox label={`${lyeType} Needed`} value={`${recipeResult.lye.lyeWeight} ${unit}`} bold />
        <SummaryBox label="Water Needed" value={`${recipeResult.lye.waterWeight} ${unit}`} bold />
        <SummaryBox label="Superfat" value={`${superfat}%`} />
        <SummaryBox label="Total Batch" value={`${recipeResult.totalBatchWeight} ${unit}`} />
      </div>

      {/* Oil Weights Table */}
      <table className="w-full mb-6 text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-1.5 pr-4 font-semibold">Oil / Fat</th>
            <th className="text-right py-1.5 px-2 font-semibold">%</th>
            <th className="text-right py-1.5 px-2 font-semibold">Weight ({unit})</th>
            <th className="text-right py-1.5 px-2 font-semibold">{lyeType} ({unit})</th>
            <th className="text-center py-1.5 pl-2 w-8 font-semibold">&#10003;</th>
          </tr>
        </thead>
        <tbody>
          {recipeResult.oils.map(o => {
            const lyeForOil = lyeType === 'NaOH'
              ? (o.weight * o.oil.sapNaOH * (1 - superfat / 100)).toFixed(2)
              : (o.weight * (o.oil.sapKOH / 1000) * (1 - superfat / 100)).toFixed(2);
            return (
              <tr key={o.oil.id} className="border-b border-gray-300">
                <td className="py-1.5 pr-4">{o.oil.name}</td>
                <td className="py-1.5 px-2 text-right">{o.percent}%</td>
                <td className="py-1.5 px-2 text-right font-medium">{o.weight}</td>
                <td className="py-1.5 px-2 text-right">{lyeForOil}</td>
                <td className="py-1.5 pl-2 text-center">
                  <span className="inline-block w-4 h-4 border border-gray-500 rounded-sm" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Properties Summary */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-400 pb-1">
          Soap Properties
        </h3>
        <div className="grid grid-cols-4 gap-x-6 gap-y-1 text-sm">
          <PropLine label="Hardness" value={recipeResult.properties.hardness} />
          <PropLine label="Cleansing" value={recipeResult.properties.cleansing} />
          <PropLine label="Conditioning" value={recipeResult.properties.conditioning} />
          <PropLine label="Bubbly Lather" value={recipeResult.properties.bubbly} />
          <PropLine label="Creamy Lather" value={recipeResult.properties.creamy} />
          <PropLine label="Iodine" value={recipeResult.properties.iodine} />
          <PropLine label="INS" value={recipeResult.properties.ins} />
          <PropLine label={`Water:Lye`} value={`${waterRatio}:1`} />
        </div>
      </div>

      {/* Batch Checklist */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-400 pb-1">
          Batch Checklist
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {[
            'Weigh oils & fats',
            'Melt solid oils',
            'Weigh lye (with PPE)',
            'Weigh distilled water',
            'Mix lye into water (NOT water into lye)',
            'Cool lye solution to target temp',
            'Combine oils at target temp',
            'Stick blend to trace',
            'Add fragrance / color / additives',
            'Pour into mold',
            'Insulate & wait 24–48 hrs',
            'Unmold, cut, cure 4–6 weeks',
          ].map((step, i) => (
            <label key={i} className="flex items-start gap-2 py-0.5">
              <span className="inline-block w-3.5 h-3.5 border border-gray-500 rounded-sm mt-0.5 flex-shrink-0" />
              <span>{step}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-400 pb-1">
          Batch Notes
        </h3>
        {notes ? (
          <p className="text-sm whitespace-pre-wrap">{notes}</p>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="border-b border-gray-300 h-5" />
            <div className="border-b border-gray-300 h-5" />
            <div className="border-b border-gray-300 h-5" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-black pt-3 flex justify-between text-[9pt] text-gray-500">
        <span>Coldstone Soap Co. — Soap Calculator</span>
        <span>SAP values are approximations. Always verify with your supplier. Superfat for safety.</span>
      </div>
    </div>
  );
}

function SummaryBox({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="border border-gray-400 rounded px-2 py-2">
      <div className="text-[9pt] text-gray-600 uppercase tracking-wider">{label}</div>
      <div className={`text-base ${bold ? 'font-bold' : 'font-medium'}`}>{value}</div>
    </div>
  );
}

function PropLine({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
