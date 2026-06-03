import { NextRequest, NextResponse } from "next/server";

function getDashboardFromCookie(request: NextRequest): string {
  try {
    const raw = request.cookies.get("current_user")?.value;
    if (!raw) return "/buyers-dashboard";
    const user = JSON.parse(decodeURIComponent(raw)) as {
      role?: string;
      isClusterFarmer?: boolean;
    };
    if (user.role === "admin") return "/admin-dashboard";
    if (user.isClusterFarmer || user.role === "cluster") return "/cluster-dashboard";
    if (user.role === "farmer") return "/farmers-dashboard";
    return "/buyers-dashboard";
  } catch {
    return "/buyers-dashboard";
  }
}

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get("current_user")?.value);
  const pathname = request.nextUrl.pathname;

  const isDashboardRoute =
    pathname.startsWith("/farmers-dashboard") ||
    pathname.startsWith("/buyers-dashboard") ||
    pathname.startsWith("/cluster-dashboard") ||
    pathname.startsWith("/admin-dashboard");

  if (isDashboardRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isDashboardRoute && hasSession) {
    const correctDashboard = getDashboardFromCookie(request);
    if (!pathname.startsWith(correctDashboard)) {
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }
  }

  if (
    hasSession &&
    (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname === "/")
  ) {
    return NextResponse.redirect(new URL(getDashboardFromCookie(request), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/farmers-dashboard/:path*",
    "/buyers-dashboard/:path*",
    "/cluster-dashboard/:path*",
    "/admin-dashboard/:path*",
    "/login",
    "/register",
    "/",
  ],
};
