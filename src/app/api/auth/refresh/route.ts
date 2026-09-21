import { NextResponse } from "next/server";

const getBaseUrl = () => process.env.BASE_BACKEND_URL?.trim() ?? "";

const buildUrl = (path: string) => {
  const base = getBaseUrl().replace(/\/+$/, "").replace(/\/api$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}/api${normalized}` : normalized;
};

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
const IS_PROD = process.env.NODE_ENV === "production";

// Proxy /auth/refresh server-side so the httpOnly auth_token + refresh_token
// cookies (set on the Next.js origin by forwardAuthAndSetCookies) are actually
// forwarded to the backend. A client-side fetch to the Render backend URL
// directly never carries those cookies — they're scoped to this origin.
// On success, rotate both cookies with the new tokens the backend returns.
export async function POST(req: Request) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { status: "error", message: "Backend base URL not configured." },
      { status: 500 },
    );
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  // Forward the incoming cookies (auth_token, refresh_token) to the backend
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  let response: Response;
  try {
    response = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Unable to reach backend service." },
      { status: 502 },
    );
  }

  const responseBody = await response.text();

  if (!response.ok) {
    // Refresh failed — clear stale cookies so the client knows to re-login
    const errResponse = new NextResponse(responseBody, { status: response.status });
    errResponse.headers.set("content-type", "application/json");
    errResponse.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
    errResponse.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
    errResponse.cookies.set("current_user", "", { maxAge: 0, path: "/" });
    return errResponse;
  }

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(responseBody);
  } catch {
    return new NextResponse(responseBody, { status: response.status });
  }

  const data = (parsed.data ?? {}) as Record<string, unknown>;
  const accessToken = data.access_token as string | undefined;
  const refreshToken = data.refresh_token as string | undefined;

  // Strip tokens from the response body — never expose them to the browser
  const cleanData = { ...data };
  delete cleanData.access_token;
  delete cleanData.refresh_token;

  const nextResponse = new NextResponse(
    JSON.stringify({ ...parsed, data: cleanData }),
    { status: response.status },
  );
  nextResponse.headers.set("content-type", "application/json");

  if (accessToken) {
    nextResponse.cookies.set("auth_token", accessToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  if (refreshToken) {
    nextResponse.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return nextResponse;
}
