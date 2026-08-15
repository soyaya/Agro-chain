import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiError, apiFetch } from "~/lib/api";

// ─── buildApiUrl ────────────────────────────────────────────────────────────

describe("buildApiUrl", () => {
  it("prepends /api to the path when BASE_BACKEND_URL is set", async () => {
    vi.resetModules();
    process.env.BASE_BACKEND_URL = "http://localhost:5005";
    const { buildApiUrl: freshBuild } = await import("~/lib/api");
    expect(freshBuild("/users")).toBe("http://localhost:5005/api/users");
    vi.resetModules();
    delete process.env.BASE_BACKEND_URL;
  });

  it("normalises a path that does not start with a slash", async () => {
    vi.resetModules();
    process.env.BASE_BACKEND_URL = "http://localhost:5005";
    const { buildApiUrl: freshBuild } = await import("~/lib/api");
    expect(freshBuild("users")).toBe("http://localhost:5005/api/users");
    vi.resetModules();
    delete process.env.BASE_BACKEND_URL;
  });

  it("strips a trailing slash from the base URL", async () => {
    vi.resetModules();
    process.env.BASE_BACKEND_URL = "http://localhost:5005/";
    const { buildApiUrl: freshBuild } = await import("~/lib/api");
    const url = freshBuild("/auth/me");
    expect(url).not.toMatch(/\/\/api/);
    expect(url).toBe("http://localhost:5005/api/auth/me");
    vi.resetModules();
    delete process.env.BASE_BACKEND_URL;
  });

  it("strips a trailing /api from the base URL before appending", async () => {
    vi.resetModules();
    process.env.BASE_BACKEND_URL = "http://localhost:5005/api";
    const { buildApiUrl: freshBuild } = await import("~/lib/api");
    expect(freshBuild("/users")).toBe("http://localhost:5005/api/users");
    vi.resetModules();
    delete process.env.BASE_BACKEND_URL;
  });

  it("returns the normalised path when no base is configured", async () => {
    vi.resetModules();
    delete process.env.BASE_BACKEND_URL;
    delete process.env.NEXT_PUBLIC_BASE_BACKEND_URL;
    const { buildApiUrl: freshBuild } = await import("~/lib/api");
    const url = freshBuild("/health");
    expect(url).toBe("/health");
    vi.resetModules();
  });
});

// ─── ApiError ───────────────────────────────────────────────────────────────

describe("ApiError", () => {
  it("is an instance of Error", () => {
    const err = new ApiError("something failed", 404);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it("stores the status code", () => {
    const err = new ApiError("not found", 404);
    expect(err.status).toBe(404);
    expect(err.message).toBe("not found");
    expect(err.name).toBe("ApiError");
  });

  it("status is optional", () => {
    const err = new ApiError("generic error");
    expect(err.status).toBeUndefined();
  });
});

// ─── apiFetch ───────────────────────────────────────────────────────────────

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const makeJsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  const makeTextResponse = (body: string, status = 200) =>
    new Response(body, { status });

  it("returns parsed JSON on a 2xx response", async () => {
    const payload = { data: { id: "1" } };
    vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse(payload));

    const result = await apiFetch<typeof payload>("/items");
    expect(result).toEqual(payload);
  });

  it("sets Content-Type: application/json by default", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse({}));
    await apiFetch("/items");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("does NOT override Content-Type when caller provides one", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse({}));
    await apiFetch("/items", {
      headers: { "Content-Type": "text/plain" },
    });

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(headers.get("Content-Type")).toBe("text/plain");
  });

  it("does NOT set Content-Type when body is FormData", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse({}));
    const form = new FormData();
    form.append("file", "data");
    await apiFetch("/upload", { method: "POST", body: form });

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("always sends credentials: include", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse({}));
    await apiFetch("/me");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options?.credentials).toBe("include");
  });

  it("throws ApiError with status 0 on network failure", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(apiFetch("/me")).rejects.toMatchObject({
      name: "ApiError",
      status: 0,
      message: expect.stringContaining("Unable to reach the server"),
    });
  });

  it("throws ApiError with HTTP status on non-2xx response (JSON message)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeJsonResponse({ message: "Unauthorized" }, 401),
    );

    await expect(apiFetch("/me")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Unauthorized",
    });
  });

  it("throws ApiError using error field when message is absent", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeJsonResponse({ error: "Forbidden" }, 403),
    );

    await expect(apiFetch("/me")).rejects.toMatchObject({
      status: 403,
      message: "Forbidden",
    });
  });

  it("throws ApiError with statusText when body has no message field", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("", { status: 500, statusText: "Internal Server Error" }),
    );

    await expect(apiFetch("/me")).rejects.toMatchObject({
      status: 500,
      message: "Internal Server Error",
    });
  });

  it("throws ApiError with plain text body on non-2xx text response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeTextResponse("Bad Request", 400),
    );

    await expect(apiFetch("/me")).rejects.toMatchObject({
      status: 400,
      message: "Bad Request",
    });
  });

  it("returns text string on 2xx non-JSON response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeTextResponse("OK"));

    const result = await apiFetch<string>("/health");
    expect(result).toBe("OK");
  });
});
