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
  // Neither /login nor /register is ever bounced away for an already-
  // authenticated visitor. The `current_user` cookie only proves *a* session
  // existed — not that it's still valid, and not that it's the account the
  // visitor now intends to use. Auto-redirecting /login to that session's
  // dashboard silently trapped anyone trying to switch accounts (submit
  // different credentials) in their old identity, with no way back to the
  // login form short of finding logout first — see proxy.ts's comment.
  it("does NOT redirect /login away even with a session cookie present, regardless of role", () => {
    for (const user of [
      { role: "farmer" },
      { role: "admin" },
      { role: "farmer", isClusterFarmer: true },
      { role: "cluster" },
      { role: "buyer" },
    ]) {
      const req = makeRequest("/login", encodeUser(user));
      const res = proxy(req);
      expect(res?.status).not.toBe(307);
    }
  });

  it("does NOT redirect /register away even with a session cookie present", () => {
    const req = makeRequest("/register", encodeUser({ role: "buyer" }));
    const res = proxy(req);
    expect(res?.status).not.toBe(307);
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

// ─── checkout auth gate (public marketplace, purchase-gated auth) ────────────

describe("proxy — checkout auth gate", () => {
  it("redirects /marketplace/checkout → /login with a returnTo param when no session", () => {
    const req = makeRequest("/marketplace/checkout");
    const res = proxy(req);
    expect(res?.status).toBe(307);
    const location = res?.headers.get("location") ?? "";
    expect(location).toContain("/login");
    expect(location).toContain(`returnTo=${encodeURIComponent("/marketplace/checkout")}`);
  });

  it("lets an authenticated user through to /marketplace/checkout", () => {
    const req = makeRequest("/marketplace/checkout", encodeUser({ role: "buyer" }));
    const res = proxy(req);
    expect(res?.status).not.toBe(307);
  });

  it("does not gate plain /marketplace browsing for anonymous visitors", () => {
    const req = makeRequest("/marketplace");
    const res = proxy(req);
    expect(res?.status).not.toBe(307);
  });

  it("does not gate /marketplace listing detail pages for anonymous visitors", () => {
    const req = makeRequest("/marketplace/some-listing-id");
    const res = proxy(req);
    expect(res?.status).not.toBe(307);
  });
});
