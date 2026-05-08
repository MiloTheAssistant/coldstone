import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="min-h-screen bg-midnight text-parchment-200 flex items-center justify-center px-4 py-16">
      {clerkEnabled ? (
        <SignIn />
      ) : (
        <div className="max-w-md rounded-xl border border-navy-600/30 bg-navy-900/70 p-8 text-center">
          <h1 className="font-serif text-3xl text-gold-400">Recipe Vault Accounts</h1>
          <p className="mt-3 text-sm text-parchment-400">
            Clerk is wired into the app, but account keys have not been configured in this environment yet.
          </p>
          <Link href="/soap-calculator" className="mt-6 inline-block text-sm text-gold-400 hover:text-gold-300">
            Return to Soap Calculator
          </Link>
        </div>
      )}
    </main>
  );
}
