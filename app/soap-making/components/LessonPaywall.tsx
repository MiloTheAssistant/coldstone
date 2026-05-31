import Link from 'next/link';
import Header from '../../components/Header';
import SiteFooter from '../../components/SiteFooter';
import type { LessonLibraryAccessReason } from '../../lib/lesson-library-access';
import { SOAP_ABACUS_PRICING } from '../../soap-calculator/studio/membership-model';

interface LessonPaywallProps {
  reason: LessonLibraryAccessReason;
  requestedPath: string;
}

export default function LessonPaywall({ reason, requestedPath }: LessonPaywallProps) {
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(requestedPath)}`;
  const message = reason === 'signed_out'
    ? 'Sign in with an active Pro subscription to open the full Lesson Library.'
    : reason === 'membership_unavailable'
      ? 'Membership verification is required before lesson access can be opened.'
      : 'The full Lesson Library is reserved for active Pro subscribers.';

  return (
    <div className="min-h-screen overflow-x-hidden bg-midnight">
      <Header />
      <main className="px-5 pb-16 pt-32 sm:px-6 md:pb-24 md:pt-40">
        <section className="mx-auto max-w-4xl border border-gold-500/25 bg-navy-900/80 p-6 sm:p-8 md:p-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold-400">Pro Lesson Access</p>
          <h1 className="mt-4 font-serif text-3xl leading-tight text-parchment-100 sm:text-5xl">
            Unlock the full Coldstone Lesson Library.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-parchment-300 md:text-base">{message}</p>

          <div className="mt-8 grid gap-4 border border-gold-500/15 bg-midnight/65 p-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold-400">Required Tier</p>
              <p className="mt-2 font-serif text-2xl text-parchment-100">Pro</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold-400">Subscription</p>
              <p className="mt-2 text-sm leading-6 text-parchment-300">
                {SOAP_ABACUS_PRICING.pro.monthly.label} monthly or {SOAP_ABACUS_PRICING.pro.annual.label} annual.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {reason === 'signed_out' ? (
              <Link
                href={signInHref}
                className="border border-crimson-600 bg-crimson-600/20 px-6 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-parchment-100 hover:bg-crimson-600"
              >
                Sign In
              </Link>
            ) : null}
            <Link
              href="/soap-calculator/account"
              className="border border-gold-500/40 px-6 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-gold-300 hover:bg-gold-500/10"
            >
              View Pro Subscription
            </Link>
            <Link
              href="/soap-making"
              className="border border-gold-500/20 px-6 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-parchment-300 hover:bg-gold-500/10"
            >
              Back to Library
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
