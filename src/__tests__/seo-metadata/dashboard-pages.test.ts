// Feature: seo-metadata, Property 3: dashboard page metadata correctness
// Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 8.4

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// Buyers dashboard layouts
import { metadata as buyersDashMetadata } from "../../app/(dasboards)/buyers-dashboard/layout";
import { metadata as buyersOrdersMetadata } from "../../app/(dasboards)/buyers-dashboard/orders/layout";
import { metadata as buyersOrdersIdMetadata } from "../../app/(dasboards)/buyers-dashboard/orders/[id]/layout";
import { metadata as buyersProfileMetadata } from "../../app/(dasboards)/buyers-dashboard/profile/layout";
import { metadata as buyersSavedMetadata } from "../../app/(dasboards)/buyers-dashboard/saved/layout";

// Farmers dashboard layouts
import { metadata as farmersDashMetadata } from "../../app/(dasboards)/farmers-dashboard/layout";
import { metadata as farmersListingsMetadata } from "../../app/(dasboards)/farmers-dashboard/listings/layout";
import { metadata as farmersListingsCreateMetadata } from "../../app/(dasboards)/farmers-dashboard/listings/create/layout";
import { metadata as farmersProfileMetadata } from "../../app/(dasboards)/farmers-dashboard/profile/layout";
import { metadata as farmersFinancialMetadata } from "../../app/(dasboards)/farmers-dashboard/financial/layout";
import { metadata as farmersLoansMetadata } from "../../app/(dasboards)/farmers-dashboard/financial/loans/layout";
import { metadata as farmersLoansIdMetadata } from "../../app/(dasboards)/farmers-dashboard/financial/loans/[id]/layout";
import { metadata as farmersCreditMetadata } from "../../app/(dasboards)/farmers-dashboard/financial/credit/layout";
import { metadata as farmersCreditIdMetadata } from "../../app/(dasboards)/farmers-dashboard/financial/credit/[id]/layout";
import { metadata as farmersPaymentsMetadata } from "../../app/(dasboards)/farmers-dashboard/financial/payments/layout";
import { metadata as farmersFinancialProfileMetadata } from "../../app/(dasboards)/farmers-dashboard/financial/profile/layout";

// Cluster dashboard layouts
import { metadata as clusterDashMetadata } from "../../app/(dasboards)/cluster-dashboard/layout";
import { metadata as clusterListingsMetadata } from "../../app/(dasboards)/cluster-dashboard/listings/layout";
import { metadata as clusterPendingMetadata } from "../../app/(dasboards)/cluster-dashboard/pending-approvals/layout";
import { metadata as clusterOrdersMetadata } from "../../app/(dasboards)/cluster-dashboard/orders/layout";
import { metadata as clusterProfileMetadata } from "../../app/(dasboards)/cluster-dashboard/profile/layout";
import { metadata as clusterFinancialMetadata } from "../../app/(dasboards)/cluster-dashboard/financial/layout";
import { metadata as clusterLoansMetadata } from "../../app/(dasboards)/cluster-dashboard/financial/loans/layout";
import { metadata as clusterLoansIdMetadata } from "../../app/(dasboards)/cluster-dashboard/financial/loans/[id]/layout";
import { metadata as clusterCreditMetadata } from "../../app/(dasboards)/cluster-dashboard/financial/credit/layout";
import { metadata as clusterCreditIdMetadata } from "../../app/(dasboards)/cluster-dashboard/financial/credit/[id]/layout";
import { metadata as clusterPaymentsMetadata } from "../../app/(dasboards)/cluster-dashboard/financial/payments/layout";
import { metadata as clusterFinancialProfileMetadata } from "../../app/(dasboards)/cluster-dashboard/financial/profile/layout";
import { metadata as clusterFarmersMetadata } from "../../app/(dasboards)/cluster-dashboard/financial/farmers/layout";
import { metadata as clusterFarmersIdMetadata } from "../../app/(dasboards)/cluster-dashboard/financial/farmers/[id]/layout";

type AnyMetadata = Record<string, unknown>;

const dashboardPageMetadata: AnyMetadata[] = [
  // Buyers
  buyersDashMetadata as AnyMetadata,
  buyersOrdersMetadata as AnyMetadata,
  buyersOrdersIdMetadata as AnyMetadata,
  buyersProfileMetadata as AnyMetadata,
  buyersSavedMetadata as AnyMetadata,
  // Farmers
  farmersDashMetadata as AnyMetadata,
  farmersListingsMetadata as AnyMetadata,
  farmersListingsCreateMetadata as AnyMetadata,
  farmersProfileMetadata as AnyMetadata,
  farmersFinancialMetadata as AnyMetadata,
  farmersLoansMetadata as AnyMetadata,
  farmersLoansIdMetadata as AnyMetadata,
  farmersCreditMetadata as AnyMetadata,
  farmersCreditIdMetadata as AnyMetadata,
  farmersPaymentsMetadata as AnyMetadata,
  farmersFinancialProfileMetadata as AnyMetadata,
  // Cluster
  clusterDashMetadata as AnyMetadata,
  clusterListingsMetadata as AnyMetadata,
  clusterPendingMetadata as AnyMetadata,
  clusterOrdersMetadata as AnyMetadata,
  clusterProfileMetadata as AnyMetadata,
  clusterFinancialMetadata as AnyMetadata,
  clusterLoansMetadata as AnyMetadata,
  clusterLoansIdMetadata as AnyMetadata,
  clusterCreditMetadata as AnyMetadata,
  clusterCreditIdMetadata as AnyMetadata,
  clusterPaymentsMetadata as AnyMetadata,
  clusterFinancialProfileMetadata as AnyMetadata,
  clusterFarmersMetadata as AnyMetadata,
  clusterFarmersIdMetadata as AnyMetadata,
];

