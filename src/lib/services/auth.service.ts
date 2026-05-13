import { apiFetch } from "~/lib/api";

// === Types

export interface BackendUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: "farmer" | "buyer" | "cluster" | "admin" | "pending";
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  profile_completed: boolean;
  is_cluster_farmer: boolean;
  cluster_approved: boolean;
  location_state: string;
  location_lga: string;
  location_address: string;
  profile_photo_url?: string;
  farm_name?: string;
  fish_type_preference?: string;
  farming_capacity_kg?: number;
  years_of_experience?: number;
  business_name?: string;
  company_name?: string;
  business_type?: string;
  cac_number?: string;
  warehouse_location?: string;
  distribution_capacity?: number;
  logistics_available?: boolean;
  bvn_doc_url?: string;
  proof_of_address_url?: string;
  cac_registration_url?: string;
  business_license_url?: string;
  tax_clearance_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface MeResponse {
  status: string;
  data: { user: BackendUser };
}

export interface RefreshResponse {
  status: string;
  data: { access_token: string; refresh_token: string };
}

// === Auth Service

export const authService = {
  /** Fetch the currently authenticated user's profile. */
  getMe(): Promise<MeResponse> {
    return apiFetch<MeResponse>("/auth/me");
  },

  /** Submit BVN identity verification. */
  verifyIdentity(bvn: string, creditConsent: boolean) {
    return apiFetch("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ bvn, creditConsent }),
    });
  },

  /** Refresh the access token using a stored refresh token. */
  refresh(refreshToken: string): Promise<RefreshResponse> {
    return apiFetch<RefreshResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  /** Logout from the current device. */
  logout() {
    // Calls the Next.js proxy which clears httpOnly cookies server-side
    return fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  },

  /** Logout from all devices. */
  logoutAll() {
    return apiFetch("/auth/logout/all", { method: "POST" });
  },
};
