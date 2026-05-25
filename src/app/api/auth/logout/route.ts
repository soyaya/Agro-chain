import { NextResponse } from "next/server";
import { forwardAuthRequest } from "../_utils";

export async function POST(req: Request) {
  // Forward the logout to the backend
  const backendResponse = await forwardAuthRequest(req, "/auth/logout");

  // Clear auth cookies on the Next.js origin regardless of backend response
  const response = new NextResponse(await backendResponse.text(), {
    status: backendResponse.status,
  });

  response.headers.set(
    "content-type",
    backendResponse.headers.get("content-type") ?? "application/json",
  );

  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  // Clear old access_token cookie (set by backend in earlier sessions before proxy was added)
  response.cookies.set("access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("current_user", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
