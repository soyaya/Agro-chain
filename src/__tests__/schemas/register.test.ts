import { describe, it, expect } from "vitest";
import { z } from "zod";

// Extract the schema directly — mirrors the one in register/page.tsx
const registerSchema = z
  .object({
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    phone: z
      .string()
      .min(10, "Phone number is too short")
      .regex(/^(0|\+234)[789][01]\d{8}$/, "Invalid Nigerian phone number (+234 or 0 prefix)"),
    email: z.string().email("Invalid email address"),
    location: z.string().min(2, "Location is required").optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const valid = {
  fullName: "Ada Lovelace",
  phone: "08012345678",
  email: "ada@example.com",
  location: "Kaduna",
  password: "secret123",
  confirmPassword: "secret123",
};

describe("Register form schema", () => {
  it("accepts a fully valid payload", () => {
    expect(() => registerSchema.parse(valid)).not.toThrow();
  });

  // ── fullName ──────────────────────────────────────────────────────────────

  describe("fullName", () => {
    it("rejects names shorter than 3 characters", () => {
      const result = registerSchema.safeParse({ ...valid, fullName: "Ab" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.fullName?.[0]).toMatch(/3 characters/);
      }
    });

    it("accepts a name of exactly 3 characters", () => {
      expect(() => registerSchema.parse({ ...valid, fullName: "Ada" })).not.toThrow();
    });
  });

  // ── phone ─────────────────────────────────────────────────────────────────

  describe("phone", () => {
    const validPhones = [
      "08012345678",
      "07012345678",
      "09012345678",
      "+2348012345678",
      "+2347012345678",
    ];
    const invalidPhones = [
      "08012",           // too short
      "1234567890",      // wrong prefix
      "+1234567890",     // not +234
      "05012345678",     // 5 is not in [789]
      "+2345012345678",  // 5 is not in [789]
    ];

    validPhones.forEach((phone) => {
      it(`accepts valid phone: ${phone}`, () => {
        expect(() => registerSchema.parse({ ...valid, phone })).not.toThrow();
      });
    });

    invalidPhones.forEach((phone) => {
      it(`rejects invalid phone: ${phone}`, () => {
        const result = registerSchema.safeParse({ ...valid, phone });
        expect(result.success).toBe(false);
      });
    });
  });

  // ── email ─────────────────────────────────────────────────────────────────

  describe("email", () => {
    it("rejects a non-email string", () => {
      const result = registerSchema.safeParse({ ...valid, email: "notanemail" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email?.[0]).toMatch(/Invalid email/);
      }
    });

    it("accepts a valid email", () => {
      expect(() => registerSchema.parse({ ...valid, email: "user@domain.co" })).not.toThrow();
    });
  });

  // ── password ──────────────────────────────────────────────────────────────

  describe("password", () => {
    it("rejects passwords shorter than 8 characters", () => {
      const result = registerSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" });
      expect(result.success).toBe(false);
    });

    it("accepts a password of exactly 8 characters", () => {
      expect(() =>
        registerSchema.parse({ ...valid, password: "12345678", confirmPassword: "12345678" }),
      ).not.toThrow();
    });
  });

  // ── confirmPassword ───────────────────────────────────────────────────────

  describe("confirmPassword", () => {
    it("rejects when passwords do not match", () => {
      const result = registerSchema.safeParse({
        ...valid,
        password: "password1",
        confirmPassword: "password2",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toMatch(/do not match/);
      }
    });

    it("accepts matching passwords", () => {
      expect(() =>
        registerSchema.parse({ ...valid, password: "samepass", confirmPassword: "samepass" }),
      ).not.toThrow();
    });
  });

  // ── location ──────────────────────────────────────────────────────────────

  describe("location", () => {
    it("is optional — omitting it is valid", () => {
      const { location: _loc, ...withoutLocation } = valid;
      expect(() => registerSchema.parse(withoutLocation)).not.toThrow();
    });

    it("rejects a location shorter than 2 characters when provided", () => {
      const result = registerSchema.safeParse({ ...valid, location: "A" });
      expect(result.success).toBe(false);
    });
  });
});

// ─── Login schema (inline — matches login/page.tsx) ──────────────────────────

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

describe("Login form schema", () => {
  it("accepts valid credentials", () => {
    expect(() => loginSchema.parse({ email: "user@x.com", password: "password1" })).not.toThrow();
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({ password: "password1" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "bad", password: "password1" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toMatch(/Invalid email/);
    }
  });

  it("rejects password under 8 chars", () => {
    const result = loginSchema.safeParse({ email: "u@x.com", password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "u@x.com" });
    expect(result.success).toBe(false);
  });
});
