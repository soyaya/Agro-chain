import { describe, it, expect, vi, afterEach } from "vitest";
import { createSessionToken, verifyToken } from "~/lib/auth-sdk";

describe("auth-sdk", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // ── createSessionToken ────────────────────────────────────────────────────

  describe("createSessionToken", () => {
    it("returns a string with exactly one dot separator", async () => {
      const token = await createSessionToken({ userId: "u1", email: "a@b.com", role: "farmer" });
      const parts = token.split(".");
      expect(parts).toHaveLength(2);
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
    });

    it("encodes userId, email and role into the payload", async () => {
      const token = await createSessionToken({ userId: "u42", email: "test@test.com", role: "buyer" });
      const [encoded] = token.split(".");
      const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded));
      expect(payload.userId).toBe("u42");
      expect(payload.email).toBe("test@test.com");
      expect(payload.role).toBe("buyer");
    });

    it("sets exp approximately 7 days from now", async () => {
      const before = Date.now();
      const token = await createSessionToken({ userId: "u1" });
      const after = Date.now();

      const [encoded] = token.split(".");
      const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded));

      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      expect(payload.exp).toBeGreaterThanOrEqual(before + sevenDaysMs - 100);
      expect(payload.exp).toBeLessThanOrEqual(after + sevenDaysMs + 100);
    });

    it("ignores non-string fields gracefully", async () => {
      const token = await createSessionToken({ userId: 123 as unknown as string });
      const [encoded] = token.split(".");
      const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded));
      expect(payload.userId).toBeUndefined();
    });

    it("produces different tokens for different inputs", async () => {
      const t1 = await createSessionToken({ userId: "a" });
      const t2 = await createSessionToken({ userId: "b" });
      expect(t1).not.toBe(t2);
    });
  });

  // ── verifyToken ───────────────────────────────────────────────────────────

  describe("verifyToken", () => {
    it("returns the payload for a valid token", async () => {
      const token = await createSessionToken({ userId: "u1", role: "admin" });
      const payload = await verifyToken(token);
      expect(payload.userId).toBe("u1");
      expect(payload.role).toBe("admin");
    });

    it("throws on tampered signature", async () => {
      const token = await createSessionToken({ userId: "u1" });
      const [encoded] = token.split(".");
      const badToken = `${encoded}.invalidsignature`;
      await expect(verifyToken(badToken)).rejects.toThrow("Invalid token signature");
    });

    it("throws on tampered payload", async () => {
      const token = await createSessionToken({ userId: "u1" });
      const [, sig] = token.split(".");
      // encode a different payload
      const fakePayload = btoa(JSON.stringify({ userId: "hacker", exp: Date.now() + 99999 }))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      await expect(verifyToken(`${fakePayload}.${sig}`)).rejects.toThrow("Invalid token signature");
    });

    it("throws when token has no dot separator", async () => {
      await expect(verifyToken("nodothere")).rejects.toThrow("Invalid token format");
    });

    it("throws on empty string", async () => {
      await expect(verifyToken("")).rejects.toThrow("Invalid token format");
    });

    it("throws on expired token", async () => {
      // Create a valid token then manually build one with past exp
      const token = await createSessionToken({ userId: "u1" });
      const [encoded] = token.split(".");
      const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded));
      payload.exp = Date.now() - 1000; // expired 1 second ago

      const expiredEncoded = btoa(JSON.stringify(payload))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

      // We need a real signature for the expired payload — create via createSessionToken
      // by intercepting: just verify that a token we know is expired throws
      // We build it directly using the same sign function path
      const { createSessionToken: makeToken } = await import("~/lib/auth-sdk");

      // Use Date.now mock to generate a token that's already expired
      const spy = vi.spyOn(Date, "now").mockReturnValue(Date.now() - 8 * 24 * 60 * 60 * 1000);
      const expiredToken = await makeToken({ userId: "old" });
      spy.mockRestore();

      await expect(verifyToken(expiredToken)).rejects.toThrow("Token expired");
    });

    it("uses AUTH_SESSION_SECRET env var when set", async () => {
      vi.stubEnv("AUTH_SESSION_SECRET", "custom-secret-xyz");
      vi.resetModules();
      const { createSessionToken: create, verifyToken: verify } = await import("~/lib/auth-sdk");

      const token = await create({ userId: "u99" });
      const payload = await verify(token);
      expect(payload.userId).toBe("u99");
    });

    it("token signed with secret A cannot be verified with secret B", async () => {
      vi.stubEnv("AUTH_SESSION_SECRET", "secret-a");
      vi.resetModules();
      const { createSessionToken: createA } = await import("~/lib/auth-sdk");
      const tokenA = await createA({ userId: "u1" });

      vi.stubEnv("AUTH_SESSION_SECRET", "secret-b");
      vi.resetModules();
      const { verifyToken: verifyB } = await import("~/lib/auth-sdk");
      await expect(verifyB(tokenA)).rejects.toThrow("Invalid token signature");
    });
  });
});
