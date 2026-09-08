import { NextRequest, NextResponse } from "next/server";

function getDashboardFromCookie(request: NextRequest): string {
  try {
    const raw = request.cookies.get("current_user")?.value;
    if (!raw) return "/buyers-dashboard";
    const user = JSON.parse(decodeURIComponent(raw)) as {
      role?: string;
      isClusterFarmer?: boolean;
    };
    if (user.isClusterFarmer || user.role === "cluster") return "/cluster-dashboard";
    if (user.role === "farmer") return "/farmers-dashboard";
    if (user.role === "rider") return "/rider-dashboard";
    return "/buyers-dashboard";
  } catch {
    return "/buyers-dashboard";
  }
}

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

  // Login-only: a direct hit on /register is deliberately NOT bounced here even
  // when hasSession is true. The `current_user` cookie only proves a session
  // *existed*, not that it's still valid server-side (e.g. the account was
  // deleted, or the session was revoked elsewhere) — auth-context.tsx clears
  // this cookie on the first 401 it sees, but that check runs client-side,
  // after this middleware has already decided whether to serve the page. A
  // stale cookie bouncing /login away is a minor inconvenience (the user
  // lands on their dashboard, which self-corrects to /login via auth-context);
  // bouncing /register away is worse — a multi-step OTP flow gets abandoned
  // entirely with no way back in until the cookie clears itself.
  if (hasSession && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL(getDashboardFromCookie(request), request.url));
  }

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
