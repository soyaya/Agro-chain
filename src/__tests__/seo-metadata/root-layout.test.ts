import { describe, it, expect } from "vitest";
import { metadata } from "../../app/layout";

// Unit tests for root layout metadata structure
// Validates: Requirements 1.1, 1.2, 1.3, 7.1, 7.2

describe("Root layout metadata", () => {
  it("exports a metadata object", () => {
    expect(metadata).toBeDefined();
    expect(typeof metadata).toBe("object");
  });

  describe("metadataBase", () => {
    it("is present", () => {
      expect(metadata.metadataBase).toBeDefined();
    });

    it("equals https://agro-chain.com", () => {
      expect(metadata.metadataBase?.toString()).toBe("https://agro-chain.com/");
    });
  });

  describe("title", () => {
    it("has a template field", () => {
      expect(metadata.title).toBeDefined();
      expect(typeof metadata.title).toBe("object");
      expect((metadata.title as { template: string }).template).toBeDefined();
    });

    it('template equals "%s | Agro-chain"', () => {
      expect((metadata.title as { template: string }).template).toBe("%s | Agro-chain");
    });

    it("has a non-empty default", () => {
      const title = metadata.title as { default: string };
      expect(title.default).toBeTruthy();
    });
  });

  describe("description", () => {
    it("is present and non-empty", () => {
      expect(metadata.description).toBeTruthy();
    });
  });

  describe("keywords", () => {
    it("is present", () => {
      expect(metadata.keywords).toBeDefined();
    });

    it("is a non-empty array", () => {
      expect(Array.isArray(metadata.keywords)).toBe(true);
      expect((metadata.keywords as string[]).length).toBeGreaterThan(0);
    });

    it("includes core platform topics", () => {
      const kw = metadata.keywords as string[];
      expect(kw).toContain("catfish");
      expect(kw).toContain("marketplace");
      expect(kw).toContain("farmers");
      expect(kw).toContain("buyers");
      expect(kw).toContain("Nigeria");
      expect(kw).toContain("aquaculture");
      expect(kw).toContain("supply chain");
    });
  });

  describe("openGraph.images", () => {
    it("is present", () => {
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.images).toBeDefined();
    });

    it("has width 1200", () => {
      const images = metadata.openGraph?.images as Array<{
        width: number;
        height: number;
        alt: string;
        url: string;
      }>;
      expect(images[0].width).toBe(1200);
    });

    it("has height 630", () => {
      const images = metadata.openGraph?.images as Array<{
        width: number;
        height: number;
        alt: string;
        url: string;
      }>;
      expect(images[0].height).toBe(630);
    });

    it("has a non-empty alt field", () => {
      const images = metadata.openGraph?.images as Array<{
        width: number;
        height: number;
        alt: string;
        url: string;
      }>;
      expect(images[0].alt).toBeTruthy();
    });
  });

  describe("twitter.images", () => {
    it("is present", () => {
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.images).toBeDefined();
    });

    it("has a url field", () => {
      const images = metadata.twitter?.images as { url: string; alt: string };
      expect(images.url).toBeTruthy();
    });

    it("has an alt field", () => {
      const images = metadata.twitter?.images as { url: string; alt: string };
      expect(images.alt).toBeTruthy();
    });
  });
});
