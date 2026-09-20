import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get("current_user")?.value);
  const pathname = request.nextUrl.pathname;

  const isDashboardRoute =
    pathname.startsWith("/farmers-dashboard") ||
    pathname.startsWith("/buyers-dashboard") ||
    pathname.startsWith("/cluster-dashboard") ||
    pathname.startsWith("/rider-dashboard");

  if (isDashboardRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/marketplace/checkout") && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /login is deliberately NEVER bounced away for an already-authenticated
  // visitor, matching /register. The `current_user` cookie only proves *a*
  // session existed — not that it's still valid, and not that it's the
  // account the visitor now intends to use. Auto-redirecting to that
  // session's dashboard silently traps anyone trying to switch accounts
  // (submit different credentials on /login) in their old identity, with no
  // way back to the login form short of finding logout first. Letting /login
  // always render costs an already-logged-in visitor nothing — submitting
  // credentials there just re-authenticates them, correctly, as whoever they
  // typed in.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/farmers-dashboard/:path*",
    "/buyers-dashboard/:path*",
    "/cluster-dashboard/:path*",
    "/rider-dashboard/:path*",
    "/login",
    "/register",
    "/marketplace/checkout",
  ],
};
