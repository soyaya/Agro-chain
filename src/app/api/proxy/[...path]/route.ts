import { NextRequest, NextResponse } from "next/server";

// Catch-all proxy: every apiFetch call from the browser hits /api/proxy/*
// here instead of the Render backend directly. Running server-side inside
// Next.js means the httpOnly cookies (auth_token, refresh_token) that are
// scoped to this origin are forwarded to the backend with every request —
// something a cross-origin browser fetch can never do.

const getBackendBase = () =>
  (process.env.BASE_BACKEND_URL ?? "").trim().replace(/\/+$/, "").replace(/\/api$/, "");

// Methods Next.js App Router supports in route handlers
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params);
}

async function proxyRequest(
  req: NextRequest,
  params: { path: string[] },
): Promise<NextResponse> {
  const base = getBackendBase();
  if (!base) {
    return NextResponse.json(
      { status: "error", message: "BASE_BACKEND_URL is not configured." },
      { status: 500 },
    );
  }

  // Reconstruct the backend path: /api/proxy/farmers/listings/get
  //   → params.path = ["farmers", "listings", "get"]
  //   → backend URL  = https://agro-chain2.onrender.com/api/farmers/listings/get
  const backendPath = "/" + params.path.join("/");

  // Preserve query string
  const search = req.nextUrl.search ?? "";
  const backendUrl = `${base}/api${backendPath}${search}`;

  // Forward headers the backend cares about
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const authorization = req.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);

  // Forward all cookies — this is the whole point of this proxy.
  // The httpOnly auth_token/refresh_token cookies are scoped to this
  // Next.js origin and will never be sent by a browser in a cross-origin
  // fetch to Render. Here, running server-side, we just forward them.
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  // Read body for mutating methods
  let body: BodyInit | undefined;
  const method = req.method.toUpperCase();
  if (!["GET", "HEAD", "DELETE"].includes(method)) {
    body = await req.text();
    if (body === "") body = undefined;
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(backendUrl, { method, headers, body });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: "Unable to reach backend service." },
      { status: 502 },
    );
  }

  // Stream the response back — preserve status, content-type, and any
  // set-cookie headers the backend emits (e.g. cookie rotation on refresh).
  const resBody = await backendRes.arrayBuffer();
  const response = new NextResponse(resBody, { status: backendRes.status });

  const resContentType = backendRes.headers.get("content-type");
  if (resContentType) response.headers.set("content-type", resContentType);

  // Forward set-cookie from backend so token rotation still works
  backendRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      response.headers.append("set-cookie", value);
    }
  });

  return response;
}
