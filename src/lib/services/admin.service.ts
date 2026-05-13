import { apiFetch } from "~/lib/api";

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
      newRegistrations: Array<{ id: string; full_name: string; role: string; created_at: string }>;
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
  phone_number: string;
  location_state: string;
  location_lga: string;
  created_at: string;
}

export interface AdminClusterApplicationsResponse {
  status: string;
  data: {
    applications: AdminClusterApplication[];
  };
}

// === Demand types

export type AdminDemandStatus = "pending" | "assigned" | "accepted" | "declined" | "fulfilled" | "cancelled";

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

export const adminService = {
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
    return apiFetch<AdminClusterApplicationsResponse>("/admin/cluster-applications");
  },

  approveClusterApplication(id: string) {
    return apiFetch(`/admin/cluster-applications/${id}/approve`, { method: "PUT" });
  },

  rejectClusterApplication(id: string) {
    return apiFetch(`/admin/cluster-applications/${id}/reject`, { method: "PUT" });
  },

  // === Demands

  getDemands(params?: { status?: string; state?: string }) {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
    return apiFetch<{ status: string; data: { demands: AdminDemand[] } }>(`/admin/demands${query}`);
  },

  getDemand(id: string) {
    return apiFetch<{ status: string; data: { demand: AdminDemand } }>(`/admin/demands/${id}`);
  },

  assignDemand(id: string, clusterFarmerId: string) {
    return apiFetch(`/admin/demands/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ cluster_farmer_id: clusterFarmerId }),
    });
  },

  getClusterFarmers() {
    return apiFetch<{ status: string; data: { farmers: AdminClusterFarmerOption[] } }>("/admin/farmers?role=cluster");
  },

  // === Orders

  getOrders(params?: { status?: string; paymentStatus?: string }) {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
    return apiFetch<{ status: string; data: { orders: AdminOrder[] } }>(`/admin/orders${query}`);
  },

  getOrder(id: string) {
    return apiFetch<{ status: string; data: { order: AdminOrder } }>(`/admin/orders/${id}`);
  },
};
