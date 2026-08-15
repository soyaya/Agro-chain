import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "~/proxy";

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeRequest(pathname: string, cookieValue?: string): NextRequest {
  const url = `http://localhost${pathname}`;
  const req = new NextRequest(url);
  if (cookieValue) {
    req.cookies.set("current_user", cookieValue);
  }
  return req;
}

function encodeUser(user: object) {
  return encodeURIComponent(JSON.stringify(user));
}

// ─── unauthenticated access ───────────────────────────────────────────────────

describe("proxy — unauthenticated requests", () => {
  const dashboardPaths = [
    "/farmers-dashboard",
    "/farmers-dashboard/listings",
    "/buyers-dashboard",
    "/buyers-dashboard/orders",
    "/cluster-dashboard",
    "/cluster-dashboard/farmers",
    "/admin-dashboard",
    "/admin-dashboard/applications",
  ];

  dashboardPaths.forEach((path) => {
    it(`redirects ${path} → /login when no session cookie`, () => {
      const req = makeRequest(path);
      const res = proxy(req);
      expect(res?.status).toBe(307);
      expect(res?.headers.get("location")).toContain("/login");
    });
  });

  it("lets unauthenticated users access /login", () => {
    const req = makeRequest("/login");
    const res = proxy(req);
    // NextResponse.next() returns null-ish — no redirect
    expect(res?.status).not.toBe(307);
  });

  it("lets unauthenticated users access /register", () => {
    const req = makeRequest("/register");
    const res = proxy(req);
    expect(res?.status).not.toBe(307);
  });
});

// ─── authenticated access to auth pages ──────────────────────────────────────

describe("proxy — authenticated users hitting auth pages", () => {
  it("redirects /login → /farmers-dashboard for a farmer", () => {
    const req = makeRequest("/login", encodeUser({ role: "farmer" }));
    const res = proxy(req);
    expect(res?.status).toBe(307);
    expect(res?.headers.get("location")).toContain("/farmers-dashboard");
  });

  it("redirects /register → /buyers-dashboard for a buyer", () => {
    const req = makeRequest("/register", encodeUser({ role: "buyer" }));
    const res = proxy(req);
    expect(res?.status).toBe(307);
    expect(res?.headers.get("location")).toContain("/buyers-dashboard");
  });

  it("redirects /login → /admin-dashboard for an admin", () => {
    const req = makeRequest("/login", encodeUser({ role: "admin" }));
    const res = proxy(req);
    expect(res?.headers.get("location")).toContain("/admin-dashboard");
  });

  it("redirects /login → /cluster-dashboard for a cluster farmer (isClusterFarmer=true)", () => {
    const req = makeRequest("/login", encodeUser({ role: "farmer", isClusterFarmer: true }));
    const res = proxy(req);
    expect(res?.headers.get("location")).toContain("/cluster-dashboard");
  });

  it("redirects /login → /cluster-dashboard for role='cluster'", () => {
    const req = makeRequest("/login", encodeUser({ role: "cluster" }));
    const res = proxy(req);
    expect(res?.headers.get("location")).toContain("/cluster-dashboard");
  });
});

// ─── authenticated access to dashboards ──────────────────────────────────────

describe("proxy — authenticated users accessing their dashboards", () => {
  it("allows a farmer to access /farmers-dashboard", () => {
    const req = makeRequest(
      "/farmers-dashboard",
      encodeUser({ role: "farmer" }),
    );
    const res = proxy(req);
    // Should call NextResponse.next() — no redirect status
    expect(res?.status).not.toBe(307);
  });

  it("allows a buyer to access /buyers-dashboard/orders", () => {
    const req = makeRequest(
      "/buyers-dashboard/orders",
      encodeUser({ role: "buyer" }),
    );
    const res = proxy(req);
    expect(res?.status).not.toBe(307);
  });
});

// ─── getDashboardFromCookie edge cases ───────────────────────────────────────

describe("proxy — getDashboardFromCookie edge cases", () => {
  it("falls back to /buyers-dashboard when cookie is malformed JSON", () => {
    const req = makeRequest("/login");
    req.cookies.set("current_user", "not-valid-json");
    const res = proxy(req);
    expect(res?.headers.get("location")).toContain("/buyers-dashboard");
  });

  it("falls back to /buyers-dashboard when cookie has no recognised role", () => {
    const req = makeRequest("/login", encodeUser({ role: "unknown" }));
    const res = proxy(req);
    expect(res?.headers.get("location")).toContain("/buyers-dashboard");
  });
});
