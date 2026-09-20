import { test, expect } from "@playwright/test";
import path from "node:path";

// Uses the wallet-activated "order-buyer" fixture, not the randomized
// ".auth/buyer.json" — confirmed via the backend log that
// POST /api/marketplace/checkout itself calls requireActiveWallet right at
// the top (marketplace.controller.ts:527), before an order is even created,
// not just at the later pay-with-wallet step. A walletless buyer 403s
// immediately and the checkout page never advances.
test.use({ storageState: path.resolve(__dirname, ".auth/order-buyer.json") });

// SAFETY NOTE: order-buyer's wallet is real (active) but points at a fake
// autoramp_sub_account_id, and AUTORAMP_BASE_URL for this whole e2e run
// points at the mock server (Agro-chain2/scripts/mock-autoramp-server.ts,
// wired into playwright.config.ts's webServer array) — never the real
// AutoRamp API. So checkout's automatic pay-with-wallet call completes
// successfully, but only against the mock; no real money ever moves.

test.describe("buyer checkout", () => {
  test("browse marketplace, add an item to cart, and check out (pickup)", async ({ page }) => {
    // Chains several potentially-not-yet-compiled dev routes — the default
    // 90s config timeout is too tight for all of them back to back.
    test.setTimeout(150_000);

    await page.goto("/marketplace");

    await expect(page.getByRole("article").first()).toBeVisible({ timeout: 20_000 });
    // Click the card's own "View Details" button rather than the card
    // container itself — the container's onClick does the same
    // router.push, but a real click on the (framer-motion-animated)
    // container reliably misses triggering it in Playwright.
    await page.getByRole("button", { name: /view details/i }).first().click();

    // Generous timeout — same cold dev-compile reasoning as
    // farmer-cluster-approval.spec.ts: first-ever navigation to
    // /marketplace/[id] in a run can take a while for Next to compile it.
    await expect(page).toHaveURL(/\/marketplace\/[^/]+$/, { timeout: 30_000 });

    await page.getByRole("button", { name: "Add to Cart" }).first().click();

    await page.goto("/marketplace/checkout");
    await expect(page.getByText("Order Summary")).toBeVisible();
    await expect(page.getByText(/your cart is empty/i)).not.toBeVisible();

    // Pickup is the default delivery type — no address required.
    await page.getByRole("button", { name: "Place Order" }).click();

    // Order creation succeeds, then the automatic pay-with-wallet call
    // completes against the mock AutoRamp server, and the page redirects to
    // the new order's detail page.
    await expect(page).toHaveURL(/\/buyers-dashboard\/orders\/[^/]+$/, { timeout: 60_000 });
    await expect(page.getByRole("heading", { level: 1, name: /^Order AG-/ })).toBeVisible();
  });

  test("selecting Delivery fetches and displays a live delivery fee", async ({ page }) => {
    // Chains several potentially-not-yet-compiled dev routes — the default
    // 90s config timeout is too tight for all of them back to back.
    test.setTimeout(150_000);

    await page.goto("/marketplace");
    await expect(page.getByRole("article").first()).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: /view details/i }).first().click();
    await expect(page).toHaveURL(/\/marketplace\/[^/]+$/, { timeout: 60_000 });
    await page.getByRole("button", { name: "Add to Cart" }).first().click();

    await page.goto("/marketplace/checkout");
    await page.getByRole("button", { name: "Delivery" }).click();

    await page.getByLabel(/delivery address/i).fill("15 Real Delivery Test Street, Ikeja", { timeout: 30_000 });

    // The fee row updates from the live /marketplace/delivery-fee lookup —
    // give it a moment, then assert it's no longer the pickup "₦0".
    await expect(async () => {
      const feeRow = page.locator("text=Delivery Fee").locator("..").locator("span").last();
      const text = await feeRow.textContent();
      expect(text).not.toBe("₦0");
    }).toPass({ timeout: 10_000 });
  });
});