const pageNames = [
  "buyers-dashboard",
  "buyers-dashboard/orders",
  "buyers-dashboard/orders/[id]",
  "buyers-dashboard/profile",
  "buyers-dashboard/saved",
  "farmers-dashboard",
  "farmers-dashboard/listings",
  "farmers-dashboard/listings/create",
  "farmers-dashboard/profile",
  "farmers-dashboard/financial",
  "farmers-dashboard/financial/loans",
  "farmers-dashboard/financial/loans/[id]",
  "farmers-dashboard/financial/credit",
  "farmers-dashboard/financial/credit/[id]",
  "farmers-dashboard/financial/payments",
  "farmers-dashboard/financial/profile",
  "cluster-dashboard",
  "cluster-dashboard/listings",
  "cluster-dashboard/pending-approvals",
  "cluster-dashboard/orders",
  "cluster-dashboard/profile",
  "cluster-dashboard/financial",
  "cluster-dashboard/financial/loans",
  "cluster-dashboard/financial/loans/[id]",
  "cluster-dashboard/financial/credit",
  "cluster-dashboard/financial/credit/[id]",
  "cluster-dashboard/financial/payments",
  "cluster-dashboard/financial/profile",
  "cluster-dashboard/financial/farmers",
  "cluster-dashboard/financial/farmers/[id]",
];

describe("Dashboard page metadata - Property 3: correctness", () => {
  it("every dashboard page metadata has robots noindex/nofollow, title, description, and no openGraph or twitter", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: dashboardPageMetadata.length - 1 }),
        (index) => {
          const meta = dashboardPageMetadata[index];
          const name = pageNames[index];

          // robots.index === false
          const robots = meta.robots as { index: boolean; follow: boolean } | undefined;
          expect(robots, `${name}: robots should be defined`).toBeDefined();
          expect(robots!.index, `${name}: robots.index should be false`).toBe(false);
          expect(robots!.follow, `${name}: robots.follow should be false`).toBe(false);

          // Non-empty title (string or title.default)
          const title = meta.title;
          expect(title, `${name}: title should be defined`).toBeDefined();
          if (typeof title === "string") {
            expect(title.length, `${name}: title string should not be empty`).toBeGreaterThan(0);
          } else {
            const titleObj = title as { default?: string; template?: string };
            expect(titleObj.default, `${name}: title.default should be defined`).toBeDefined();
            expect((titleObj.default as string).length, `${name}: title.default should not be empty`).toBeGreaterThan(0);
          }

          // Non-empty description
          const description = meta.description;
          expect(description, `${name}: description should be defined`).toBeDefined();
          expect(typeof description, `${name}: description should be a string`).toBe("string");
          expect((description as string).length, `${name}: description should not be empty`).toBeGreaterThan(0);

          // openGraph must be absent
          expect(meta.openGraph, `${name}: openGraph should be absent on dashboard pages`).toBeUndefined();

          // twitter must be absent
          expect(meta.twitter, `${name}: twitter should be absent on dashboard pages`).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Unit tests for buyers dashboard layout completeness (Task 9.2)
describe("Buyers dashboard layout completeness", () => {
  it("buyers-dashboard/layout.tsx exports title.template and robots noindex", () => {
    const meta = buyersDashMetadata as AnyMetadata;
    const title = meta.title as { template: string; default: string };
    expect(title.template).toBeDefined();
    expect(title.template.length).toBeGreaterThan(0);
    const robots = meta.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });

  it("buyers-dashboard/orders/layout.tsx exports title and description", () => {
    const meta = buyersOrdersMetadata as AnyMetadata;
    expect(typeof meta.title).toBe("string");
    expect((meta.title as string).length).toBeGreaterThan(0);
    expect(typeof meta.description).toBe("string");
    expect((meta.description as string).length).toBeGreaterThan(0);
  });

  it("buyers-dashboard/orders/[id]/layout.tsx exports title and description", () => {
    const meta = buyersOrdersIdMetadata as AnyMetadata;
    expect(typeof meta.title).toBe("string");
    expect((meta.title as string).length).toBeGreaterThan(0);
    expect(typeof meta.description).toBe("string");
    expect((meta.description as string).length).toBeGreaterThan(0);
  });

  it("buyers-dashboard/profile/layout.tsx exports title and description", () => {
    const meta = buyersProfileMetadata as AnyMetadata;
    expect(typeof meta.title).toBe("string");
    expect((meta.title as string).length).toBeGreaterThan(0);
    expect(typeof meta.description).toBe("string");
    expect((meta.description as string).length).toBeGreaterThan(0);
  });

  it("buyers-dashboard/saved/layout.tsx exports title and description", () => {
    const meta = buyersSavedMetadata as AnyMetadata;
    expect(typeof meta.title).toBe("string");
    expect((meta.title as string).length).toBeGreaterThan(0);
    expect(typeof meta.description).toBe("string");
    expect((meta.description as string).length).toBeGreaterThan(0);
  });
});
