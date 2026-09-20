import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Canonical casing (C: not c:): a lowercase drive letter makes webpack bundle
// Next.js twice on Windows and `next build` fails prerendering.
const ROOT = fs.realpathSync.native(__dirname);

// Dedicated ports, separate from whatever dev instances might already be
// running on 3000/5000 on this machine — this stack is fully independent so
// Playwright can start/stop it without touching anyone else's session.
const FRONTEND_PORT = 3010;
const BACKEND_PORT = 5098;
export const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

const BACKEND_LOG_PATH = path.resolve(__dirname, ".e2e/backend.log");
process.env.E2E_BACKEND_LOG_PATH = BACKEND_LOG_PATH;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }]],
  // Generous — Next's dev-mode on-demand webpack compile of a route visited
  // for the first time in a run can itself take 20s+, on top of whatever
  // the test does after navigating there.
  timeout: 90_000,
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: FRONTEND_URL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Starts the whole stack Playwright needs and tears it down afterwards.
  // Both processes reuse an already-running instance on the same port if one
  // exists (e.g. a previous test run left it up) instead of erroring out.
  webServer: [
    {
      // Mock AutoRamp (Agro-chain2/scripts/mock-autoramp-server.ts, built
      // for the k6 load test) — the wallet dashboard's bank list / name
      // enquiry calls need *something* answering on AUTORAMP_BASE_URL below,
      // or they 500. Never a real transfer: wallet-withdrawal.spec.ts's
      // fixture wallet has a fake autoramp_sub_account_id, so even this mock
      // rejecting an unrecognized sub-account is the expected, safe outcome.
      command: "npx tsx scripts/mock-autoramp-server.ts",
      cwd: path.resolve(__dirname, "../Agro-chain2"),
      url: "http://localhost:4601/merchants/api/banks",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { MOCK_AUTORAMP_PORT: "4601" },
    },
    {
      // Backend (Agro-chain2) — stdout redirected to a log file so
      // e2e/helpers/otp.ts can scrape the "[DEV ONLY] Email OTP" lines the
      // backend prints in development mode. Email/SMS creds are
      // intentionally overridden to blank/unreachable values below so E2E
      // runs can never send a real email or SMS.
      command: `npm run dev > "${BACKEND_LOG_PATH}" 2>&1`,
      cwd: path.resolve(__dirname, "../Agro-chain2"),
      url: `${BACKEND_URL}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        PORT: String(BACKEND_PORT),
        NODE_ENV: "development",
        // Same shared dev Postgres the rest of this repo's dev instance
        // uses (matches the existing .env.test convention) — not a fresh DB,
        // so migrations are already applied.
        DATABASE_URL: "postgresql://agro_user:agro_password@127.0.0.1:5556/agrochain?schema=public",
        JWT_SECRET: "e2e-test-secret",
        JWT_ACCESS_EXPIRES: "24h",
        JWT_REFRESH_EXPIRES: "30d",
        FRONTEND_URL,
        // Left blank/unreachable on purpose: OTP is still printed to stdout
        // in dev regardless of delivery success, so no real email/SMS is
        // ever needed for the OTP-scraping journeys.
        RESEND_API_KEY: "",
        SENDCHAMP_ACCESS_KEY: "",
        TERMII_API_KEY: "",
        TERMII_SECRET_KEY: "",
        // Points at the mock AutoRamp above — any non-empty key satisfies
        // its x-api-key check, it doesn't validate the value.
        AUTORAMP_BASE_URL: "http://localhost:4601",
        AUTORAMP_API_KEY: "e2e-mock-key",
        AUTORAMP_WEBHOOK_SECRET: "e2e-mock-webhook-secret",
      },
    },
    {
      // This repo's own frontend, pointed at the E2E backend above.
      // Production build by default: `next dev` compiles each route on first
      // visit (20-60s), which made specs time out non-deterministically.
      // Set E2E_DEV=true to use the dev server instead.
      command:
        process.env.E2E_DEV === "true"
          ? "npm run dev -- -p " + FRONTEND_PORT
          : `npm run build && npm run start -- -p ${FRONTEND_PORT}`,
      cwd: ROOT,
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: process.env.E2E_DEV === "true" ? 120_000 : 600_000,
      env: {
        PORT: String(FRONTEND_PORT),
        BASE_BACKEND_URL: BACKEND_URL,
        NEXT_PUBLIC_BASE_BACKEND_URL: BACKEND_URL,
        AUTH_SESSION_SECRET: "e2e-session-secret",
        // Tells next.config.ts to build into .next-e2e instead of .next, so
        // this can run alongside a regular `npm run dev` in the same
        // checkout without both fighting over the same dev lock file.
        E2E: "true",
      },
    },
  ],
});
