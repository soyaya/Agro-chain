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
};
