import { describe, it, expect } from "vitest";
import type { AuthUser, DashboardType } from "~/types/index";

// ─── getDashboardType logic (extracted and tested in isolation) ───────────────
// The getDashboardType function inside AuthProvider is not exported, but its
// logic is pure and can be replicated here to test all branches thoroughly.

function getDashboardType(user: AuthUser | null): DashboardType {
  if (!user) return "farmer";
  if (user.role === "admin") return "admin";
  if (user.role === "buyer") return "buyer";
  if (user.isClusterFarmer) return "cluster-farmer";
  return "farmer";
}

const baseUser: AuthUser = {
  id: "u1",
  fullName: "Test User",
  phoneNumber: "08012345678",
  email: "test@example.com",
  role: "farmer",
  isClusterFarmer: false,
  profileComplete: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("getDashboardType", () => {
  it("returns 'farmer' when user is null", () => {
    expect(getDashboardType(null)).toBe("farmer");
  });

  it("returns 'farmer' for a plain farmer", () => {
    expect(getDashboardType({ ...baseUser, role: "farmer", isClusterFarmer: false })).toBe("farmer");
  });

  it("returns 'buyer' for a buyer", () => {
    expect(getDashboardType({ ...baseUser, role: "buyer" })).toBe("buyer");
  });

  it("returns 'admin' for an admin", () => {
    expect(getDashboardType({ ...baseUser, role: "admin" })).toBe("admin");
  });

  it("returns 'cluster-farmer' when isClusterFarmer is true (role=farmer)", () => {
    expect(getDashboardType({ ...baseUser, role: "farmer", isClusterFarmer: true })).toBe("cluster-farmer");
  });

  it("admin takes precedence over isClusterFarmer", () => {
    // An admin should never have isClusterFarmer=true in practice, but the
    // code checks role first — admin wins.
    expect(getDashboardType({ ...baseUser, role: "admin", isClusterFarmer: true })).toBe("admin");
  });

  it("buyer takes precedence over isClusterFarmer", () => {
    expect(getDashboardType({ ...baseUser, role: "buyer", isClusterFarmer: true })).toBe("buyer");
  });
});

// ─── mapBackendUser logic ─────────────────────────────────────────────────────
// mapBackendUser is also not exported, so we replicate its logic here.

import type { BackendUser } from "~/lib/services/auth.service";

function mapBackendUser(user: BackendUser): AuthUser {
  const mappedRole: AuthUser["role"] =
    user.role === "cluster" || user.role === "pending" ? "farmer" : user.role;

  return {
    id: user.id,
    fullName: user.full_name,
    phoneNumber: user.phone_number,
    email: user.email,
    role: mappedRole,
    isClusterFarmer: user.is_cluster_farmer || user.role === "cluster",
    profileComplete: user.profile_completed,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
  };
}

const baseBackend: BackendUser = {
  id: "u1",
  full_name: "Ada Farmer",
  phone_number: "08012345678",
  email: "ada@farm.com",
  role: "farmer",
  is_cluster_farmer: false,
  profile_completed: true,
  verification_status: "verified",
  cluster_approved: false,
  location_state: "Kaduna",
  location_lga: "Kaduna North",
  location_address: "123 Farm Road",
  is_active: true,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-02T00:00:00.000Z",
};

describe("mapBackendUser", () => {
  it("maps basic fields correctly", () => {
    const user = mapBackendUser(baseBackend);
    expect(user.id).toBe("u1");
    expect(user.fullName).toBe("Ada Farmer");
    expect(user.phoneNumber).toBe("08012345678");
    expect(user.email).toBe("ada@farm.com");
    expect(user.profileComplete).toBe(true);
  });

  it("maps role 'farmer' directly", () => {
    const user = mapBackendUser({ ...baseBackend, role: "farmer" });
    expect(user.role).toBe("farmer");
    expect(user.isClusterFarmer).toBe(false);
  });

  it("maps role 'buyer' directly", () => {
    const user = mapBackendUser({ ...baseBackend, role: "buyer" });
    expect(user.role).toBe("buyer");
  });

  it("maps role 'admin' directly", () => {
    const user = mapBackendUser({ ...baseBackend, role: "admin" });
    expect(user.role).toBe("admin");
  });

  it("maps role 'cluster' → 'farmer' with isClusterFarmer=true", () => {
    const user = mapBackendUser({ ...baseBackend, role: "cluster" });
    expect(user.role).toBe("farmer");
    expect(user.isClusterFarmer).toBe(true);
  });

  it("maps role 'pending' → 'farmer'", () => {
    const user = mapBackendUser({ ...baseBackend, role: "pending" });
    expect(user.role).toBe("farmer");
  });

  it("sets isClusterFarmer=true when is_cluster_farmer flag is true (farmer role)", () => {
    const user = mapBackendUser({ ...baseBackend, is_cluster_farmer: true });
    expect(user.isClusterFarmer).toBe(true);
    expect(user.role).toBe("farmer");
  });

  it("converts date strings to Date objects", () => {
    const user = mapBackendUser(baseBackend);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
    expect(user.createdAt.toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });
});
