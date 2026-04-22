import { NextResponse } from "next/server";

const getBaseUrl = () => process.env.NEXT_PUBLIC_BASE_BACKEND_URL?.trim() ?? "";

const buildUrl = (path: string) => {
  const base = getBaseUrl().replace(/\/+$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
};

export async function forwardAuthRequest(req: Request, path: string) {
  const body = await req.text();
  const url = buildUrl(path);

  const headers = new Headers();
  headers.set("Content-Type", req.headers.get("content-type") ?? "application/json");

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const authorization = req.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);

  const response = await fetch(url, {
    method: req.method,
    headers,
    body: body || undefined,
  });

  const responseBody = await response.text();
  const nextResponse = new NextResponse(responseBody, {
    status: response.status,
  });

  const contentType = response.headers.get("content-type");
  if (contentType) {
    nextResponse.headers.set("content-type", contentType);
  }

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    nextResponse.headers.set("set-cookie", setCookie);
  }

  return nextResponse;
}
