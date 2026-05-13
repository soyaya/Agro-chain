import { apiFetch } from "~/lib/api";
import type { MarketplaceListing } from "~/types";

// === Types

export interface MarketplaceListingsResponse {
  status: string;
  data: {
    listings: MarketplaceListing[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface MarketplaceListingResponse {
  status: string;
  data: { listing: MarketplaceListing };
}

export interface MarketplaceFiltersQuery {
  fishType?: string;
  state?: string;
  lga?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CartItem {
  cartItemId: string;
  listingId: string;
  fishType: string;
  variant: string;
  processed: boolean;
  weightKg: number;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface CartResponse {
  status: string;
  data: {
    cartId: string;
    items: CartItem[];
    cartTotal: number;
  };
}

export interface AddToCartPayload {
  listingId: string;
  variant?: string;
  processed?: boolean;
  weightKg: number;
  quantity: number;
  pricePerUnit: number;
}

export interface CheckoutPayload {
  deliveryType: "pickup" | "delivery";
  deliveryAddress?: string;
  deliveryFee: number;
  totalAmount: number;
  cartItems: Array<{ cartItemId: string; quantity: number }>;
}

export interface CheckoutResponse {
  status: string;
  message: string;
  data: { order: { id: string; order_number: string; status: string; grand_total: number } };
}

// === Marketplace Service

export const marketplaceService = {
  /** Get all approved marketplace listings with optional filters. */
  getListings(filters?: MarketplaceFiltersQuery): Promise<MarketplaceListingsResponse> {
    const params = new URLSearchParams();
    if (filters?.fishType) params.set("fishType", filters.fishType);
    if (filters?.state) params.set("state", filters.state);
    if (filters?.lga) params.set("lga", filters.lga);
    if (filters?.minPrice != null) params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
    if (filters?.page != null) params.set("page", String(filters.page));
    if (filters?.limit != null) params.set("limit", String(filters.limit));

    const query = params.toString();
    return apiFetch<MarketplaceListingsResponse>(query ? `/marketplace?${query}` : "/marketplace");
  },

  /** Get a single listing by ID. */
  getListingById(listingId: string): Promise<MarketplaceListingResponse> {
    return apiFetch<MarketplaceListingResponse>(`/marketplace/${listingId}`);
  },

  /** Get the current user's server-side cart. */
  getCart(): Promise<CartResponse> {
    return apiFetch<CartResponse>("/marketplace/cart");
  },

  /** Add an item to the server-side cart. */
  addToCart(payload: AddToCartPayload): Promise<{ status: string; data: { cartItemId: string } }> {
    return apiFetch("/marketplace/cart", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** Update quantity of a cart item. */
  updateCartItem(
    cartItemId: string,
    updates: { quantity?: number; weightKg?: number; pricePerUnit?: number },
  ) {
    return apiFetch(`/marketplace/cart/${cartItemId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  /** Remove an item from the cart. */
  removeCartItem(cartItemId: string) {
    return apiFetch(`/marketplace/cart/${cartItemId}`, { method: "DELETE" });
  },

  /** Checkout — creates an order from selected cart items. */
  checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
    return apiFetch<CheckoutResponse>("/marketplace/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
