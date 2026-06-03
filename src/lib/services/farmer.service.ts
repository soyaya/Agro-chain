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
  weightKg: number;     // Weight per fish in kg
  quantity: number;     // Derived: floor(totalAvailableKg / weightKg)
  status: "approved" | "pending" | "rejected";
  isApproved: boolean;
  createdAt: string;
}

export interface BackendActivity {
  id: string;
  description: string;
  type: string;
  created_at: string;
}

export interface CreateListingPayload {
  fishType: string;
  harvestDate: string;
  listedDate?: string;
  totalFishAvailable: number;
  weightKg: number;   // Weight per fish in kg - pricePerUnit is computed by backend from admin config
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
  // Document URLs - obtained after uploading files to Cloudinary
  bvnVerification?: string;
  proofOfAddress?: string;
  cacRegistration?: string;
  businessLicense?: string;
  taxClearance?: string;
}

export interface BackendFarmerOrder {
  orderId: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone?: string;
  fishType: string;
  variant?: string;
  weightKg: number;
  quantity: number;
  processed?: boolean;
  deliveryOption: string;
  status: string;
  paymentStatus?: string;
  totalAmount?: number;
  createdAt: string;
}

export interface FarmerPayout {
  id: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  paidAt?: string;
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

  /** Get all orders for the farmer's listings. */
  getOrders() {
    return apiFetch<{ status: string; data: { orders: BackendFarmerOrder[] } }>("/farmers/orders");
  },

  /** Get payout history. */
  getPayouts() {
    return apiFetch<{
      status: string;
      data: { payouts: FarmerPayout[]; totalEarnings: number; pendingPayouts: number };
    }>("/farmers/payouts");
  },
};
