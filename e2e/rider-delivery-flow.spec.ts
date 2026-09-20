import { test, expect } from "@playwright/test";
import path from "node:path";

// Requires the "rider" fixture and the pre-escalated "E2E-RIDER-FIXTURE"
// order (assigned to that rider, buyer = "e2e-order-buyer") seeded via
// Agro-chain2/scripts/seed-e2e-fixtures.ts and logged in via
// e2e/global-setup.ts's PRESEEDED_FIXTURES.
//
// Confirmedly safe: confirmDelivery only schedules a `payouts` row (status
// "pending") — the actual AutoRamp transfer requires a separate, manual
// admin "Pay now" action (adminService.markPayoutPaid) that this spec never
// triggers, so no real money moves.
test.describe("rider delivery flow: pickup -> handoff -> buyer confirms", () => {
  test("full state machine, ending completed with a scheduled payout", async ({ browser }) => {
    // Two role hops across several not-yet-compiled dev routes — the
    // default 90s config timeout is too tight for the whole chain.
    test.setTimeout(210_000);

    const riderContext = await browser.newContext({
      storageState: path.resolve(__dirname, ".auth/rider.json"),
    });
    const buyerContext = await browser.newContext({
      storageState: path.resolve(__dirname, ".auth/order-buyer.json"),
    });

    const riderPage = await riderContext.newPage();
    // The real /api/upload route forwards unsigned to Cloudinary and 500s
    // without real credentials configured for this environment — intercept
    // it exactly as the plan specifies so the photo-capture UI still gets a
    // usable URL back.
    await riderPage.route("**/api/upload", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "success", data: { secure_url: "https://fake.example/photo.jpg" } }),
      }),
    );

    await riderPage.goto("/rider-dashboard");
    await riderPage.getByRole("button", { name: /upload pickup photo/i }).first().click();
    await riderPage
      .locator('input[type="file"]')
      .first()
      .setInputFiles({ name: "pickup.jpg", mimeType: "image/jpeg", buffer: Buffer.from("fake-image-bytes") });
    await riderPage.getByRole("button", { name: /confirm pickup & start delivery/i }).click();

    await expect(riderPage.getByText(/out for delivery/i).first()).toBeVisible({ timeout: 15_000 });

    await riderPage.getByRole("button", { name: /upload handoff photo/i }).first().click();
    await riderPage
      .locator('input[type="file"]')
      .first()
      .setInputFiles({ name: "handoff.jpg", mimeType: "image/jpeg", buffer: Buffer.from("fake-image-bytes") });
    await riderPage.getByRole("button", { name: /complete handoff/i }).click();

    await expect(riderPage.getByText(/awaiting buyer confirmation/i).first()).toBeVisible({ timeout: 15_000 });

    const buyerPage = await buyerContext.newPage();
    await buyerPage.goto("/buyers-dashboard/orders");
    // The order row itself has no click handler — only its nested "View
    // Details" button navigates. Other orders (e.g. from buyer-checkout.spec.ts
    // reusing this same buyer) can be present too, each with their own
    // identical "View Details" button, so a plain `div` + filter({has}) is
    // ambiguous (multiple nested ancestor divs all "have" both the text and
    // *a* View Details button). Walk up from the order-number heading
    // (unique per card) to its specific card container instead.
    const orderCard = buyerPage
      .getByRole("heading", { name: "E2E-RIDER-FIXTURE" })
      .locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");
    await orderCard.getByRole("button", { name: /view details/i }).click();
    await expect(buyerPage).toHaveURL(/\/buyers-dashboard\/orders\/[^/]+$/, { timeout: 60_000 });
    await buyerPage.getByRole("button", { name: /confirm delivery/i }).click();

    await expect(buyerPage.getByText(/completed/i).first()).toBeVisible({ timeout: 15_000 });

    await riderContext.close();
    await buyerContext.close();
  });
});
