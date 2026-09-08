import { describe, it, expect } from "vitest";
import { getSafeReturnTo } from "~/lib/utils";

describe("getSafeReturnTo", () => {
  it("accepts a plain relative path", () => {
    expect(getSafeReturnTo("/marketplace/checkout")).toBe("/marketplace/checkout");
  });

  it("accepts a relative path with a query string", () => {
    expect(getSafeReturnTo("/marketplace/checkout?step=2")).toBe("/marketplace/checkout?step=2");
  });

  it("rejects null", () => {
    expect(getSafeReturnTo(null)).toBe("");
  });

  it("rejects undefined", () => {
    expect(getSafeReturnTo(undefined)).toBe("");
  });

  it("rejects an empty string", () => {
    expect(getSafeReturnTo("")).toBe("");
  });

  it("rejects a protocol-relative URL (open-redirect vector)", () => {
    expect(getSafeReturnTo("//evil.com/phishing")).toBe("");
  });

  it("rejects an absolute http URL", () => {
    expect(getSafeReturnTo("http://evil.com")).toBe("");
  });

  it("rejects an absolute https URL", () => {
    expect(getSafeReturnTo("https://evil.com/steal-session")).toBe("");
  });

  it("rejects a path with no leading slash", () => {
    expect(getSafeReturnTo("marketplace/checkout")).toBe("");
  });

  it("rejects a javascript: pseudo-URL", () => {
    expect(getSafeReturnTo("javascript:alert(1)")).toBe("");
  });
});
