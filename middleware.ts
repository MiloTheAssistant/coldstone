import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COLDSTONE_URL = 'https://www.coldstonesoap.com';
const SOAP_ABACUS_URL = 'https://www.soapabacus.com';

const COLDSTONE_HOSTS = new Set(['coldstonesoap.com', 'www.coldstonesoap.com']);
const SOAP_ABACUS_HOSTS = new Set(['soapabacus.com', 'www.soapabacus.com']);
const SOAP_ABACUS_ALLOWED_PREFIXES = [
  '/soap-calculator',
  '/api',
  '/recipes',
  '/sign-in',
  '/sign-up',
];

function getHost(request: NextRequest) {
  return (request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host)
    .split(':')[0]
    .toLowerCase();
}

function isSoapAbacusRoute(pathname: string) {
  return SOAP_ABACUS_ALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function routeByDomain(request: NextRequest) {
  const host = getHost(request);
  const { pathname, search } = request.nextUrl;

  if (COLDSTONE_HOSTS.has(host) && pathname.startsWith('/soap-calculator')) {
    const soapAbacusUrl = new URL(SOAP_ABACUS_URL);
    soapAbacusUrl.search = search;
    return NextResponse.redirect(soapAbacusUrl);
  }

  if (!SOAP_ABACUS_HOSTS.has(host)) return undefined;

  if (pathname === '/') {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = '/soap-calculator';
    return NextResponse.rewrite(rewriteUrl);
  }

  if (isSoapAbacusRoute(pathname)) return undefined;

  const coldstoneUrl = new URL(pathname + search, COLDSTONE_URL);
  return NextResponse.redirect(coldstoneUrl);
}

export default clerkMiddleware((_auth, request) => routeByDomain(request));

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
