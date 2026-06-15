import { apiFetch } from "~/lib/api";

// === Platform Settings types

export interface FishPriceConfig {
  fingerlings: number;
  juveniles: number;
  table_size: number;
  jumbo: number;
  parent_stocks: number;
  dried: number;
  grilled: number;
  peppersoup: number;
  peppered: number;
  smoked: number;
}

export interface PlatformSettings {
  pricePerKg: FishPriceConfig;
  updatedAt: string;
  updatedBy: string | null;
}

export interface PlatformSettingsResponse {
  status: string;
  data: {
    settings: PlatformSettings;
  };
}

export interface AdminMetricResponse {
  status: string;
  data: {
    metrics: {
      totalUsers: number;
      newUsersToday: number;
      activeListings: number;
      ordersToday: number;
      transactionVolume: number;
      platformRevenue: number;
    };
  };
}

export interface AdminChartsResponse {
  status: string;
  data: {
    charts: {
      ordersByStatus: Array<{ status: string; _count: { id: number } }>;
      popularFishTypes: Array<{ fish_type: string; _count: { id: number } }>;
    };
  };
}

export interface AdminActivityResponse {
  status: string;
  data: {
    recentActivities: {
      newRegistrations: Array<{
        id: string;
        full_name: string;
        role: string;
        created_at: string;
      }>;
      newOrders: Array<{
        id: string;
        status: string;
        created_at: string;
        buyer?: { full_name: string };
        farmer?: { full_name: string };
      }>;
    };
  };
}

export interface AdminClusterApplication {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  location_state: string;
  location_lga: string;
  location_address: string;
  business_name: string | null;
  cac_number: string | null;
  warehouse_location: string | null;
  distribution_capacity: number | null;
  logistics_available: boolean | null;
  bvn_doc_url: string | null;
  proof_of_address_url: string | null;
  cac_registration_url: string | null;
  business_license_url: string | null;
  tax_clearance_url: string | null;
  fish_type_preference: string | null;
  farming_capacity_kg: number | null;
  years_of_experience: number | null;
  created_at: string;
}

export interface AdminClusterApplicationsResponse {
  status: string;
  data: {
    applications: AdminClusterApplication[];
  };
}

// === Demand types

export type AdminDemandStatus =
  | "pending"
  | "assigned"
  | "accepted"
  | "declined"
  | "fulfilled"
  | "cancelled";

export interface AdminDemand {
  id: string;
  buyerName: string;
  buyerPhone?: string;
  fishType: string;
  weightKg: number;
  fishVariant: string;
  locationState: string;
  locationLga: string;
  deliveryAddress: string;
  notes?: string;
  status: AdminDemandStatus;
  assignedClusterFarmerName?: string;
  assignedAt?: string;
  createdAt: string;
}

export interface AdminClusterFarmerOption {
  id: string;
  fullName: string;
  businessName?: string;
  locationState: string;
  locationLga: string;
}

// === Order types

export interface AdminOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  clusterFarmerName: string;
  totalAmount: number;
  grandTotal: number;
  status: string;
  paymentStatus: string;
  orderType: "direct" | "demand";
  createdAt: string;
}

// === User / Farmer types

export interface AdminUser {
  id: string;
  full_name: string;
  email?: string;
  phone_number: string;
  role: "farmer" | "cluster" | "buyer" | "admin" | "pending";
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  location_state: string;
  location_lga: string;
  is_active: boolean;
  is_cluster_farmer: boolean;
  cluster_approved: boolean;
  farm_name?: string;
  business_name?: string;
  created_at: string;
}

// === Listing types

export interface AdminListing {
  id: string;
  fishType: string;
  quantityAvailable: number;
  totalAvailableKg: number;
  pricePerKg: number;
  clusterFarmerName: string;
  locationState: string;
  locationLga: string;
  status: string;
  clusterApproved: boolean;
  createdAt: string;
}

export const adminService = {
  // === Platform Settings

  getSettings() {
    return apiFetch<PlatformSettingsResponse>("/admin/settings");
  },

  updatePrices(pricePerKg: Partial<FishPriceConfig>) {
    return apiFetch<PlatformSettingsResponse>("/admin/settings/price", {
      method: "PATCH",
      body: JSON.stringify({ pricePerKg }),
    });
  },

  getMetrics() {
    return apiFetch<AdminMetricResponse>("/admin/dashboard/metrics");
  },

  getCharts() {
    return apiFetch<AdminChartsResponse>("/admin/dashboard/charts");
  },

  getRecentActivities() {
    return apiFetch<AdminActivityResponse>("/admin/dashboard/activities");
  },

  getClusterApplications() {
    return apiFetch<AdminClusterApplicationsResponse>(
      "/admin/cluster-applications",
    );
  },

  approveClusterApplication(id: string) {
    return apiFetch(`/admin/cluster-applications/${id}/approve`, {
      method: "PUT",
    });
  },

  rejectClusterApplication(id: string) {
    return apiFetch(`/admin/cluster-applications/${id}/reject`, {
      method: "PUT",
    });
  },

  // === Demands

  getDemands(params?: { status?: string; state?: string }) {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    return apiFetch<{ status: string; data: { demands: AdminDemand[] } }>(
      `/admin/demands${query}`,
    );
  },

  getDemand(id: string) {
    return apiFetch<{ status: string; data: { demand: AdminDemand } }>(
      `/admin/demands/${id}`,
    );
  },

  assignDemand(id: string, clusterFarmerId: string) {
    return apiFetch(`/admin/demands/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ cluster_farmer_id: clusterFarmerId }),
    });
  },

  getClusterFarmers() {
    return apiFetch<{
      status: string;
      data: { farmers: AdminClusterFarmerOption[] };
    }>("/admin/farmers?role=cluster");
  },

  // === Orders

  getOrders(params?: { status?: string; paymentStatus?: string }) {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    return apiFetch<{ status: string; data: { orders: AdminOrder[] } }>(
      `/admin/orders${query}`,
    );
  },

  getOrder(id: string) {
    return apiFetch<{ status: string; data: { order: AdminOrder } }>(
      `/admin/orders/${id}`,
    );
  },

  // === Farmers / Users

  getFarmers(params?: {
    role?: string;
    state?: string;
    verificationStatus?: string;
  }) {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    return apiFetch<{
      status: string;
      data: { users: AdminUser[]; total: number };
    }>(`/admin/farmers${query}`);
  },

  getFarmer(id: string) {
    return apiFetch<{ status: string; data: { user: AdminUser } }>(
      `/admin/farmers/${id}`,
    );
  },

  toggleUserActive(id: string) {
    return apiFetch(`/admin/farmers/${id}/toggle-active`, { method: "PATCH" });
  },

  // === Listings

  getListings(params?: { status?: string; fishType?: string; state?: string }) {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    return apiFetch<{
      status: string;
      data: { listings: AdminListing[]; total: number };
    }>(`/admin/listings${query}`);
  },

  approveListing(id: string) {
    return apiFetch(`/admin/listings/${id}/approve`, { method: "PUT" });
  },

  rejectListing(id: string, reason?: string) {
    return apiFetch(`/admin/listings/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason: reason ?? "Rejected by admin" }),
    });
  },

  flagListing(id: string) {
    return apiFetch(`/admin/listings/${id}/flag`, { method: "PATCH" });
  },

  removeListing(id: string) {
    return apiFetch(`/admin/listings/${id}`, { method: "DELETE" });
  },
};
