import type { LessonNote } from '../../data/soap-lessons';

interface LessonNoteTagProps {
  note: LessonNote;
}

export default function LessonNoteTag({ note }: LessonNoteTagProps) {
  return (
    <span className="lesson-note-tag group relative inline-flex align-middle">
      <button
        type="button"
        aria-describedby={note.id}
        className="ml-1 inline-flex h-6 min-w-6 items-center justify-center border border-gold-500/45 bg-gold-500/15 px-1.5 text-[10px] font-semibold tracking-[0.12em] text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-500/25 focus:outline-none focus:ring-2 focus:ring-gold-400/70"
      >
        {note.label}
      </button>
      <span
        id={note.id}
        role="tooltip"
        className="lesson-note-tooltip pointer-events-none absolute left-1/2 top-8 z-30 w-[min(16rem,calc(100vw-2.5rem))] -translate-x-1/2 border border-gold-500/30 bg-midnight p-4 text-left text-xs leading-6 text-parchment-300 opacity-0 shadow-2xl shadow-black/40 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:left-0 sm:w-72 sm:translate-x-0"
      >
        <span className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-gold-400">{note.title}</span>
        {note.body}
      </span>
    </span>
  );
}
