'use client';

import { useState } from 'react';

export type SrcStampMode = 'new-src' | 'same-src';

interface SrcStampDialogProps {
  recipeName: string;
  mode: SrcStampMode;
  canUpdateSrcRevision: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (input: { mode: SrcStampMode; revisionNotes: string }) => void | Promise<void>;
}

export default function SrcStampDialog({
  recipeName,
  mode,
  canUpdateSrcRevision,
  error,
  onCancel,
  onConfirm,
}: SrcStampDialogProps) {
  const [revisionNotes, setRevisionNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const showRevisionNotes = mode === 'same-src' || canUpdateSrcRevision;
  const isSameSrc = mode === 'same-src';

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm({ mode, revisionNotes });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/80 px-4 py-6">
      <div className="w-full max-w-lg rounded-xl border border-gold-500/30 bg-navy-950 p-6 shadow-2xl">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.22em] text-gold-500/70">
            Soap Recipe Code
          </p>
          <h3 className="mt-2 font-serif text-2xl text-gold-300">
            {isSameSrc ? 'Update SRC' : 'Stamp It'}
          </h3>
          <p className="mt-2 text-sm text-parchment-400">{recipeName}</p>
        </div>

        <div className="rounded-lg border border-navy-600/40 bg-navy-900/70 p-4 text-sm text-parchment-300">
          {isSameSrc ? (
            <p>
              Updating this SRC keeps the public recipe code but publishes a new revision and ingredient list code.
              Use this only when the same recipe identity is being revised.
            </p>
          ) : (
            <p>
              Stamp SRC only when this recipe is ready for production or sale. The stamped release creates public
              SRC and ILC identifiers for the recipe snapshot.
            </p>
          )}
        </div>

        {showRevisionNotes && (
          <label className="mt-4 block">
            <span className="text-xs font-medium text-parchment-300">Revision notes</span>
            <textarea
              value={revisionNotes}
              onChange={(event) => setRevisionNotes(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-navy-600/40 bg-navy-900 px-3 py-2 text-sm text-parchment-200 outline-none focus:border-gold-500/60"
              placeholder={isSameSrc ? 'Describe what changed in this SRC revision.' : 'Optional release notes.'}
            />
          </label>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-600/40 bg-red-950/30 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-navy-600/40 bg-navy-900 px-4 py-2 text-sm font-medium text-parchment-400 hover:text-parchment-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="rounded-lg border border-gold-500/30 bg-gold-500/20 px-4 py-2 text-sm font-semibold text-gold-300 hover:bg-gold-500/30 disabled:opacity-50"
          >
            {busy ? 'Stamping...' : isSameSrc ? 'Update SRC' : 'Stamp It'}
          </button>
        </div>
      </div>
    </div>
  );
}
