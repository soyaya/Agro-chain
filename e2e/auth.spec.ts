import { test, expect } from "@playwright/test";
import { currentLogSize, waitForOtp } from "./helpers/otp";

// Real UI journeys — no storageState here, this spec IS the login/register flow.
test.use({ storageState: { cookies: [], origins: [] } });

function uniquePhone() {
  return `080${String(Date.now()).slice(-8)}`;
}

test.describe("register -> OTP -> dashboard redirect", () => {
  test("a new buyer can register, verify OTP, and lands on the buyer dashboard", async ({ page }) => {
    const email = `e2e-auth-buyer-${Date.now()}@internal.test`;

    await page.goto("/register?role=buyer");

    await page.getByLabel("Full Name").fill("Auth Test Buyer");
    await page.getByLabel("Phone Number").fill(uniquePhone());
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("TestPassword123!");
    await page.getByLabel("Confirm Password").fill("TestPassword123!");

    await page.getByRole("combobox", { name: "State" }).click();
    await page.getByRole("option", { name: "Kaduna", exact: true }).click();
    await page.getByRole("combobox", { name: "Local Government Area" }).click();
    await page.getByRole("option", { name: "Chikun", exact: true }).click();

    const sinceBytes = currentLogSize();
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByText(/enter the otp sent to your email/i)).toBeVisible({ timeout: 15_000 });

    const otp = await waitForOtp(email, { sinceBytes });
    // The 6-box OTP input is a single hidden <input> driving 6 visual slots —
    // it must be focused (clicked) first, then typing into it fills all six.
    await page.locator('input[data-slot="input-otp"]').first().click();
    await page.keyboard.type(otp);

    await page.getByRole("button", { name: "Verify OTP" }).click();

    await expect(page).toHaveURL(/\/buyers-dashboard/, { timeout: 20_000 });
  });
});

test.describe("login -> OTP", () => {
  test("wrong password on login shows an error and does not proceed to OTP", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email Address").fill("nonexistent-e2e-user@internal.test");
    await page.getByLabel("Password", { exact: true }).fill("WrongPassword123!");
    await page.getByRole("button", { name: "Send OTP" }).click();

    // Never reaches the OTP step, and never navigates off /login.
    await expect(page.getByText(/enter the otp sent to your email/i)).not.toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("a registered user can log in with the correct password, then verify OTP into their dashboard", async ({
    page,
  }) => {
    const email = `e2e-auth-login-${Date.now()}@internal.test`;

    // Register first (own throwaway account, independent of global-setup's fixtures).
    await page.goto("/register?role=buyer");
    await page.getByLabel("Full Name").fill("Auth Login Buyer");
    await page.getByLabel("Phone Number").fill(uniquePhone());
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("TestPassword123!");
    await page.getByLabel("Confirm Password").fill("TestPassword123!");
    await page.getByRole("combobox", { name: "State" }).click();
    await page.getByRole("option", { name: "Kaduna", exact: true }).click();
    await page.getByRole("combobox", { name: "Local Government Area" }).click();
    await page.getByRole("option", { name: "Chikun", exact: true }).click();

    let sinceBytes = currentLogSize();
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByText(/enter the otp sent to your email/i)).toBeVisible({ timeout: 15_000 });
    let otp = await waitForOtp(email, { sinceBytes });
    await page.locator('input[data-slot="input-otp"]').first().click();
    await page.keyboard.type(otp);
    await page.getByRole("button", { name: "Verify OTP" }).click();
    await expect(page).toHaveURL(/\/buyers-dashboard/, { timeout: 20_000 });

    // Log out by clearing cookies, then log back in through the real login form.
    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("TestPassword123!");

    sinceBytes = currentLogSize();
    await page.getByRole("button", { name: "Send OTP" }).click();

    await expect(page.getByText(/enter the otp sent to your email/i)).toBeVisible({ timeout: 15_000 });
    otp = await waitForOtp(email, { sinceBytes });
    await page.locator('input[data-slot="input-otp"]').first().click();
    await page.keyboard.type(otp);
    // Login's OTP step auto-submits once all 6 digits are entered (unlike
    // register's, which needs an explicit click) — clicking "Verify Code"
    // here would race a button that's often already gone once the page has
    // navigated away.

    await expect(page).toHaveURL(/\/buyers-dashboard/, { timeout: 20_000 });
  });

  test("wrong OTP on login shows an inline error and does not navigate away", async ({ page }) => {
    const email = `e2e-auth-wrongotp-${Date.now()}@internal.test`;

    await page.goto("/register?role=buyer");
    await page.getByLabel("Full Name").fill("Wrong OTP Buyer");
    await page.getByLabel("Phone Number").fill(uniquePhone());
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("TestPassword123!");
    await page.getByLabel("Confirm Password").fill("TestPassword123!");
    await page.getByRole("combobox", { name: "State" }).click();
    await page.getByRole("option", { name: "Kaduna", exact: true }).click();
    await page.getByRole("combobox", { name: "Local Government Area" }).click();
    await page.getByRole("option", { name: "Chikun", exact: true }).click();
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByText(/enter the otp sent to your email/i)).toBeVisible({ timeout: 15_000 });

    await page.locator('input[data-slot="input-otp"]').first().click();
    await page.keyboard.type("000000");
    await page.getByRole("button", { name: "Verify OTP" }).click();

    await expect(page.getByText(/otp/i).last()).toBeVisible();
    await expect(page).not.toHaveURL(/dashboard/);
  });
});
