import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  if (!isAdminRoute) return;

  // A session past its absolute sign-in deadline counts as logged out, so the
  // "stay signed in for 14 days" choice (vs. the short default) is enforced
  // here rather than only by the cookie's own lifetime.
  const absExp = req.auth?.absExp;
  const expired = typeof absExp === 'number' && Date.now() > absExp;

  if (!req.auth || expired) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ['/admin/:path*'],
};
