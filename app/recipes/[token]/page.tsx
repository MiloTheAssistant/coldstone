import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSharedRecipe, isRecipeVaultConfigured } from '@/app/lib/recipe-vault';

export const dynamic = 'force-dynamic';

export default async function SharedRecipePage({ params }: { params: Promise<{ token: string }> }) {
  if (!isRecipeVaultConfigured()) notFound();

  const { token } = await params;
  const recipe = await getSharedRecipe(token);
  if (!recipe) notFound();

  return (
    <main className="min-h-screen bg-midnight text-parchment-200">
      <section className="max-w-4xl mx-auto px-5 py-12">
        <Link href="/soap-calculator" className="text-sm text-gold-400 hover:text-gold-300">
          &larr; Soap Calculator
        </Link>

        <div className="mt-8 border border-navy-600/30 bg-navy-900/70 rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold-500/70">Shared Recipe</p>
              <h1 className="font-serif text-4xl text-gold-300 mt-2">{recipe.name}</h1>
              {recipe.description && <p className="text-parchment-400 mt-3 max-w-2xl">{recipe.description}</p>}
            </div>
            <span className="rounded-full border border-gold-500/20 px-3 py-1 text-[10px] uppercase tracking-wider text-gold-400">
              {recipe.mode} mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <section>
              <h2 className="text-gold-400 font-serif text-xl mb-3">Oils</h2>
              <div className="space-y-2">
                {(recipe.oils as Array<{ oilId?: string; name?: string; percent?: number; weight?: number; unit?: string }>).map((oil, index) => (
                  <div key={`${oil.oilId || 'oil'}-${index}`} className="flex justify-between rounded-lg bg-navy-800/50 px-3 py-2 text-sm">
                    <span>{oil.name || oil.oilId}</span>
                    <span className="text-gold-400">{oil.percent ?? 0}%</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-gold-400 font-serif text-xl mb-3">Process</h2>
              <ol className="space-y-2">
                {(recipe.processSteps as Array<{ label?: string; description?: string }>).map((step, index) => (
                  <li key={`${step.label}-${index}`} className="rounded-lg bg-navy-800/50 px-3 py-2 text-sm">
                    <span className="text-gold-400 font-bold mr-2">{index + 1}.</span>
                    <span>{step.label}</span>
                    {step.description && <p className="text-xs text-parchment-500 mt-1 ml-6">{step.description}</p>}
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {(recipe.fragrances.length > 0 || recipe.additives.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <section>
                <h2 className="text-gold-400 font-serif text-xl mb-3">Fragrance</h2>
                <div className="space-y-2">
                  {(recipe.fragrances as Array<{ fragranceId?: string; usagePercent?: number }>).map((fragrance, index) => (
                    <div key={`${fragrance.fragranceId || 'fragrance'}-${index}`} className="rounded-lg bg-navy-800/50 px-3 py-2 text-sm">
                      {fragrance.fragranceId} · {fragrance.usagePercent ?? 0}%
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-gold-400 font-serif text-xl mb-3">Additives</h2>
                <div className="space-y-2">
                  {(recipe.additives as Array<{ additiveId?: string; amount?: string }>).map((additive, index) => (
                    <div key={`${additive.additiveId || 'additive'}-${index}`} className="rounded-lg bg-navy-800/50 px-3 py-2 text-sm">
                      {additive.additiveId} {additive.amount ? `· ${additive.amount}` : ''}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {recipe.notes && (
            <section className="mt-8">
              <h2 className="text-gold-400 font-serif text-xl mb-3">Notes</h2>
              <p className="rounded-lg bg-navy-800/50 px-3 py-2 text-sm text-parchment-300">{recipe.notes}</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
