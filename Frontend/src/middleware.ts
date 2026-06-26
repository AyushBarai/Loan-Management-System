import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// LEARN: Next.js middleware runs on the EDGE (before React renders).
// It can redirect users before the page loads — perfect for auth guards.
// Note: It can't access localStorage (browser-only). We use cookies instead.
// The token gets stored in a cookie (set by client JS) for middleware to read.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('lms_token')?.value;

  const publicPaths = ['/', '/login', '/register', '/auth/login', '/auth/register'];
  const isPublic = publicPaths.some((p) => pathname === p);

  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/auth/register', request.url));
  }

  // Not logged in → redirect to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Logged in → don't let them see auth pages
  if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/borrower', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};