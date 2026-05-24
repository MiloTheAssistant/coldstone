import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipePublicationBySrcCode, isRecipeVaultConfigured } from '@/app/lib/recipe-vault';
import type { RecipeSnapshot } from '@/app/lib/recipe-vault';
import { isValidSrcCode, normalizeSrcCode } from '@/app/soap-calculator/studio/recipe-studio-model';

export const dynamic = 'force-dynamic';

type PublicEntry = {
  ingredientType?: string;
  ingredientId?: string;
  displayName?: string;
  name?: string;
  oilId?: string;
  liquidId?: string;
  fragranceId?: string;
  additiveId?: string;
  percent?: number | null;
  usagePercent?: number | null;
  weight?: number | null;
  unit?: string | null;
};

export default async function SrcReleasePage({ params }: { params: Promise<{ srcCode: string }> }) {
  if (!isRecipeVaultConfigured()) notFound();

  const { srcCode } = await params;
  const normalized = normalizeSrcCode(srcCode);
  if (!isValidSrcCode(normalized)) notFound();

  const release = await getRecipePublicationBySrcCode(normalized);
  if (!release || release.publication.status === 'revoked') notFound();

  const { publication, revision, ilc } = release;
  const recipe = revision.recipeSnapshot;
  const createdDate = formatDate(revision.createdAt);
  const ingredientEntries = toPublicEntries(ilc.ingredients);

  return (
    <main className="min-h-screen bg-midnight text-parchment-200">
      <section className="mx-auto max-w-5xl px-5 py-12">
        <Link href="/soap-calculator" className="text-sm text-gold-400 hover:text-gold-300">
          &larr; Soap Calculator
        </Link>

        <div className="mt-8 rounded-xl border border-navy-600/30 bg-navy-900/70 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold-500/70">Public SRC Release</p>
              <h1 className="mt-2 font-serif text-4xl text-gold-300">{publication.title || recipe.name}</h1>
              {recipe.description && <p className="mt-3 max-w-2xl text-parchment-400">{recipe.description}</p>}
            </div>
            <div className="rounded-lg border border-navy-600/30 bg-parchment-100 p-3">
              <Image
                src={`/api/src/${publication.srcCode}/qr`}
                alt={`QR code for ${publication.srcCode}`}
                width={132}
                height={132}
                unoptimized
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <CodeCard label="Soap Recipe Code" value={publication.srcCode} />
            <CodeCard label="Ingredient List Code" value={ilc.ilcCode} />
            <CodeCard label="Revision" value={`#${revision.revisionNumber}`} detail={createdDate} />
          </div>

          {revision.releaseNotesPublic && (
            <section className="mt-8">
              <h2 className="mb-3 font-serif text-xl text-gold-400">Release Notes</h2>
              <p className="rounded-lg bg-navy-800/50 px-3 py-2 text-sm text-parchment-300">
                {revision.releaseNotesPublic}
              </p>
            </section>
          )}

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <EntrySection title="Ingredient List" entries={ingredientEntries} emptyText="No public ingredients were released." />
            <FormulaSection recipe={recipe} />
          </div>
        </div>
      </section>
    </main>
  );
}

function CodeCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <section className="rounded-lg bg-navy-800/50 px-4 py-3">
      <h2 className="text-[10px] uppercase tracking-[0.22em] text-parchment-500">{label}</h2>
      <p className="mt-2 break-words font-mono text-sm font-semibold text-gold-300">{value}</p>
      {detail && <p className="mt-1 text-xs text-parchment-500">{detail}</p>}
    </section>
  );
}

function FormulaSection({ recipe }: { recipe: RecipeSnapshot }) {
  const oils = toPublicEntries(recipe.oils);
  const liquids = toPublicEntries(recipe.liquids);
  const fragrances = toPublicEntries(recipe.fragrances);
  const additives = toPublicEntries(recipe.additives);

  return (
    <div className="space-y-6">
      <EntrySection title="Formula Oils" entries={oils} emptyText="No oils were released." />
      {(liquids.length > 0 || fragrances.length > 0 || additives.length > 0) && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <EntrySection title="Liquids" entries={liquids} emptyText="No liquids were released." />
          <EntrySection title="Fragrance & Additives" entries={[...fragrances, ...additives]} emptyText="No extras were released." />
        </div>
      )}
    </div>
  );
}

function EntrySection({ title, entries, emptyText }: { title: string; entries: PublicEntry[]; emptyText: string }) {
  return (
    <section>
      <h2 className="mb-3 font-serif text-xl text-gold-400">{title}</h2>
      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div key={`${entryName(entry)}-${index}`} className="rounded-lg bg-navy-800/50 px-3 py-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-parchment-200">{entryName(entry)}</p>
                  {entry.ingredientType && (
                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-parchment-500">{entry.ingredientType}</p>
                  )}
                </div>
                <p className="shrink-0 text-right text-gold-400">{entryAmount(entry)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-navy-800/50 px-3 py-2 text-sm text-parchment-500">{emptyText}</p>
      )}
    </section>
  );
}

function toPublicEntries(value: unknown): PublicEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map(toPublicEntry);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toPublicEntry(entry: Record<string, unknown>): PublicEntry {
  return {
    ingredientType: readString(entry.ingredientType),
    ingredientId: readString(entry.ingredientId),
    displayName: readString(entry.displayName),
    name: readString(entry.name),
    oilId: readString(entry.oilId),
    liquidId: readString(entry.liquidId),
    fragranceId: readString(entry.fragranceId),
    additiveId: readString(entry.additiveId),
    percent: readNumber(entry.percent),
    usagePercent: readNumber(entry.usagePercent),
    weight: readNumber(entry.weight),
    unit: readString(entry.unit),
  };
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function readNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function entryName(entry: PublicEntry) {
  return entry.displayName || entry.name || entry.oilId || entry.liquidId || entry.fragranceId || entry.additiveId || entry.ingredientId || 'Ingredient';
}

function entryAmount(entry: PublicEntry) {
  const percent = entry.percent ?? entry.usagePercent;
  const weight = entry.weight;

  if (typeof percent === 'number' && Number.isFinite(percent)) return `${percent}%`;
  if (typeof weight === 'number' && Number.isFinite(weight)) return `${weight}${entry.unit ? ` ${entry.unit}` : ''}`;
  return 'Included';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}
