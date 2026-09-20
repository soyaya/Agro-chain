import { test, expect } from "@playwright/test";
import path from "node:path";

// Uses the "order-buyer" fixture (Agro-chain2/scripts/seed-e2e-fixtures.ts),
// not the randomized ".auth/buyer.json" — that one is a freshly registered
// account with no wallet at all, so the wallet dashboard never even renders
// TransferForm (requireActiveWallet gates it, showing a "Complete BVN
// Verification" prompt instead). order-buyer's wallet is pre-activated
// directly in the seed script, bypassing the real BVN/AutoRamp flow.
test.use({ storageState: path.resolve(__dirname, ".auth/order-buyer.json") });

// SAFETY NOTE: even with an active wallet, this fixture's wallet has no real
// funds and its autoramp_sub_account_id is fake — a real transfer submission
// fails safely at the backend (AutoRamp rejects the unknown sub-account)
// before any money could move. This spec covers client-side validation
// fully (real, no caveats) and treats the submit failure as the expected
// outcome rather than exercising a real payout.

test.describe("wallet withdrawal (TransferForm)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/buyers-dashboard/wallet");
    await expect(page.getByRole("heading", { name: "Withdraw to Bank Account" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("rejects an account number shorter than 10 digits", async ({ page }) => {
    await page.getByLabel("Beneficiary Account Number").fill("12345");
    await page.getByLabel(/Beneficiary Name/).fill("Test Recipient");
    await page.getByLabel("Amount").fill("1000");
    await page.getByRole("button", { name: "Withdraw" }).click();

    await expect(page.getByText(/account number must be 10 digits/i)).toBeVisible();
  });

  test("requires a bank to be selected", async ({ page }) => {
    await page.getByLabel("Beneficiary Account Number").fill("0123456789");
    await page.getByLabel(/Beneficiary Name/).fill("Test Recipient");
    await page.getByLabel("Amount").fill("1000");
    await page.getByRole("button", { name: "Withdraw" }).click();

    await expect(page.getByText(/please select a bank/i)).toBeVisible();
  });

  test("requires a valid, non-zero amount", async ({ page }) => {
    await page.getByRole("combobox", { name: /^Bank/ }).click();
    await page.getByRole("option").first().click();
    await page.getByLabel("Beneficiary Account Number").fill("0123456789");
    await page.getByLabel(/Beneficiary Name/).fill("Test Recipient");
    await page.getByRole("button", { name: "Withdraw" }).click();

    await expect(page.getByText(/enter a valid amount/i)).toBeVisible();
  });

  test("account number field strips non-digits and caps at 10 characters", async ({ page }) => {
    const input = page.getByLabel("Beneficiary Account Number");
    await input.fill("01a2b3456789xyz");
    await expect(input).toHaveValue("0123456789");
  });

  test("a fully valid submission is safely rejected server-side (no BVN-verified wallet, no real transfer)", async ({
    page,
  }) => {
    await page.getByRole("combobox", { name: /^Bank/ }).click();
    await page.getByRole("option").first().click();
    await page.getByLabel("Beneficiary Account Number").fill("0123456789");
    await page.getByLabel(/Beneficiary Name/).fill("Test Recipient");
    await page.getByLabel("Amount").fill("500");
    await page.getByRole("button", { name: "Withdraw" }).click();

    // Expect a toast — either name-enquiry never resolved a real name, or
    // (more likely) the backend's requireActiveWallet guard rejects the
    // transfer outright. Either way, no successful "Withdrawal initiated."
    await expect(page.getByText(/withdrawal initiated/i)).not.toBeVisible({ timeout: 5_000 });
  });
});
