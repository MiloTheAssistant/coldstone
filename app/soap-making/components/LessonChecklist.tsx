import type { LessonChecklistItem, LessonModule } from '../../data/soap-lessons';

interface LessonChecklistProps {
  module: LessonModule;
  items?: LessonChecklistItem[];
}

export default function LessonChecklist({ module, items = module.checklist }: LessonChecklistProps) {
  return (
    <section className="lesson-printable-checklist border border-gold-500/20 bg-midnight/75 p-5 sm:p-7">
      <div className="mb-6 flex flex-col gap-2 border-b border-gold-500/20 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-gold-400">End-of-Module Checklist</p>
          <h2 className="font-serif text-2xl text-parchment-100">{module.title}</h2>
        </div>
        <p className="text-xs leading-6 text-parchment-500">Print this section for bench use or copy it into the batch record.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <label key={item.label} className="flex gap-3 border border-gold-500/15 bg-navy-900/65 p-4">
            <span className="mt-1 h-4 w-4 shrink-0 border border-gold-500/60 bg-midnight" aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold text-parchment-100">{item.label}</span>
              <span className="mt-1 block text-xs leading-6 text-parchment-400">{item.detail}</span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
