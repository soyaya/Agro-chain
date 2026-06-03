// Feature: seo-metadata, Property 4: image paths are relative
// Validates: Requirement 7.4

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { metadata as rootMetadata } from "../../app/layout";
import { metadata as marketplaceMetadata } from "../../app/(main-app)/marketplace/layout";
import { metadata as marketplaceIdMetadata } from "../../app/(main-app)/marketplace/[id]/layout";

type AnyMetadata = Record<string, unknown>;

interface ImageEntry {
  source: string;
  type: "openGraph" | "twitter";
  url: string;
}

function extractImageUrls(meta: AnyMetadata, sourceName: string): ImageEntry[] {
  const entries: ImageEntry[] = [];

  const og = meta.openGraph as Record<string, unknown> | undefined;
  if (og?.images) {
    const images = Array.isArray(og.images) ? og.images : [og.images];
    for (const img of images) {
      const url = (img as Record<string, unknown>).url as string | undefined;
      if (url) entries.push({ source: sourceName, type: "openGraph", url });
    }
  }

  const tw = meta.twitter as Record<string, unknown> | undefined;
  if (tw?.images) {
    const images = Array.isArray(tw.images) ? tw.images : [tw.images];
    for (const img of images) {
      const url = (img as Record<string, unknown>).url as string | undefined;
      if (url) entries.push({ source: sourceName, type: "twitter", url });
    }
  }

  return entries;
}

const allImageEntries: ImageEntry[] = [
  ...extractImageUrls(rootMetadata as AnyMetadata, "root layout"),
  ...extractImageUrls(marketplaceMetadata as AnyMetadata, "marketplace layout"),
  ...extractImageUrls(marketplaceIdMetadata as AnyMetadata, "marketplace/[id] layout"),
];

describe("Image paths - Property 4: OG and Twitter image paths are relative", () => {
  it("all OG and Twitter image urls start with '/' and not 'http'", () => {
    // Ensure we have at least some image entries to test
    expect(allImageEntries.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: allImageEntries.length - 1 }),
        (index) => {
          const entry = allImageEntries[index];
          const label = `${entry.source} (${entry.type})`;

          expect(
            entry.url.startsWith("/"),
            `${label}: image url "${entry.url}" should start with "/"`
          ).toBe(true);

          expect(
            entry.url.startsWith("http"),
            `${label}: image url "${entry.url}" should not start with "http"`
          ).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
