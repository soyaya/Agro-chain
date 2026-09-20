import { request as playwrightRequest } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { currentLogSize, waitForOtp } from "./helpers/otp";

// Seeds real, freshly-registered buyer and farmer accounts through the app's
// own /api/auth/* routes (the exact same path the real UI takes), then saves
// each session's cookies to e2e/.auth/{role}.json via storageState so every
// spec except auth.spec.ts itself can skip UI login entirely.
//
// cluster/rider accounts can't be self-registered (cluster requires an
// admin-approved cluster-application, riders are only created via an admin
// invite) — those two fixtures are pre-seeded directly via
// Agro-chain2/scripts/seed-e2e-fixtures.ts (run once before this global
// setup; see e2e/README or the plan) with email
// e2e-{cluster,rider}@internal.test / password TestPassword123!. This setup
// logs those in via the real login+OTP flow, same stdout-scrape technique
// as register.
//
// Both registered fixtures below use Kaduna/Chikun — the only active state
// in this dev DB (GET /api/marketplace/active-states -> ["Kaduna"]) and the
// LGA of the one real active listing seeded in it, so buyer-checkout.spec.ts
// actually has something to find in the marketplace's default (own-LGA)
// view, and matches the seed-e2e-fixtures.ts fixtures for cluster-region
// pairing.

const FRONTEND_URL = "http://localhost:3010";
const AUTH_DIR = path.resolve(__dirname, ".auth");

interface Fixture {
  role: "buyer" | "farmer";
  email: string;
  phone: string;
  fullName: string;
}

const FIXTURES: Fixture[] = [
  { role: "buyer", email: `e2e-buyer-${Date.now()}@internal.test`, phone: `080100${Date.now() % 100000}`, fullName: "E2E Buyer" },
  { role: "farmer", email: `e2e-farmer-${Date.now()}@internal.test`, phone: `080200${Date.now() % 100000}`, fullName: "E2E Farmer" },
];

interface PreseededFixture {
  role: "cluster" | "rider" | "order-buyer" | "order-farmer";
  email: string;
  password: string;
}

const PRESEEDED_FIXTURES: PreseededFixture[] = [
  { role: "cluster", email: "e2e-cluster@internal.test", password: "TestPassword123!" },
  { role: "rider", email: "e2e-rider@internal.test", password: "TestPassword123!" },
  // Dedicated buyer that owns the pre-seeded "E2E-RIDER-FIXTURE" order (see
  // Agro-chain2/scripts/seed-e2e-fixtures.ts) — kept separate from the
  // randomized buyer fixture above since that one owns no orders.
  { role: "order-buyer", email: "e2e-order-buyer@internal.test", password: "TestPassword123!" },
  // Wallet-activated farmer (see seed-e2e-fixtures.ts) — the randomized
  // FIXTURES farmer above has no wallet (real registration never activates
  // one), so it can't pass createListing's requireActiveWallet check.
  { role: "order-farmer", email: "e2e-order-farmer@internal.test", password: "TestPassword123!" },
];

async function loginAndSave(fixture: PreseededFixture) {
  const context = await playwrightRequest.newContext({ baseURL: FRONTEND_URL });

  const sinceBytes = currentLogSize();
  const loginRes = await context.post("/api/auth/login", {
    data: { emailAddress: fixture.email, password: fixture.password },
  });
  if (!loginRes.ok()) {
    throw new Error(
      `/api/auth/login failed for ${fixture.email}: ${loginRes.status()} ${await loginRes.text()}. ` +
        `Did you run "npm run --prefix ../Agro-chain2 tsx scripts/seed-e2e-fixtures.ts" (or equivalent) first?`,
    );
  }

  // Riders receive OTP by SMS in production, but the e2e webServer env
  // blanks SENDCHAMP_ACCESS_KEY, so SMS delivery fails immediately and the
  // backend's documented fallback-to-email path kicks in — same
  // "[DEV ONLY] Email OTP" stdout line as everyone else.
  const otp = await waitForOtp(fixture.email, { sinceBytes });

  const otpRes = await context.post("/api/auth/login/otp", {
    data: { emailAddress: fixture.email, loginOtp: Number(otp) },
  });
  if (!otpRes.ok()) {
    throw new Error(`/api/auth/login/otp failed for ${fixture.email}: ${otpRes.status()} ${await otpRes.text()}`);
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await context.storageState({ path: path.join(AUTH_DIR, `${fixture.role}.json`) });
  await context.dispose();
}

async function registerAndSave(fixture: Fixture) {
  const context = await playwrightRequest.newContext({ baseURL: FRONTEND_URL });

  if (fixture.role === "farmer") {
    const roleRes = await context.post("/api/auth/role", { data: { role: "farmer" } });
    if (!roleRes.ok()) throw new Error(`/api/auth/role failed: ${roleRes.status()} ${await roleRes.text()}`);
  }

  const sinceBytes = currentLogSize();
  const registerRes = await context.post("/api/auth/register", {
    data: {
      fullName: fixture.fullName,
      phone: fixture.phone,
      email: fixture.email,
      state: "Kaduna",
      lga: "Chikun",
      ward: "Test Ward",
      password: "TestPassword123!",
    },
  });
  if (!registerRes.ok()) {
    throw new Error(`/api/auth/register failed for ${fixture.email}: ${registerRes.status()} ${await registerRes.text()}`);
  }

  const otp = await waitForOtp(fixture.email, { sinceBytes });

  const verifyRes = await context.post("/api/auth/register/otp", {
    data: { emailAddress: fixture.email, registerOtp: Number(otp) },
  });
  if (!verifyRes.ok()) {
    throw new Error(`/api/auth/register/otp failed for ${fixture.email}: ${verifyRes.status()} ${await verifyRes.text()}`);
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await context.storageState({ path: path.join(AUTH_DIR, `${fixture.role}.json`) });
  await context.dispose();

  // Persist which concrete email/phone got used so specs can reference the
  // same fixture (e.g. to log back in, or to assert on "my" data).
  fs.writeFileSync(
    path.join(AUTH_DIR, `${fixture.role}.meta.json`),
    JSON.stringify({ email: fixture.email, phone: fixture.phone, fullName: fixture.fullName }, null, 2),
  );
}

export default async function globalSetup() {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  for (const fixture of FIXTURES) {
    await registerAndSave(fixture);
  }
  for (const fixture of PRESEEDED_FIXTURES) {
    await loginAndSave(fixture);
  }
}
