import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { forwardAuthRequest, forwardAuthAndSetCookies } from "~/app/api/auth/_utils";

// ─── helpers ────────────────────────────────────────────────────────────────

function makeRequest(
  body: string,
  method = "POST",
  extra: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/auth/test", {
    method,
    body,
    headers: { "Content-Type": "application/json", ...extra },
  });
}

function mockFetch(response: Response) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response));
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

// ─── forwardAuthRequest ──────────────────────────────────────────────────────

describe("forwardAuthRequest", () => {
  const savedEnv = process.env.BASE_BACKEND_URL;

  beforeEach(() => {
    process.env.BASE_BACKEND_URL = "http://backend:5005";
  });

  afterEach(() => {
    process.env.BASE_BACKEND_URL = savedEnv;
    vi.unstubAllGlobals();
  });

  it("returns 500 when BASE_BACKEND_URL is not configured", async () => {
    process.env.BASE_BACKEND_URL = "";
    const req = makeRequest('{"email":"a@b.com"}');
    const res = await forwardAuthRequest(req, "/auth/login");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toMatch(/BASE_BACKEND_URL/);
  });

  it("forwards the request body and method to the backend", async () => {
    const backendResp = jsonResponse({ status: "ok" });
    const fetchSpy = vi.fn().mockResolvedValueOnce(backendResp);
    vi.stubGlobal("fetch", fetchSpy);

    const req = makeRequest('{"email":"a@b.com"}', "POST");
    await forwardAuthRequest(req, "/auth/login");

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe("http://backend:5005/api/auth/login");
    expect(options.method).toBe("POST");
    expect(options.body).toBe('{"email":"a@b.com"}');
  });

  it("forwards cookies from the incoming request", async () => {
    mockFetch(jsonResponse({ ok: true }));
    const req = makeRequest("{}", "POST", { cookie: "session=abc" });
    await forwardAuthRequest(req, "/auth/login");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect((options!.headers as Headers).get("cookie")).toBe("session=abc");
  });

  it("forwards set-cookie from backend response", async () => {
    const backendResp = jsonResponse({ ok: true }, 200, {
      "set-cookie": "pending_role=farmer; Path=/",
    });
    mockFetch(backendResp);

    const req = makeRequest("{}");
    const res = await forwardAuthRequest(req, "/auth/register");
    expect(res.headers.get("set-cookie")).toBe("pending_role=farmer; Path=/");
  });

  it("returns 502 when backend is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("ECONNREFUSED")));
    const req = makeRequest("{}");
    const res = await forwardAuthRequest(req, "/auth/login");
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.message).toMatch(/Unable to reach backend/);
  });

  it("preserves the backend status code", async () => {
    mockFetch(jsonResponse({ message: "Not Found" }, 404));
    const req = makeRequest("{}");
    const res = await forwardAuthRequest(req, "/auth/unknown");
    expect(res.status).toBe(404);
  });
});

// ─── forwardAuthAndSetCookies ─────────────────────────────────────────────────

