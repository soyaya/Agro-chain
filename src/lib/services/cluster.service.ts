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
  fulfillmentStage: string;
  fulfillmentMethod: "pickup" | "delivery";
  assignedRiderId: string | null;
  createdAt: string;
}

export interface ApprovedRider {
  id: string;
  full_name: string;
  phone_number: string;
  rider_approved_at: string | null;
  activeDeliveries: number;
  completedDeliveries: number;
  lastActiveAt: string | null;
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
  businessName?: string;
  state?: string;
  localGovernment?: string;
  ward?: string;
  subCommunity?: string;
  latitude?: number;
  longitude?: number;
}

export interface PendingRider {
  id: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  location_lga: string;
  location_ward?: string | null;
  location_sub_community?: string | null;
  created_at: string;
}

export type DemandStatus = "pending" | "assigned" | "accepted" | "declined" | "fulfilled" | "cancelled";

export interface BackendDemand {
  id: string;
  buyerName: string;
  buyerPhone?: string;
  fishType: string;
  weightKg?: number;
  quantityPieces?: number;
  fishVariant: string;
  grandTotal: number;
  fulfillmentStage: string;
  fulfillmentMethod: "pickup" | "delivery";
  assignedRiderId?: string;
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

  /** Get payout history for the cluster. */
  getPayouts() {
    return apiFetch<{
      status: string;
      data: {
        payouts: Array<{
          payoutId: string;
          orderId: string | null;
          demandId: string | null;
          amount: number;
          scheduledFor: string;
          status: "pending" | "processing" | "paid" | "failed";
          createdAt: string;
        }>;
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

  /** Mark an accepted, pickup-method demand as ready for pickup. */
  markDemandReadyForPickup(demandId: string) {
    return apiFetch(`/cluster/demands/${demandId}/ready-for-pickup`, { method: "PATCH" });
  },

  /** Escalate an accepted, delivery-method demand to a rider. */
  escalateDemandToRider(demandId: string, riderId: string) {
    return apiFetch(`/cluster/demands/${demandId}/escalate`, {
      method: "PATCH",
      body: JSON.stringify({ riderId }),
    });
  },

  // === Riders

  /** Get riders awaiting approval in this cluster farmer's region. */
  getPendingRiders() {
    return apiFetch<{ status: string; data: { riders: PendingRider[] } }>("/cluster/riders/pending");
  },

  /** Get approved riders in this cluster farmer's region (for escalating a delivery). */
  getApprovedRiders() {
    return apiFetch<{ status: string; data: { riders: ApprovedRider[] } }>("/cluster/riders/approved");
  },

  /** Approve or reject a rider in-region. */
  reviewRider(riderId: string, status: "approved" | "rejected") {
    return apiFetch(`/cluster/riders/${riderId}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // === Order Fulfillment

  /** Pass on an order before taking physical custody — makes it eligible for a procurement officer to claim. */
  declineOrder(orderId: string, reason?: string) {
    return apiFetch(`/cluster/orders/${orderId}/decline`, { method: "PATCH", body: JSON.stringify({ reason }) });
  },

  /** Confirm physical receipt of a farmer's dispatched product. */
  receiveOrder(orderId: string) {
    return apiFetch(`/cluster/orders/${orderId}/receive`, { method: "PATCH" });
  },

  /** Mark a pickup order ready for the buyer to collect. */
  markReadyForPickup(orderId: string) {
    return apiFetch(`/cluster/orders/${orderId}/ready-for-pickup`, { method: "PATCH" });
  },

  /** Escalate a delivery order to an approved in-region rider. */
  escalateToRider(orderId: string, riderId: string) {
    return apiFetch(`/cluster/orders/${orderId}/escalate`, {
      method: "PATCH",
      body: JSON.stringify({ riderId }),
    });
  },

  // === Private Marketplace

  /**
   * Email a buyer a referral signup link — no account is created here. The
   * buyer signs up exactly like any other buyer (own email, own OTP, own
   * password); the link just tags the new account as this cluster farmer's
   * customer.
   */
  sendBuyerReferral(email: string) {
    return apiFetch<{
      status: string;
      message: string;
      data: { referralUrl: string; emailSent: boolean };
    }>("/cluster/buyers/invite", { method: "POST", body: JSON.stringify({ email }) });
  },

  /** List buyers who signed up as this cluster farmer's customers. */
  getMyBuyers() {
    return apiFetch<{
      status: string;
      data: { buyers: ClusterBuyer[] };
    }>("/cluster/buyers");
  },

  /** Approved listings from this cluster's own farmers, not yet in the storefront. */
  getEligibleMarketplaceListings() {
    return apiFetch<{ status: string; data: { listings: EligibleMarketplaceListing[] } }>(
      "/cluster/eligible-listings",
    );
  },

  /** This cluster farmer's own curated storefront. */
  getMyMarketplace() {
    return apiFetch<{ status: string; data: { listings: ClusterMarketplaceRow[] } }>("/cluster/my-marketplace");
  },

  /** Add a listing to the storefront with a marked-up price. */
  addToMyMarketplace(listingId: string, markedUpPrice: number) {
    return apiFetch<{ status: string; message: string; data: { id: string } }>("/cluster/my-marketplace", {
      method: "POST",
      body: JSON.stringify({ listingId, markedUpPrice }),
    });
  },

  /** Update a storefront listing's price or active state. */
  updateMyMarketplaceListing(id: string, data: { markedUpPrice?: number; active?: boolean }) {
    return apiFetch(`/cluster/my-marketplace/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  /** Remove a listing from the storefront. */
  removeFromMyMarketplace(id: string) {
    return apiFetch(`/cluster/my-marketplace/${id}`, { method: "DELETE" });
  },
};

export interface ClusterBuyer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  active: boolean;
  createdAt: string;
}

export interface EligibleMarketplaceListing {
  id: string;
  fishType: string;
  farmerName: string;
  basePricePerFish: number;
  basePricePerKg: number | null;
  totalAvailableKg: number | null;
  imageUrl: string | null;
}

export interface ClusterMarketplaceRow {
  id: string;
  listingId: string;
  fishType: string;
  farmerName: string;
  basePricePerFish: number;
  markedUpPricePerFish: number;
  markedUpPricePerKg: number | null;
  commissionPercent: number;
  active: boolean;
  imageUrl: string | null;
  createdAt: string;
}
