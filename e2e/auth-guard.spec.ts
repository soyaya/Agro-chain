import { test, expect } from "@playwright/test";

// Covers src/proxy.ts's redirect gate directly — no backend/login involved,
// just the presence (or absence) of the JS-readable `current_user` cookie.
// Uses a fresh, storageState-free context per test, matching an anonymous visitor.

test.describe("auth guard (proxy.ts)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const dashboardRoutes = [
    "/buyers-dashboard",
    "/farmers-dashboard",
    "/cluster-dashboard",
    "/rider-dashboard",
  ];

  for (const route of dashboardRoutes) {
    test(`redirects an anonymous visitor away from ${route} to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }

  test("redirects an anonymous visitor away from /marketplace/checkout, preserving returnTo", async ({ page }) => {
    await page.goto("/marketplace/checkout");
    await expect(page).toHaveURL(/\/login\?returnTo=%2Fmarketplace%2Fcheckout/);
  });

  test("lets an anonymous visitor reach /login and /register directly", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/register");
    await expect(page).toHaveURL(/\/register$/);
  });

  test("a present current_user cookie lets a dashboard route through the gate", async ({ context }) => {
    await context.addCookies([
      {
        name: "current_user",
        value: JSON.stringify({ role: "buyer", isClusterFarmer: false }),
        domain: "localhost",
        path: "/",
      },
    ]);
    // The gate itself only checks cookie *presence* — it lets the request
    // through to the page, whose client-side auth check then bounces an
    // invalid (here: fake) session to /login on its own, fast enough in a
    // production build to race a URL assertion. So assert on the server
    // response, which is all proxy.ts controls: no redirect status.
    const res = await context.request.get("/buyers-dashboard", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });

  test("/login stays reachable even with a current_user cookie present (never auto-redirects away)", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "current_user",
        value: JSON.stringify({ role: "buyer", isClusterFarmer: false }),
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login$/);
  });
});
