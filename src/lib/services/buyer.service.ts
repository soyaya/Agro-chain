import { apiFetch } from "~/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  order_number: string;
  delivery_type: string;
  delivery_address: string;
  status: string;
  payment_status: string;
  total_amount: number;
  delivery_fee: number;
  grand_total: number;
  created_at: string;
  items?: Array<{
    listingId: string;
    quantity: number;
    weightKg: number;
    variant?: string;
    processed?: boolean;
    pricePerUnit: number;
  }>;
  clusterFarmer?: { full_name: string; phone_number: string };
  listing?: { fish_type: string; packaging_weight_kg: number };
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
  businessName?: string;
  businessAddress?: string;
  localGovernment?: string;
  state?: string;
}

// ─── Buyer Service ────────────────────────────────────────────────────────────

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

  /** Confirm delivery of an order. */
  confirmDelivery(orderId: string) {
    return apiFetch(`/buyers/orders/${orderId}/confirm-delivery`, { method: "PATCH" });
  },

  /** Initiate payment for an order. */
  initiatePayment(orderId: string, amount: number) {
    return apiFetch(`/buyers/orders/${orderId}/pay`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },
};
