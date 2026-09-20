import { test, expect } from "@playwright/test";
import path from "node:path";

// Requires the "cluster" fixture pre-seeded via
// Agro-chain2/scripts/seed-e2e-fixtures.ts (location Kaduna/Chikun, matching
// the farmer fixture registered in global-setup.ts, so cluster-region
// matching in cluster-region.util.ts actually pairs them) and logged in via
// e2e/global-setup.ts's PRESEEDED_FIXTURES login flow.
test.describe("farmer creates a listing, cluster approves it", () => {
  test("farmer submits a listing; cluster farmer approves it from their pending-approvals queue", async ({
    browser,
  }) => {
    // Two role hops, each potentially hitting a not-yet-compiled dev route —
    // the default 90s config timeout is too tight for both back to back.
    test.setTimeout(210_000);
    // Uses the wallet-activated "order-farmer" fixture, not the randomized
    // ".auth/farmer.json" — that one has no wallet (real registration never
    // activates one), and createListing's requireActiveWallet check rejects
    // listing creation without one.
    const farmerContext = await browser.newContext({
      storageState: path.resolve(__dirname, ".auth/order-farmer.json"),
    });
    const clusterContext = await browser.newContext({
      storageState: path.resolve(__dirname, ".auth/cluster.json"),
    });

    const farmerPage = await farmerContext.newPage();
    await farmerPage.goto("/farmers-dashboard/listings/create");

    // Table Size / 700g-1kg has a real admin-regulated price seeded in the
    // dev catalog (1000/kg) — required for the price-agreement checkbox and
    // submit button to enable at all. Neither SelectInput here has an
    // accessible name (SupplyListingForm passes label="" and renders the
    // visible label as a plain sibling <label> with no htmlFor) — targeted
    // positionally instead: combobox 0 is Fish Product, combobox 1 (which
    // only renders once a fish variant is chosen) is Weight Range.
    await farmerPage.getByRole("combobox").nth(0).click();
    await farmerPage.getByRole("option", { name: "Table Size" }).click();
    await farmerPage.getByRole("combobox").nth(1).click();
    await farmerPage.getByRole("option", { name: "700g – 1kg" }).click();
    await farmerPage.getByLabel("Available Quantity (kg)").fill("50");
    await farmerPage.getByLabel("Harvest Date").fill("2026-12-01");
    await farmerPage.getByRole("checkbox").check();

    const submit = farmerPage.getByRole("button", { name: "Submit Listing" });
    await expect(submit).toBeEnabled();
    await submit.click();
    // Very generous timeout: in dev mode, first navigation to a not-yet-
    // compiled route (/farmers-dashboard/listings) can take a long time for
    // webpack to compile on demand, on top of the actual POST — confirmed
    // via the backend log showing the create POST succeeding in ~500ms, but
    // the destination page's own data fetch not firing until ~57s later.
    await expect(farmerPage).toHaveURL(/\/farmers-dashboard\/listings$/, { timeout: 80_000 });

    const clusterPage = await clusterContext.newPage();
    await clusterPage.goto("/cluster-dashboard/pending-approvals");

    const approveButtons = clusterPage.getByRole("button", { name: /^Approve/ });
    await expect(approveButtons.first()).toBeVisible({ timeout: 15_000 });
    const pendingBefore = await approveButtons.count();
    await approveButtons.first().click();

    // The approved listing leaves the pending queue — assert the empty
    // state actually appears (this fixture's application is always the only
    // one pending), not just "either the empty state or the button is still
    // there", which would trivially pass even if the approval silently
    // failed and the button just never disappeared.
    // Count-based rather than "queue is empty": listings from earlier runs
    // can still be pending for this cluster, so exactly one fewer is the
    // real signal that this approval took effect.
    await expect(approveButtons).toHaveCount(pendingBefore - 1, { timeout: 30_000 });

    await farmerContext.close();
    await clusterContext.close();
  });
});
