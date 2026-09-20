import { apiFetch } from "~/lib/api";

export interface RiderOrder {
  orderId: string;
  orderNumber: string;
  buyerName: string;
  deliveryAddress: string;
  fulfillmentStage: string;
  fishVariant: string | null;
  pickupPhotoUrl: string | null;
  handoffPhotoUrl: string | null;
  createdAt: string;
}

export interface RiderDemand {
  demandId: string;
  buyerName: string;
  deliveryAddress: string;
  fulfillmentStage: string;
  fishVariant: string | null;
  pickupPhotoUrl: string | null;
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

  /**
   * Starts delivery with a pickup photo — no OTP. The chain of custody is
   * photo-only: this photo (and the handoff one below) is what the buyer
   * compares before confirming, and what admin reviews on a dispute.
   */
  startDelivery(orderId: string, photoUrl: string) {
    return apiFetch(`/riders/orders/${orderId}/start-delivery`, {
      method: "POST",
      body: JSON.stringify({ photoUrl }),
    });
  },

  /** Completes the handoff with a proof-of-delivery photo. */
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

  startDemandDelivery(demandId: string, photoUrl: string) {
    return apiFetch(`/riders/demands/${demandId}/start-delivery`, {
      method: "POST",
      body: JSON.stringify({ photoUrl }),
    });
  },

  completeDemandHandoff(demandId: string, photoUrl: string) {
    return apiFetch(`/riders/demands/${demandId}/complete-handoff`, {
      method: "POST",
      body: JSON.stringify({ photoUrl }),
    });
  },

  /** Get payout history — the delivery fee earned per completed order/demand. */
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
    }>("/riders/payouts");
  },
};