describe("forwardAuthAndSetCookies", () => {
  const savedEnv = process.env.BASE_BACKEND_URL;

  beforeEach(() => {
    process.env.BASE_BACKEND_URL = "http://backend:5005";
  });

  afterEach(() => {
    process.env.BASE_BACKEND_URL = savedEnv;
    vi.unstubAllGlobals();
  });

  const successBackendBody = {
    status: "success",
    data: {
      access_token: "tok_abc123",
      refresh_token: "ref_xyz",
      user: {
        id: "u1",
        role: "farmer",
        is_cluster_farmer: false,
        full_name: "Ada Farmer",
      },
    },
  };

  it("returns 500 when BASE_BACKEND_URL is not configured", async () => {
    process.env.BASE_BACKEND_URL = "";
    const req = makeRequest("{}");
    const res = await forwardAuthAndSetCookies(req, "/auth/verify");
    expect(res.status).toBe(500);
  });

  it("strips access_token and refresh_token from the response body", async () => {
    mockFetch(jsonResponse(successBackendBody));
    const req = makeRequest('{"otp":"123456"}');
    const res = await forwardAuthAndSetCookies(req, "/auth/login/otp");
    const body = await res.json();
    expect(body.data.access_token).toBeUndefined();
    expect(body.data.refresh_token).toBeUndefined();
  });

  it("sets auth_token as httpOnly cookie", async () => {
    mockFetch(jsonResponse(successBackendBody));
    const req = makeRequest("{}");
    const res = await forwardAuthAndSetCookies(req, "/auth/login/otp");

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("auth_token=tok_abc123");
    expect(setCookie).toContain("HttpOnly");
  });

  it("sets current_user as a non-httpOnly cookie with role info", async () => {
    mockFetch(jsonResponse(successBackendBody));
    const req = makeRequest("{}");
    const res = await forwardAuthAndSetCookies(req, "/auth/login/otp");

    // Next.js serialises multiple cookies — find the current_user one
    const allSetCookies = res.headers.getSetCookie?.() ?? [res.headers.get("set-cookie") ?? ""];
    const userCookie = allSetCookies.find((c) => c.includes("current_user"));
    expect(userCookie).toBeDefined();
    expect(userCookie).not.toContain("HttpOnly");

    const match = userCookie!.match(/current_user=([^;]+)/);
    expect(match).not.toBeNull();
    const userData = JSON.parse(decodeURIComponent(match![1]));
    expect(userData.role).toBe("farmer");
    expect(userData.isClusterFarmer).toBe(false);
  });

  it("marks isClusterFarmer=true when user.role === 'cluster'", async () => {
    const clusterBody = {
      ...successBackendBody,
      data: { ...successBackendBody.data, user: { ...successBackendBody.data.user, role: "cluster" } },
    };
    mockFetch(jsonResponse(clusterBody));
    const req = makeRequest("{}");
    const res = await forwardAuthAndSetCookies(req, "/auth/login/otp");

    const allSetCookies = res.headers.getSetCookie?.() ?? [res.headers.get("set-cookie") ?? ""];
    const userCookie = allSetCookies.find((c) => c.includes("current_user"))!;
    const match = userCookie.match(/current_user=([^;]+)/);
    const userData = JSON.parse(decodeURIComponent(match![1]));
    expect(userData.isClusterFarmer).toBe(true);
  });

  it("marks isClusterFarmer=true when is_cluster_farmer flag is true", async () => {
    const clusterBody = {
      ...successBackendBody,
      data: {
        ...successBackendBody.data,
        user: { ...successBackendBody.data.user, is_cluster_farmer: true },
      },
    };
    mockFetch(jsonResponse(clusterBody));
    const req = makeRequest("{}");
    const res = await forwardAuthAndSetCookies(req, "/auth/login/otp");

    const allSetCookies = res.headers.getSetCookie?.() ?? [res.headers.get("set-cookie") ?? ""];
    const userCookie = allSetCookies.find((c) => c.includes("current_user"))!;
    const match = userCookie.match(/current_user=([^;]+)/);
    const userData = JSON.parse(decodeURIComponent(match![1]));
    expect(userData.isClusterFarmer).toBe(true);
  });

  it("passes backend error responses through without setting cookies", async () => {
    mockFetch(jsonResponse({ message: "Invalid OTP" }, 400));
    const req = makeRequest('{"otp":"000000"}');
    const res = await forwardAuthAndSetCookies(req, "/auth/login/otp");
    expect(res.status).toBe(400);
    const allSetCookies = res.headers.getSetCookie?.() ?? [];
    const authCookie = allSetCookies.find((c) => c.startsWith("auth_token"));
    expect(authCookie).toBeUndefined();
  });

  it("returns 502 when backend is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("ECONNREFUSED")));
    const req = makeRequest("{}");
    const res = await forwardAuthAndSetCookies(req, "/auth/login/otp");
    expect(res.status).toBe(502);
  });

  it("preserves other data fields in the cleaned response body", async () => {
    mockFetch(jsonResponse(successBackendBody));
    const req = makeRequest("{}");
    const res = await forwardAuthAndSetCookies(req, "/auth/login/otp");
    const body = await res.json();
    expect(body.status).toBe("success");
    expect(body.data.user).toBeDefined();
    expect(body.data.user.role).toBe("farmer");
  });
});
