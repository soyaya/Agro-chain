// Feature: seo-metadata, Property 1: public page metadata completeness
// Validates: Requirements 2.1, 2.2, 2.5, 2.6, 2.7, 8.1

import { describe, it } from "vitest";
import * as fc from "fast-check";
import { expect } from "vitest";

import { metadata as homeMetadata } from "../../app/(main-app)/layout";
import { metadata as marketplaceMetadata } from "../../app/(main-app)/marketplace/layout";
import { generateMetadata as generateMarketplaceIdMetadata } from "../../app/(main-app)/marketplace/[id]/layout";
import { metadata as privacyMetadata } from "../../app/(main-app)/privacy/layout";
import { metadata as supportMetadata } from "../../app/(main-app)/support/layout";
import { metadata as termsMetadata } from "../../app/(main-app)/terms/layout";

type AnyMetadata = Record<string, unknown>;

// marketplace/[id] went from a static export to generateMetadata so a
// shared listing link unfurls with that specific item's own photo/price
// instead of one generic card for every listing — its no-backend-reachable
// fallback is what's checked here for the same completeness guarantees.
//
// Resolved lazily inside the test below, not at module top level — a
// top-level await here reliably crashed vitest's forked worker before it
// could even report ready (manifesting as a baffling "timeout waiting for
// worker to respond" with 0ms everywhere, no actual test code ever
// running). BASE_BACKEND_URL is blanked for the call so generateMetadata
// takes its no-backend-reachable fallback path deterministically, rather
// than attempting a real network call against whatever a local .env points at.
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

const pageNames = [
  "home (/)",
  "marketplace (/marketplace)",
  "marketplace detail (/marketplace/[id])",
  "privacy (/privacy)",
  "support (/support)",
  "terms (/terms)",
];

describe("Public page metadata — Property 1: completeness", () => {
  it(
    "every public page metadata object has all required SEO and social fields",
    async () => {
      const marketplaceIdMetadata = await getMarketplaceIdMetadata();
      const publicPageMetadata: AnyMetadata[] = [
        homeMetadata as AnyMetadata,
        marketplaceMetadata as AnyMetadata,
        marketplaceIdMetadata,
        privacyMetadata as AnyMetadata,
        supportMetadata as AnyMetadata,
        termsMetadata as AnyMetadata,
      ];

      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: publicPageMetadata.length - 1 }),
          (index) => {
            const meta = publicPageMetadata[index];
            const name = pageNames[index];

            // Non-empty title
            const title = meta.title;
            expect(title, `${name}: title should be a non-empty string`).toBeTruthy();
            expect(typeof title, `${name}: title should be a string`).toBe("string");
            expect((title as string).length, `${name}: title should not be empty`).toBeGreaterThan(0);

            // Non-empty description
            const description = meta.description;
            expect(description, `${name}: description should be a non-empty string`).toBeTruthy();
            expect(typeof description, `${name}: description should be a string`).toBe("string");
            expect((description as string).length, `${name}: description should not be empty`).toBeGreaterThan(0);

            // Non-empty keywords array
            const keywords = meta.keywords;
            expect(keywords, `${name}: keywords should be defined`).toBeDefined();
            expect(Array.isArray(keywords), `${name}: keywords should be an array`).toBe(true);
            expect((keywords as unknown[]).length, `${name}: keywords should not be empty`).toBeGreaterThan(0);

            // robots.index === true
            const robots = meta.robots as { index: boolean; follow: boolean } | undefined;
            expect(robots, `${name}: robots should be defined`).toBeDefined();
            expect(robots!.index, `${name}: robots.index should be true`).toBe(true);

            // robots.follow === true
            expect(robots!.follow, `${name}: robots.follow should be true`).toBe(true);

            // openGraph checks
            const og = meta.openGraph as Record<string, unknown> | undefined;
            expect(og, `${name}: openGraph should be defined`).toBeDefined();

            // openGraph.type === "website" OR undefined (inherited from root)
            if (og!.type !== undefined) {
              expect(og!.type, `${name}: openGraph.type should be "website"`).toBe("website");
            }

            // openGraph.locale === "en_NG" OR undefined (inherited from root)
            if (og!.locale !== undefined) {
              expect(og!.locale, `${name}: openGraph.locale should be "en_NG"`).toBe("en_NG");
            }

            // Non-empty openGraph.url
            const ogUrl = og!.url;
            expect(ogUrl, `${name}: openGraph.url should be defined`).toBeDefined();
            expect(typeof ogUrl, `${name}: openGraph.url should be a string`).toBe("string");
            expect((ogUrl as string).length, `${name}: openGraph.url should not be empty`).toBeGreaterThan(0);

            // twitter.card === "summary_large_image" OR undefined (inherited from root)
            const twitter = meta.twitter as Record<string, unknown> | undefined;
            if (twitter !== undefined && twitter.card !== undefined) {
              expect(
                twitter.card,
                `${name}: twitter.card should be "summary_large_image"`
              ).toBe("summary_large_image");
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
