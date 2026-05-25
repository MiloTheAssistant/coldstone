import Link from 'next/link';
import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';

const SOAP_ABACUS_ACCOUNT_URL = '/soap-calculator/account';

export const metadata: Metadata = {
  title: 'Log In | Soap Abacus Studio',
  description: 'Log in to unlock Soap Abacus Studio recipe design, saving, costing, and membership features.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Log In | Soap Abacus Studio',
    description: 'Log in to unlock Soap Abacus Studio recipe design, saving, costing, and membership features.',
    url: 'https://www.soapabacus.com/sign-in',
    siteName: 'Soap Abacus Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Log In | Soap Abacus Studio',
    description: 'Log in to unlock Soap Abacus Studio recipe design, saving, costing, and membership features.',
  },
};

export default function SignInPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="min-h-screen bg-midnight text-parchment-200 flex items-center justify-center px-4 py-16">
      {clerkEnabled ? (
        <SignIn
          fallbackRedirectUrl={SOAP_ABACUS_ACCOUNT_URL}
          signUpUrl="/sign-up"
        />
      ) : (
        <div className="max-w-md rounded-xl border border-navy-600/30 bg-navy-900/70 p-8 text-center">
          <h1 className="font-serif text-3xl text-gold-400">Soap Abacus Account</h1>
          <p className="mt-3 text-sm text-parchment-400">
            Clerk is wired into the app, but account keys have not been configured in this environment yet.
          </p>
          <Link href="/soap-calculator" className="mt-6 inline-block text-sm text-gold-400 hover:text-gold-300">
            Return to Soap Abacus Studio
          </Link>
        </div>
      )}
    </main>
  );
}
