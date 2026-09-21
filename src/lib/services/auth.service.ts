import { apiFetch } from "~/lib/api";

// === Types

export interface BackendUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: "farmer" | "buyer" | "cluster" | "admin" | "pending" | "rider";
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  profile_completed: boolean;
  must_set_password: boolean;
  is_cluster_farmer: boolean;
  cluster_approved: boolean;
  location_state: string;
  location_lga: string;
  location_ward?: string | null;
  location_address: string;
  profile_photo_url?: string;
  farm_name?: string;
  fish_type_preference?: string;
  farming_capacity_kg?: number;
  years_of_experience?: number;
  business_name?: string;
  company_name?: string;
  business_type?: string;
  rider_approved?: boolean;
  cac_number?: string;
  cac_verified?: boolean;
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
  /** Fetch the currently authenticated user's profile.
   *  Goes through the Next.js proxy so the httpOnly auth_token cookie
   *  (scoped to this origin) is forwarded to the backend correctly. */
  getMe(): Promise<MeResponse> {
    return fetch("/api/auth/me", { credentials: "include" }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw Object.assign(new Error(data?.message ?? "Unauthorized"), { status: res.status });
      return data as MeResponse;
    });
  },

  /** Submit BVN identity verification. */
  verifyIdentity(bvn: string, creditConsent: boolean) {
    return apiFetch("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ bvn, creditConsent }),
    });
  },

  /** Set a new password (first login for admin-invited accounts, e.g. riders). */
  setPassword(newPassword: string) {
    return apiFetch("/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    });
  },

  /** Refresh the access token through the Next.js proxy so the httpOnly
   *  refresh_token cookie (scoped to this origin) is forwarded correctly. */
  refresh(): Promise<RefreshResponse> {
    return fetch("/api/auth/refresh", { method: "POST", credentials: "include" }).then(
      async (res) => {
        const data = await res.json();
        if (!res.ok) throw Object.assign(new Error(data?.message ?? "Session expired"), { status: res.status });
        return data as RefreshResponse;
      },
    );
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
