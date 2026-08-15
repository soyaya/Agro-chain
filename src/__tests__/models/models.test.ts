import { describe, it, expect } from "vitest";
import {
  navLinks,
  buyerDashboardConfig,
  adminDashboardConfig,
  farmerDashboardConfig,
  clusterFarmerDashboardConfig,
  enhancedFarmerDashboardConfig,
  enhancedClusterFarmerDashboardConfig,
  kadunaLga,
} from "~/models/models";

// ─── navLinks ─────────────────────────────────────────────────────────────────

describe("navLinks", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(navLinks)).toBe(true);
    expect(navLinks.length).toBeGreaterThan(0);
  });

  it("every link has a label and href", () => {
    navLinks.forEach((link) => {
      expect(typeof link.label).toBe("string");
      expect(link.label.length).toBeGreaterThan(0);
      expect(typeof link.href).toBe("string");
      expect(link.href.length).toBeGreaterThan(0);
    });
  });

  it("includes a Home link pointing to /", () => {
    const home = navLinks.find((l) => l.href === "/");
    expect(home).toBeDefined();
  });
});

// ─── kadunaLga ───────────────────────────────────────────────────────────────

describe("kadunaLga", () => {
  it("has at least one LGA entry", () => {
    expect(kadunaLga.length).toBeGreaterThan(0);
  });

  it("every entry has a non-empty label and value", () => {
    kadunaLga.forEach((lga) => {
      expect(typeof lga.label).toBe("string");
      expect(lga.label.length).toBeGreaterThan(0);
      expect(typeof lga.value).toBe("string");
      expect(lga.value.length).toBeGreaterThan(0);
    });
  });

  it("includes Kaduna North and Kaduna South", () => {
    const values = kadunaLga.map((l) => l.value);
    expect(values).toContain("kaduna-north");
    expect(values).toContain("kaduna-south");
  });

  it("has no duplicate values", () => {
    const values = kadunaLga.map((l) => l.value);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

// ─── dashboard configs — shared shape assertions ──────────────────────────────

function assertDashboardShape(config: { title: string; description: string; navLinks: unknown[] }, name: string) {
  it(`${name}: has a non-empty title`, () => {
    expect(config.title.length).toBeGreaterThan(0);
  });

  it(`${name}: has a non-empty description`, () => {
    expect(config.description.length).toBeGreaterThan(0);
  });

  it(`${name}: has at least one nav link`, () => {
    expect(config.navLinks.length).toBeGreaterThan(0);
  });

  it(`${name}: every nav link has label, href, and icon`, () => {
    config.navLinks.forEach((link) => {
      const l = link as { label: string; href: string; icon: unknown };
      expect(typeof l.label).toBe("string");
      expect(typeof l.href).toBe("string");
      expect(l.icon).toBeDefined();
    });
  });
}

describe("buyerDashboardConfig", () => {
  assertDashboardShape(buyerDashboardConfig, "buyerDashboardConfig");

  it("contains a Marketplace link", () => {
    const mp = buyerDashboardConfig.navLinks.find((l) => (l as { href: string }).href === "/marketplace");
    expect(mp).toBeDefined();
  });

  it("does not have financialServices", () => {
    expect((buyerDashboardConfig as unknown as Record<string, unknown>).financialServices).toBeUndefined();
  });
});

describe("adminDashboardConfig", () => {
  assertDashboardShape(adminDashboardConfig, "adminDashboardConfig");

  it("contains a Cluster Applications link", () => {
    const apps = adminDashboardConfig.navLinks.find(
      (l) => (l as { href: string }).href === "/admin-dashboard/applications",
    );
    expect(apps).toBeDefined();
  });
});

describe("farmerDashboardConfig", () => {
  assertDashboardShape(farmerDashboardConfig, "farmerDashboardConfig");

  it("has financialServices enabled", () => {
    expect(farmerDashboardConfig.financialServices?.enabled).toBe(true);
  });
});

describe("clusterFarmerDashboardConfig", () => {
  assertDashboardShape(clusterFarmerDashboardConfig, "clusterFarmerDashboardConfig");

  it("contains a Farmers link", () => {
    const farmers = clusterFarmerDashboardConfig.navLinks.find(
      (l) => (l as { href: string }).href === "/cluster-dashboard/farmers",
    );
    expect(farmers).toBeDefined();
  });
});

describe("enhancedFarmerDashboardConfig", () => {
  assertDashboardShape(enhancedFarmerDashboardConfig, "enhancedFarmerDashboardConfig");

  it("has a Financial Services nav item with submenu", () => {
    const financial = enhancedFarmerDashboardConfig.navLinks.find(
      (l) => (l as { href: string }).href === "/farmers-dashboard/financial",
    ) as { submenu?: unknown[] } | undefined;
    expect(financial).toBeDefined();
    expect(financial?.submenu?.length).toBeGreaterThan(0);
  });

  it("financial submenu contains Loan Applications", () => {
    const financial = enhancedFarmerDashboardConfig.navLinks.find(
      (l) => (l as { href: string }).href === "/farmers-dashboard/financial",
    ) as { submenu?: Array<{ label: string }> } | undefined;
    const loans = financial?.submenu?.find((s) => s.label === "Loan Applications");
    expect(loans).toBeDefined();
  });
});

describe("enhancedClusterFarmerDashboardConfig", () => {
  assertDashboardShape(enhancedClusterFarmerDashboardConfig, "enhancedClusterFarmerDashboardConfig");

  it("financial submenu includes Farmer Finances", () => {
    const financial = enhancedClusterFarmerDashboardConfig.navLinks.find(
      (l) => (l as { href: string }).href === "/cluster-dashboard/financial",
    ) as { submenu?: Array<{ label: string }> } | undefined;
    const farmerFinances = financial?.submenu?.find((s) => s.label === "Farmer Finances");
    expect(farmerFinances).toBeDefined();
  });
});
