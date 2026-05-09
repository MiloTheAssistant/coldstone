export function isClerkConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

export async function getCurrentUserId() {
  if (!isClerkConfigured()) return null;

  const { auth } = await import('@clerk/nextjs/server');
  const { userId } = await auth();
  return userId;
}
