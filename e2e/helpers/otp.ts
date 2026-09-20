import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

// The backend (Agro-chain2) prints real OTP codes to stdout in
// NODE_ENV=development:
//   [DEV ONLY] Email OTP for {email}: {otp}
// There's no way to bypass OTP against a live running server (vi.mock only
// works inside vitest's own process), so Playwright's real UI journeys read
// the code back out of the backend's log file instead. playwright.config.ts
// redirects the backend's stdout to BACKEND_LOG_PATH.

export const BACKEND_LOG_PATH =
  process.env.E2E_BACKEND_LOG_PATH ?? path.resolve(__dirname, "../.e2e/backend.log");

/**
 * Polls the backend log file for the most recent OTP printed for `email`,
 * emitted after `sinceBytes` (pass the file's size right before triggering
 * the action that sends the OTP, so a stale code from an earlier run/test
 * can't be picked up by mistake).
 */
export async function waitForOtp(
  email: string,
  options: { sinceBytes?: number; timeoutMs?: number; pollIntervalMs?: number } = {},
): Promise<string> {
  const { sinceBytes = 0, timeoutMs = 30_000, pollIntervalMs = 250 } = options;
  const pattern = `\\[DEV ONLY\\] Email OTP for ${escapeRegExp(email)}: (\\d{6})`;

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (existsSync(BACKEND_LOG_PATH)) {
      const contents = readFileSync(BACKEND_LOG_PATH, "utf-8");
      const relevant = contents.slice(sinceBytes);
      // Find the LAST match after sinceBytes — a resend produces a newer code.
      const matches = [...relevant.matchAll(new RegExp(pattern, "g"))];
      if (matches.length > 0) {
        return matches[matches.length - 1][1];
      }
    }
    await sleep(pollIntervalMs);
  }
  throw new Error(
    `Timed out after ${timeoutMs}ms waiting for a "[DEV ONLY] Email OTP for ${email}" line in ${BACKEND_LOG_PATH}. ` +
      `Is the backend running with NODE_ENV=development and its stdout redirected there?`,
  );
}

/** Returns the backend log file's current size in bytes (0 if it doesn't exist yet) — call this right before triggering an OTP send. */
export function currentLogSize(): number {
  if (!existsSync(BACKEND_LOG_PATH)) return 0;
  return readFileSync(BACKEND_LOG_PATH).length;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
