import { NextResponse } from "next/server";

// === Helpers

const getBaseUrl = () => process.env.BASE_BACKEND_URL?.trim() ?? "";

const buildUrl = (path: string) => {
  const base = getBaseUrl()
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}/api${normalized}` : normalized;
};

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const IS_PROD = process.env.NODE_ENV === "production";

// === GET passthrough - forwards auth cookie to backend and returns response as-is

export async function forwardAuthGet(req: Request, path: string) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        status: "error",
        message: "Backend base URL not configured. Set BASE_BACKEND_URL.",
      },
      { status: 500 },
    );
  }

  const url = buildUrl(path);
  const headers = new Headers();

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const authorization = req.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);

  let response: Response;
  try {
    response = await fetch(url, { method: "GET", headers });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Unable to reach backend service." },
      { status: 502 },
    );
  }

  const responseBody = await response.text();
  const nextResponse = new NextResponse(responseBody, {
    status: response.status,
  });
  const contentType = response.headers.get("content-type");
  if (contentType) nextResponse.headers.set("content-type", contentType);
  return nextResponse;
}

// === Dumb passthrough - used for non-session endpoints (login step 1, register, forgot-password, etc.)

export async function forwardAuthRequest(req: Request, path: string) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        status: "error",
        message: "Backend base URL not configured. Set BASE_BACKEND_URL.",
      },
      { status: 500 },
    );
  }

  const body = await req.text();
  const url = buildUrl(path);

  const headers = new Headers();
  headers.set(
    "Content-Type",
    req.headers.get("content-type") ?? "application/json",
  );

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const authorization = req.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);

  let response: Response;
  try {
    response = await fetch(url, {
      method: req.method,
      headers,
      body: body || undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to reach backend service.",
        details: error instanceof Error ? error.message : "Unknown fetch error",
      },
      { status: 502 },
    );
  }

  const responseBody = await response.text();
  const nextResponse = new NextResponse(responseBody, {
    status: response.status,
  });

  const contentType = response.headers.get("content-type");
  if (contentType) nextResponse.headers.set("content-type", contentType);

  // Forward backend set-cookie headers (e.g. pending_role cookie)
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) nextResponse.headers.set("set-cookie", setCookie);

  return nextResponse;
}

// === Smart session handler - used for OTP verify endpoints that issue tokens
// Extracts access_token + user from the backend response, sets httpOnly cookies,
// and returns the response body without exposing tokens to the browser.

export async function forwardAuthAndSetCookies(req: Request, path: string) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        status: "error",
        message: "Backend base URL not configured. Set BASE_BACKEND_URL.",
      },
      { status: 500 },
    );
  }

  const body = await req.text();
  const url = buildUrl(path);

  const headers = new Headers();
  headers.set(
    "Content-Type",
    req.headers.get("content-type") ?? "application/json",
  );

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  let response: Response;
  try {
    response = await fetch(url, {
      method: req.method,
      headers,
      body: body || undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to reach backend service.",
        details: error instanceof Error ? error.message : "Unknown fetch error",
      },
      { status: 502 },
    );
  }

  const responseBody = await response.text();

  if (!response.ok) {
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
    });
    const contentType = response.headers.get("content-type");
    if (contentType) nextResponse.headers.set("content-type", contentType);
    return nextResponse;
  }

  // Parse the backend response to extract tokens and user
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(responseBody);
  } catch {
    return new NextResponse(responseBody, { status: response.status });
  }

  const data = (parsed.data ?? {}) as Record<string, unknown>;
  const accessToken = data.access_token as string | undefined;
  const user = data.user as Record<string, unknown> | undefined;

  // Build a clean response body - strip tokens so they never reach the browser
  const cleanData: Record<string, unknown> = { ...data };
  delete cleanData.access_token;
  delete cleanData.refresh_token;

  const cleanBody = JSON.stringify({ ...parsed, data: cleanData });
  const nextResponse = new NextResponse(cleanBody, { status: response.status });
  nextResponse.headers.set("content-type", "application/json");

  if (accessToken) {
    // httpOnly - JS cannot read this, sent automatically by browser on every request
    nextResponse.cookies.set("auth_token", accessToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  if (user) {
    // Non-httpOnly - readable by JS for header display and route guarding
    const currentUser = {
      id: user.id,
      role: user.role,
      fullName: user.full_name,
      isClusterFarmer:
        user.is_cluster_farmer === true || user.role === "cluster",
    };
    nextResponse.cookies.set("current_user", JSON.stringify(currentUser), {
      httpOnly: false,
      secure: IS_PROD,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return nextResponse;
}
