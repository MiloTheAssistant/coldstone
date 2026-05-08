import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import {
  defaultFreeMembership,
  getCurrentSoapAbacusMembership,
} from '@/app/lib/soap-abacus-membership';
import { SOAP_ABACUS_PRICING, getFeatureListForTier } from '@/app/soap-calculator/studio/membership-model';

export const dynamic = 'force-dynamic';

export default async function SoapAbacusAccountPage() {
  const user = await currentUser();
  const setup = await getCurrentSoapAbacusMembership();
  const membership = setup.ok ? setup.membership : defaultFreeMembership(user?.id || '');

  return (
    <main className="min-h-screen bg-midnight text-parchment-200">
      <section className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/soap-calculator" className="text-sm text-gold-400 hover:text-gold-300">
            &larr; Soap Abacus Studio
          </Link>
          <span className="rounded-full border border-gold-500/20 px-3 py-1 text-[10px] uppercase tracking-wider text-gold-400">
            {membership.effectiveTier} · {membership.status}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <section className="rounded-xl border border-navy-600/30 bg-navy-900/70 p-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-gold-500/70">Membership</p>
            <h1 className="mt-2 font-serif text-4xl text-gold-300">Soap Abacus Account</h1>
            <p className="mt-3 text-sm text-parchment-400">
              {user?.primaryEmailAddress?.emailAddress || 'Signed-in account'}
            </p>
            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <AccountDatum label="Tier" value={membership.effectiveTier.toUpperCase()} />
              <AccountDatum label="Status" value={membership.status} />
              <AccountDatum label="Trial Ends" value={membership.trialEndsAt ? new Date(membership.trialEndsAt).toLocaleDateString() : 'None'} />
              <AccountDatum label="Stripe Customer" value={membership.stripeCustomerId ? 'Connected' : 'Not connected'} />
            </dl>
          </section>

          <section className="rounded-xl border border-navy-600/30 bg-navy-900/70 p-6">
            <h2 className="font-serif text-2xl text-gold-300">Studio Checklist</h2>
            <ul className="mt-4 space-y-2 text-sm text-parchment-400">
              <li>Confirm your Recipe Designer defaults.</li>
              <li>Add supplier costs in Ingredients DB.</li>
              <li>Save important formulas to Recipe Cache.</li>
              <li>Use Recipe Workbench notes for batch and cure tracking.</li>
              <li>Export PDFs after upgrading to Pro.</li>
            </ul>
          </section>
        </div>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['free', 'plus', 'pro'] as const).map(tier => (
            <div key={tier} className="rounded-xl border border-navy-600/30 bg-navy-900/60 p-5">
              <h2 className="font-serif text-xl text-gold-400">{tier.toUpperCase()}</h2>
              {tier === 'free' ? (
                <p className="mt-2 text-2xl font-semibold text-parchment-100">$0</p>
              ) : (
                <>
                  <p className="mt-2 text-2xl font-semibold text-parchment-100">{SOAP_ABACUS_PRICING[tier].monthly.label}</p>
                  <p className="mt-1 text-xs text-parchment-500">
                    {SOAP_ABACUS_PRICING[tier].annual.label} annual · {SOAP_ABACUS_PRICING[tier].annual.savings}
                  </p>
                </>
              )}
              <ul className="mt-4 space-y-2 text-sm text-parchment-400">
                {getFeatureListForTier(tier).map((feature: string) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}

function AccountDatum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-navy-800/60 p-3">
      <dt className="text-[10px] uppercase tracking-wider text-parchment-500">{label}</dt>
      <dd className="mt-1 text-parchment-200">{value}</dd>
    </div>
  );
}
