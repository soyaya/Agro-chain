import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Import your shared auth SDK
import { verifyToken } from '~/lib/auth-sdk';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes – allow
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.next();
  }

  const isDashboardRoute =
    pathname.startsWith('/farmers-dashboard') ||
    pathname.startsWith('/buyers-dashboard') ||
    pathname.startsWith('/cluster-dashboard') ||
    pathname.startsWith('/admin-dashboard');

  if (isDashboardRoute) {
    const sessionToken = request.cookies.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Use your shared SDK
      const session = await verifyToken(sessionToken); // throws or returns null if invalid/expired

      if (!session) {
        const res = NextResponse.redirect(new URL('/login', request.url));
        res.cookies.delete('session');
        return res;
      }

      // Session valid – continue
      return NextResponse.next();
    } catch (err) {
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('session');
      return res;
    }
  }

  return NextResponse.next();
}

// Run only on protected routes (avoids unnecessary calls)
export const config = {
  matcher: [
    '/farmers-dashboard/:path*',
    '/buyers-dashboard/:path*',
    '/cluster-dashboard/:path*',
    '/admin-dashboard/:path*',
  ],
};
