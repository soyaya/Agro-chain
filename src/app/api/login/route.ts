// app/api/login/route.ts  (or Server Action)
import { NextResponse } from "next/server";
import { createSessionToken } from "~/lib/auth-sdk";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Call your shared SDK
  const token = await createSessionToken({ email, role: "buyer" });

  const response = NextResponse.redirect(new URL("/buyers-dashboard", req.url));

  response.cookies.set({
    name: "session",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
