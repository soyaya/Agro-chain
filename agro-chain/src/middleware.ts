// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get("currentUser")?.value;

  // Protect dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!currentUser) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    try {
      const user = JSON.parse(currentUser);
      if (!user?.email) throw new Error();
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Optional: redirect authenticated users away from auth pages
  if (
    currentUser &&
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register") ||
      request.nextUrl.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/verify-otp", "/verify-identity", "/"],
};