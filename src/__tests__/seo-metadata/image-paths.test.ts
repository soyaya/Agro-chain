// Feature: seo-metadata, Property 4: image paths are relative
// Validates: Requirement 7.4

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { metadata as rootMetadata } from "../../app/layout";
import { metadata as marketplaceMetadata } from "../../app/(main-app)/marketplace/layout";
import { generateMetadata as generateMarketplaceIdMetadata } from "../../app/(main-app)/marketplace/[id]/layout";

// marketplace/[id]'s image is a specific listing's own photo (Cloudinary),
// fetched per-request via generateMetadata — genuinely external/absolute by
// design, unlike every other page here, which only ever references this
// app's own static assets. Checked separately below instead of folded into
// the "must be relative" property.
//
// Resolved lazily inside the test below, not at module top level — a
// top-level await here reliably crashed vitest's forked worker before it
// could even report ready (manifesting as "timeout waiting for worker to
// respond" with 0ms everywhere, no actual test code ever running).
// BASE_BACKEND_URL is blanked for the call so generateMetadata takes its
// no-backend-reachable fallback path deterministically, rather than
// attempting a real network call against whatever a local .env points at.
type AnyMetadata = Record<string, unknown>;

async function getMarketplaceIdMetadata(): Promise<AnyMetadata> {
  const realBaseBackendUrl = process.env.BASE_BACKEND_URL;
  process.env.BASE_BACKEND_URL = "";
  try {
    return (await generateMarketplaceIdMetadata({
      params: Promise.resolve({ id: "test-listing-id" }),
    })) as AnyMetadata;
  } finally {
    process.env.BASE_BACKEND_URL = realBaseBackendUrl;
  }
}

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
];

describe("Image paths — Property 4: OG and Twitter image paths are relative", () => {
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

  it("marketplace/[id]'s own listing-photo image is a valid absolute https URL (external by design, not a local asset)", async () => {
    const marketplaceIdMetadata = await getMarketplaceIdMetadata();
    const marketplaceIdImageEntries = extractImageUrls(marketplaceIdMetadata, "marketplace/[id] layout");
    expect(marketplaceIdImageEntries.length).toBeGreaterThan(0);
    for (const entry of marketplaceIdImageEntries) {
      expect(entry.url.startsWith("https://"), `${entry.source} (${entry.type}): "${entry.url}" should be an absolute https URL`).toBe(true);
    }
  });
});
