import { apiFetch } from "~/lib/api";

export interface RiderOrder {
  orderId: string;
  orderNumber: string;
  buyerName: string;
  deliveryAddress: string;
  fulfillmentStage: string;
  phoneVerifiedAt: string | null;
  pickupPhotoUrl: string | null;
  deliveryOtpVerifiedAt: string | null;
  handoffPhotoUrl: string | null;
  createdAt: string;
}

export interface RiderDemand {
  demandId: string;
  buyerName: string;
  deliveryAddress: string;
  fulfillmentStage: string;
  phoneVerifiedAt: string | null;
  pickupPhotoUrl: string | null;
  deliveryOtpVerifiedAt: string | null;
  handoffPhotoUrl: string | null;
  createdAt: string;
}

export interface UpdateRiderProfilePayload {
  fullName?: string;
  locationState?: string;
  locationLga?: string;
  locationAddress?: string;
}

export const riderService = {
  /** Get orders assigned to this rider. */
  getOrders() {
    return apiFetch<{ status: string; data: { orders: RiderOrder[] } }>("/riders/orders");
  },

  /** Update the rider's own profile. Rider has no role-specific profile
   * endpoint like the other roles — this is the same generic one the app's
   * legacy profile route exposes, just wrapped in a typed service call. */
  updateProfile(data: UpdateRiderProfilePayload) {
    return apiFetch("/users/profile", {
      method: "PUT",
      body: JSON.stringify({
        full_name: data.fullName,
        location_state: data.locationState,
        location_lga: data.locationLga,
        location_address: data.locationAddress,
      }),
    });
  },

  /** Send a phone-verification OTP to the buyer before starting delivery. */
  sendPhoneOtp(orderId: string) {
    return apiFetch(`/riders/orders/${orderId}/send-phone-otp`, { method: "POST" });
  },

  /** Verify the phone OTP and start delivery with a pickup photo. */
  startDelivery(orderId: string, otp: string, photoUrl: string) {
    return apiFetch(`/riders/orders/${orderId}/start-delivery`, {
      method: "POST",
      body: JSON.stringify({ otp, photoUrl }),
    });
  },

  /** Send an arrival OTP to the buyer once the rider reaches them. */
  sendArrivalOtp(orderId: string) {
    return apiFetch(`/riders/orders/${orderId}/send-arrival-otp`, { method: "POST" });
  },

  /** Verify the buyer's identity via the arrival OTP. */
  verifyArrivalOtp(orderId: string, otp: string) {
    return apiFetch(`/riders/orders/${orderId}/verify-arrival-otp`, {
      method: "POST",
      body: JSON.stringify({ otp }),
    });
  },

  /** Complete the handoff with a proof-of-delivery photo. */
  completeHandoff(orderId: string, photoUrl: string) {
    return apiFetch(`/riders/orders/${orderId}/complete-handoff`, {
      method: "POST",
      body: JSON.stringify({ photoUrl }),
    });
  },

  // === Demand deliveries (identical protocol, separate queue)

  /** Get demands assigned to this rider for delivery. */
  getDemands() {
    return apiFetch<{ status: string; data: { demands: RiderDemand[] } }>("/riders/demands");
  },

  sendDemandPhoneOtp(demandId: string) {
    return apiFetch(`/riders/demands/${demandId}/send-phone-otp`, { method: "POST" });
  },

  startDemandDelivery(demandId: string, otp: string, photoUrl: string) {
    return apiFetch(`/riders/demands/${demandId}/start-delivery`, {
      method: "POST",
      body: JSON.stringify({ otp, photoUrl }),
    });
  },

  sendDemandArrivalOtp(demandId: string) {
    return apiFetch(`/riders/demands/${demandId}/send-arrival-otp`, { method: "POST" });
  },

  verifyDemandArrivalOtp(demandId: string, otp: string) {
    return apiFetch(`/riders/demands/${demandId}/verify-arrival-otp`, {
      method: "POST",
      body: JSON.stringify({ otp }),
    });
  },

  completeDemandHandoff(demandId: string, photoUrl: string) {
    return apiFetch(`/riders/demands/${demandId}/complete-handoff`, {
      method: "POST",
      body: JSON.stringify({ photoUrl }),
    });
  },
};
