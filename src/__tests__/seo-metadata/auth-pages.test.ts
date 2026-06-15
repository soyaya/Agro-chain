// Feature: seo-metadata, Property 2: auth page metadata correctness
// Validates: Requirements 3.1, 3.2, 3.3, 3.4, 8.4

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { metadata as authenticationMetadata } from "../../app/(auth)/authentication/layout";
import { metadata as loginMetadata } from "../../app/(auth)/login/layout";
import { metadata as registerMetadata } from "../../app/(auth)/register/layout";
import { metadata as verifyIdentityMetadata } from "../../app/(auth)/verify/layout";

type AnyMetadata = Record<string, unknown>;

const authPageMetadata: AnyMetadata[] = [
  authenticationMetadata as AnyMetadata,
  loginMetadata as AnyMetadata,
  registerMetadata as AnyMetadata,
  verifyIdentityMetadata as AnyMetadata,
];

const pageNames = [
  "authentication (/authentication)",
  "login (/login)",
  "register (/register)",
  "verify-identity (/verify-identity)",
];

describe("Auth page metadata - Property 2: correctness", () => {
  it("every auth page metadata object has robots noindex/nofollow and no keywords", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: authPageMetadata.length - 1 }),
        (index) => {
          const meta = authPageMetadata[index];
          const name = pageNames[index];

          // robots.index === false
          const robots = meta.robots as
            | { index: boolean; follow: boolean }
            | undefined;
          expect(robots, `${name}: robots should be defined`).toBeDefined();
          expect(robots!.index, `${name}: robots.index should be false`).toBe(
            false,
          );

          // robots.follow === false
          expect(robots!.follow, `${name}: robots.follow should be false`).toBe(
            false,
          );

          // Non-empty title
          const title = meta.title;
          expect(title, `${name}: title should be defined`).toBeDefined();
          expect(typeof title, `${name}: title should be a string`).toBe(
            "string",
          );
          expect(
            (title as string).length,
            `${name}: title should not be empty`,
          ).toBeGreaterThan(0);

          // Non-empty description
          const description = meta.description;
          expect(
            description,
            `${name}: description should be defined`,
          ).toBeDefined();
          expect(
            typeof description,
            `${name}: description should be a string`,
          ).toBe("string");
          expect(
            (description as string).length,
            `${name}: description should not be empty`,
          ).toBeGreaterThan(0);

          // openGraph fields
          const og = meta.openGraph as Record<string, unknown> | undefined;
          expect(og, `${name}: openGraph should be defined`).toBeDefined();

          // Non-empty openGraph.title
          expect(
            og!.title,
            `${name}: openGraph.title should be defined`,
          ).toBeDefined();
          expect(
            typeof og!.title,
            `${name}: openGraph.title should be a string`,
          ).toBe("string");
          expect(
            (og!.title as string).length,
            `${name}: openGraph.title should not be empty`,
          ).toBeGreaterThan(0);

          // Non-empty openGraph.description
          expect(
            og!.description,
            `${name}: openGraph.description should be defined`,
          ).toBeDefined();
          expect(
            typeof og!.description,
            `${name}: openGraph.description should be a string`,
          ).toBe("string");
          expect(
            (og!.description as string).length,
            `${name}: openGraph.description should not be empty`,
          ).toBeGreaterThan(0);

          // Non-empty openGraph.url
          expect(
            og!.url,
            `${name}: openGraph.url should be defined`,
          ).toBeDefined();
          expect(
            typeof og!.url,
            `${name}: openGraph.url should be a string`,
          ).toBe("string");
          expect(
            (og!.url as string).length,
            `${name}: openGraph.url should not be empty`,
          ).toBeGreaterThan(0);

          // keywords must be absent
          expect(
            meta.keywords,
            `${name}: keywords should be absent on auth pages`,
          ).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });
});
