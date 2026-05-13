import { apiFetch } from "~/lib/api";
import type { BackendListing } from "./farmer.service";

// === Types

export interface BackendClusterOrder {
  orderId: string;
  buyerName: string;
  buyerPhone: string;
  fishType: string;
  variant?: string;
  processed?: boolean;
  weightKg: number;
  quantity: number;
  deliveryOption: string;
  status: string;
  createdAt: string;
}

export interface BackendClusterFarmer {
  farmerName: string;
  fishType: string;
  totalListings: number;
  totalApprovedListings: number;
  totalPendingListings: number;
  farmName?: string;
  location: string;
  phoneNumber: string;
  emailAddress: string;
  capacity?: number;
  experience?: number;
  memberSince: string;
  lastActive: string;
}

export interface BackendActivity {
  id: string;
  description: string;
  type: string;
  created_at: string;
}

export interface ClusterListingSummary {
  farmersUnderMe: number;
  pendingApproval: number;
  allListings: number;
  totalSupply: number;
}

export interface ClusterListingRecord {
  id: string;
  farmerId: string;
  fishType: string;
  location: string;
  harvestDate: string;
  listedDate: string;
  totalFishAvailable: number;
  packaging: { weightKg: number; quantity: number };
  status: "approved" | "pending" | "rejected";
}

export interface UpdateClusterProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  clusterName?: string;
  location?: string;
}

export type DemandStatus = "pending" | "assigned" | "accepted" | "declined" | "fulfilled" | "cancelled";

export interface BackendDemand {
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
  status: DemandStatus;
  assignedAt?: string;
  acceptedAt?: string;
  fulfilledAt?: string;
  createdAt: string;
}

// === Cluster Service

export const clusterService = {
  /** Update the cluster manager's profile. */
  updateProfile(data: UpdateClusterProfilePayload) {
    return apiFetch("/cluster/account-profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /** Get all listings managed by this cluster. */
  getListings() {
    return apiFetch<{ status: string; data: { summary: ClusterListingSummary; listings: ClusterListingRecord[] } }>(
      "/cluster/listings/get",
    );
  },

  /** Get recent cluster activities. */
  getCurrentActivities() {
    return apiFetch<{ status: string; data: { activities: BackendActivity[] } }>(
      "/cluster/current-activities",
    );
  },

  /** Get pending farmer listing submissions awaiting approval. */
  getPendingApprovals() {
    return apiFetch<{
      status: string; data: {
        listings: Array<{
          id: string;
          fishType: string;
          farmerName: string;
          harvestDate: string;
          listedDate: string;
          totalFishAvailable: number;
          packaging: { weightKg: number; quantity: number };
          createdAt: string;
          updatedAt: string;
        }>
      }
    }>(
      "/cluster/pending-approvals",
    );
  },

  /** Approve or reject a pending listing. */
  reviewListing(listingId: string, status: "approved" | "rejected", rejectionReason?: string) {
    return apiFetch(`/cluster/pending-approvals/${listingId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, ...(rejectionReason ? { rejectionReason } : {}) }),
    });
  },

  /** Get all farmers under this cluster. */
  getFarmers() {
    return apiFetch<{ status: string; data: { summary: { totalFarmers: number; totalFarmersCapacity: number; locationCovering: number }; farmers: BackendClusterFarmer[] } }>(
      "/cluster/farmers",
    );
  },

  /** Get all orders routed through this cluster. */
  getOrders() {
    return apiFetch<{ status: string; data: { orders: BackendClusterOrder[] } }>(
      "/cluster/orders",
    );
  },

  /** Update the status of a cluster order. */
  updateOrderStatus(orderId: string, status: string) {
    return apiFetch(`/cluster/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  /** Get payout history for the cluster. */
  getPayouts() {
    return apiFetch<{
      status: string;
      data: {
        payouts: unknown[];
        totalClusterEarnings: number;
        pendingPayouts: number;
      };
    }>("/cluster/payouts");
  },

  // === Demands

  /** Get demands assigned to this cluster farmer. */
  getDemands() {
    return apiFetch<{ status: string; data: { demands: BackendDemand[] } }>("/cluster/demands");
  },

  /** Accept a demand. */
  acceptDemand(demandId: string) {
    return apiFetch(`/cluster/demands/${demandId}/accept`, { method: "PATCH" });
  },

  /** Decline a demand with optional reason. */
  declineDemand(demandId: string, reason?: string) {
    return apiFetch(`/cluster/demands/${demandId}/decline`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  /** Mark a demand as fulfilled. */
  fulfillDemand(demandId: string) {
    return apiFetch(`/cluster/demands/${demandId}/fulfill`, { method: "PATCH" });
  },
};
