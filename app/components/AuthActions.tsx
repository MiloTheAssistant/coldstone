'use client';

import Link from 'next/link';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

export default function AuthActions({ scrolled = true }: { scrolled?: boolean }) {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const linkClass = `text-[10px] lg:text-[11px] tracking-[0.16em] lg:tracking-[0.2em] transition-colors duration-300 whitespace-nowrap ${
    scrolled ? 'text-parchment-400 hover:text-parchment-100' : 'text-parchment-200 hover:text-parchment-100'
  }`;

  if (!clerkEnabled) {
    return (
      <Link href="/sign-in" className={linkClass}>
        ACCOUNT
      </Link>
    );
  }

  return <ClerkAccountControls linkClass={linkClass} />;
}

function ClerkAccountControls({ linkClass }: { linkClass: string }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <span className={linkClass}>ACCOUNT</span>;
  if (isSignedIn) return <UserButton />;

  return (
    <SignInButton mode="modal">
      <button className={linkClass}>ACCOUNT</button>
    </SignInButton>
  );
}
