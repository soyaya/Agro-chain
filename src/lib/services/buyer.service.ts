import { apiFetch } from "~/lib/api";
import type { MarketplaceListing } from "~/types";

// === Types

export type DemandStatus = "pending" | "assigned" | "accepted" | "declined" | "fulfilled" | "cancelled";

export type DemandBracketVariant = "broodstock" | "table_size" | "dried";
export type DemandWeightBracket =
  | "weight_300_500"
  | "weight_500_700"
  | "weight_700_1000"
  | "weight_1000_1200"
  | "weight_1200_plus";
export type SeedlingSize = "juveniles" | "post" | "jumbo";
export type DemandFishVariant = DemandBracketVariant | "seedlings";

export interface BackendDemand {
  id: string;
  fishType: string;
  weightKg?: number;
  weightBracket?: DemandWeightBracket;
  quantityPieces?: number;
  seedlingSize?: SeedlingSize;
  fishVariant: string;
  pricePerUnit: number;
  totalAmount: number;
  deliveryFee: number;
  grandTotal: number;
  fulfillmentMethod: "pickup" | "delivery";
  fulfillmentStage: string;
  assignedRiderId?: string;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  paidAt?: string;
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

export interface CreateDemandPayload {
  fishVariant: DemandFishVariant;
  weightBracket?: DemandWeightBracket;
  quantityKg?: number;
  seedlingSize?: SeedlingSize;
  quantityPieces?: number;
  fulfillmentMethod: "pickup" | "delivery";
  locationState: string;
  locationLga: string;
  deliveryAddress: string;
  notes?: string;
}

export interface DemandPriceCatalog {
  bracketPrices: Array<{ variant: DemandBracketVariant; weightBracket: DemandWeightBracket; pricePerKg: number }>;
  seedlingPrices: Array<{ seedlingSize: SeedlingSize; pricePerPiece: number }>;
}

export interface BackendOrder {
  orderId: string;
  orderNumber: string;
  clusterFarmerName: string;
  deliveryOption: string;
  status: string;
  payment_status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerOrderDetail {
  id: string;
  orderNumber: string;
  buyerId: string;
  clusterFarmerId: string | null;
  clusterFarmerName: string;
  clusterFarmerContact: string | null;
  warehouseLocation: string | null;
  listingFishType: string | null;
  items: Array<{
    fishType?: string;
    unit?: "kg" | "piece";
    variant?: string;
    processed?: boolean;
    weightKg: number;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
  }>;
  quantity: number;
  weightKg: number | null;
  totalAmount: number;
  deliveryFee: number;
  grandTotal: number;
  deliveryType: string | null;
  deliveryAddress: string;
  fulfillmentMethod: "pickup" | "delivery";
  fulfillmentStage: string;
  assignedRiderId: string | null;
  status: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  confirmedAt?: string;
  completedAt?: string;
}

export interface BuyerOrderTrackingEvent {
  status: string;
  message: string;
  createdAt: string;
}

export interface UpdateBuyerProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  profileImage?: string;
  companyName?: string;
  deliveryAddress?: string;
  localGovernment?: string;
  state?: string;
  ward?: string;
  businessType?: string;
}

// === Buyer Service

export const buyerService = {
  /** Update the buyer's account profile. */
  updateProfile(data: UpdateBuyerProfilePayload) {
    return apiFetch("/buyers/account-profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /** Create a new order. */
  createOrder(data: { listingId: string; quantity: number; weightKg?: number }) {
    return apiFetch("/buyers/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Get all orders placed by the buyer. */
  getOrders() {
    return apiFetch<{ status: string; data: { orders: BackendOrder[] } }>("/buyers/orders");
  },

  /** Get a single order's details. */
  getOrder(orderId: string) {
    return apiFetch<{ status: string; data: { order: BuyerOrderDetail } }>(
      `/buyers/orders/${orderId}`,
    );
  },

  /** Get tracking info for an order. */
  getOrderTracking(orderId: string) {
    return apiFetch<{
      status: string;
      data: { tracking: BuyerOrderTrackingEvent[] };
    }>(`/buyers/orders/${orderId}/tracking`);
  },

  /** Confirm delivery/pickup of an order, starting the payout countdown. */
  confirmDelivery(orderId: string, payoutDelay?: string) {
    return apiFetch(`/buyers/orders/${orderId}/confirm-delivery`, {
      method: "PATCH",
      body: JSON.stringify({ payoutDelay }),
    });
  },

  /** Pay an order's balance via wallet debit (AutoRamp) — the only payment path this app uses. */
  payOrderWithWallet(orderId: string) {
    return apiFetch<{
      status: string;
      message: string;
      data: { paymentReference: string; status: "completed" | "processing" };
    }>(`/buyers/orders/${orderId}/pay-with-wallet`, { method: "POST" });
  },

  // === Saved Listings

  /** Get the buyer's saved (bookmarked) listings, fully formatted for the marketplace UI. */
  getSavedListings() {
    return apiFetch<{ status: string; data: { listings: MarketplaceListing[] } }>("/marketplace/saved");
  },

  /** Save a listing for later. */
  saveListing(listingId: string) {
    return apiFetch(`/marketplace/saved/${listingId}`, { method: "POST" });
  },

  /** Remove a listing from saved. */
  unsaveListing(listingId: string) {
    return apiFetch(`/marketplace/saved/${listingId}`, { method: "DELETE" });
  },

  // === Demands

  /** Get the current admin-regulated demand price catalog. */
  getDemandPrices() {
    return apiFetch<{ status: string; data: DemandPriceCatalog }>("/buyers/demand-prices");
  },

  /** Get all demands created by this buyer. */
  getDemands() {
    return apiFetch<{ status: string; data: { demands: BackendDemand[] } }>("/buyers/demands");
  },

  /** Create a new demand. */
  createDemand(data: CreateDemandPayload) {
    return apiFetch<{ status: string; data: { demand: BackendDemand } }>("/buyers/demands", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Pay a demand's escrow via wallet debit. */
  payDemandWithWallet(demandId: string) {
    return apiFetch<{ status: string; data: { demand: BackendDemand } }>(
      `/buyers/demands/${demandId}/pay-with-wallet`,
      { method: "POST" },
    );
  },

  /** Get a single demand's details. */
  getDemand(demandId: string) {
    return apiFetch<{ status: string; data: { demand: BackendDemand } }>(`/buyers/demands/${demandId}`);
  },

  /** Cancel a pending demand. */
  cancelDemand(demandId: string) {
    return apiFetch(`/buyers/demands/${demandId}`, { method: "DELETE" });
  },

  /** Get the tracking history for a demand. */
  getDemandTracking(demandId: string) {
    return apiFetch<{ status: string; data: { tracking: BuyerOrderTrackingEvent[] } }>(
      `/buyers/demands/${demandId}/tracking`,
    );
  },

  /** Confirm final receipt (pickup or delivery) of a demand. */
  confirmDemandReceipt(demandId: string) {
    return apiFetch<{ status: string; data: { demand: BackendDemand } }>(
      `/buyers/demands/${demandId}/confirm-receipt`,
      { method: "PATCH" },
    );
  },
};
