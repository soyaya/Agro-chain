import { describe, it, expect } from "vitest";
import {
  navLinks,
  buyerDashboardConfig,
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

describe("farmerDashboardConfig", () => {
  assertDashboardShape(farmerDashboardConfig, "farmerDashboardConfig");

  it("has financialServices disabled (farmers do not use loans)", () => {
    expect(farmerDashboardConfig.financialServices?.enabled).toBe(false);
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

  it("does not have a Financial Services nav item (farmers ignore loans)", () => {
    const financial = enhancedFarmerDashboardConfig.navLinks.find(
      (l) => (l as { href: string }).href === "/farmers-dashboard/financial",
    );
    expect(financial).toBeUndefined();
  });

  it("has financialServices disabled", () => {
    expect(enhancedFarmerDashboardConfig.financialServices?.enabled).toBe(false);
  });

  it("has a Wallet nav link", () => {
    const wallet = enhancedFarmerDashboardConfig.navLinks.find(
      (l) => (l as { href: string }).href === "/farmers-dashboard/wallet",
    );
    expect(wallet).toBeDefined();
  });
});

describe("enhancedClusterFarmerDashboardConfig", () => {
  assertDashboardShape(enhancedClusterFarmerDashboardConfig, "enhancedClusterFarmerDashboardConfig");

  it("has financialServices disabled (loans/credit have no backend yet)", () => {
    expect(enhancedClusterFarmerDashboardConfig.financialServices?.enabled).toBe(false);
  });

  it("links to a real Wallet page instead of the disabled Financial Services submenu", () => {
    const wallet = enhancedClusterFarmerDashboardConfig.navLinks.find(
      (l) => (l as { href: string }).href === "/cluster-dashboard/wallet",
    );
    expect(wallet).toBeDefined();
    const financial = enhancedClusterFarmerDashboardConfig.navLinks.find(
      (l) => (l as { href: string }).href === "/cluster-dashboard/financial",
    );
    expect(financial).toBeUndefined();
  });
});
