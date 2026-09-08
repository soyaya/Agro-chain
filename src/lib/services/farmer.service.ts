import { apiFetch } from "~/lib/api";

// === Types

export interface BackendListing {
  id: string;
  farmer_id: string;
  fish_type: string;
  quantity_available: number;
  quantity_sold: number;
  price_per_fish: number;
  price_per_kg: number;
  packaging_weight_kg: number;
  total_available_kg: number;
  harvest_date: string;
  location_state: string;
  location_lga: string;
  location_address: string;
  status: string;
  cluster_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface FarmerListingSummary {
  totalListings: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  totalSupply: number;
}

export interface FarmerListingRecord {
  id: string;
  fishType: string;
  harvestDate: string;
  listedDate: string;
  totalFishAvailable: number;
  totalAvailableKg: number;
  packaging: { weightKg: number; quantity: number; pricePerUnit: number };
  status: "approved" | "pending" | "rejected";
  isApproved: boolean;
  createdAt: string;
}

export interface FarmerListingDetail {
  id: string;
  fishType: string;
  harvestDate: string;
  listedDate: string;
  quantityAvailable: number;
  quantitySold: number;
  totalAvailableKg: number;
  pricePerKg: number;
  pricePerFish: number;
  packagingWeightKg: number;
  status: "approved" | "pending" | "rejected";
  isApproved: boolean;
  rejectionReason: string | null;
  createdAt: string;
}

export interface FarmerListingOrder {
  orderId: string;
  orderNumber: string;
  buyerName: string;
  quantity: number;
  weightKg: number | null;
  grandTotal: number;
  status: string;
  fulfillmentStage: string;
  fulfillmentMethod: "pickup" | "delivery";
  createdAt: string;
}

export interface BackendActivity {
  id: string;
  description: string;
  type: string;
  created_at: string;
}

export type ListingBracketVariant = "broodstock" | "table_size" | "dried";
export type ListingWeightBracket =
  | "weight_300_500"
  | "weight_500_700"
  | "weight_700_1000"
  | "weight_1000_1200"
  | "weight_1200_plus";
export type ListingSeedlingSize = "juveniles" | "post" | "jumbo";
export type ListingFishVariant = ListingBracketVariant | "seedlings";

export interface CreateListingPayload {
  fishVariant: ListingFishVariant;
  weightBracket?: ListingWeightBracket;
  availableKg?: number;
  seedlingSize?: ListingSeedlingSize;
  availablePieces?: number;
  harvestDate: string;
  listedDate?: string;
  priceAgreementAccepted: boolean;
}

export interface ListingPriceCatalog {
  bracketPrices: Array<{ variant: ListingBracketVariant; weightBracket: ListingWeightBracket; pricePerKg: number }>;
  seedlingPrices: Array<{ seedlingSize: ListingSeedlingSize; pricePerPiece: number }>;
}

export interface FarmerOrder {
  orderId: string;
  listingId: string | null;
  listingFishType: string | null;
  buyerName: string;
  quantity: number;
  weightKg: number | null;
  status: string;
  fulfillmentStage: string;
  fulfillmentMethod: "pickup" | "delivery";
  createdAt: string;
}

export interface UpdateFarmerProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  profileImage?: string;
  farmName?: string;
  farmAddress?: string;
  localGovernment?: string;
  state?: string;
  ward?: string;
  fishType?: string;
  farmingCapacityKg?: number;
  yearsOfExperience?: number;
}

export interface ClusterApplicationPayload {
  businessName?: string;
  cacNumber?: string;
  warehouseLocation?: string;
  distributionCapacity?: number;
  logisticsAvailable?: boolean;
  // Document URLs — obtained after uploading files to Cloudinary. BVN is
  // covered by the existing wallet/BVN verification flow and CAC by
  // automatic verification, so neither needs a document upload here.
  proofOfAddress?: string;
  businessLicense?: string;
  taxClearance?: string;
}

// === Farmer Service

export const farmerService = {
  /** Create a new product listing. */
  createListing(data: CreateListingPayload) {
    return apiFetch("/farmers/listings/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Get all listings belonging to the logged-in farmer. */
  getListings() {
    return apiFetch<{ status: string; data: { summary: FarmerListingSummary; listings: FarmerListingRecord[] } }>(
      "/farmers/listings/get",
    );
  },

  /** Get a single listing plus the real orders placed against it. */
  getListing(listingId: string) {
    return apiFetch<{ status: string; data: { listing: FarmerListingDetail; orders: FarmerListingOrder[] } }>(
      `/farmers/listings/${listingId}`,
    );
  },

  /** Get recent activities for the farmer's dashboard. */
  getRecentActivities() {
    return apiFetch<{ status: string; data: { activities: BackendActivity[] } }>(
      "/farmers/recent-activities",
    );
  },

  /** Update the farmer's account profile. */
  updateProfile(data: UpdateFarmerProfilePayload) {
    return apiFetch("/farmers/account-profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /** Submit a cluster farmer application. */
  applyForCluster(data: ClusterApplicationPayload) {
    return apiFetch("/farmers/cluster-farmer-application", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Verify a CAC number against AutoRamp instead of requiring a manually
   * uploaded registration certificate. Experimental — AutoRamp's support for
   * this isn't confirmed, so a failure here doesn't necessarily mean the
   * number is invalid.
   */
  verifyCac(cacNumber: string) {
    return apiFetch<{ status: string; data: { verified: boolean; autorampStatus: string } }>(
      "/farmers/verify-cac",
      { method: "POST", body: JSON.stringify({ cacNumber }) },
    );
  },

  /** Get all orders for the farmer's listings. */
  getOrders() {
    return apiFetch<{ status: string; data: { orders: FarmerOrder[] } }>("/farmers/orders");
  },

  /** Get the current admin-regulated price catalog. */
  getListingPrices() {
    return apiFetch<{ status: string; data: ListingPriceCatalog }>("/farmers/listing-prices");
  },

  /** Mark an order as physically dispatched to the cluster farmer's office. */
  dispatchOrder(orderId: string) {
    return apiFetch(`/farmers/orders/${orderId}/dispatch`, { method: "PATCH" });
  },

  /** Get payout history. */
  getPayouts() {
    return apiFetch<{
      status: string;
      data: { payouts: unknown[]; totalEarnings: number; pendingPayouts: number };
    }>("/farmers/payouts");
  },
};
