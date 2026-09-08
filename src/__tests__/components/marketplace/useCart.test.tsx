import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { MarketplaceListing, PackagingOption } from "~/types";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const apiFetchMock = vi.fn();
vi.mock("~/lib/api", () => ({ apiFetch: (...args: unknown[]) => apiFetchMock(...args) }));

const { CartProvider, useCart } = await import("~/components/marketplace/useCart");

const CART_STORAGE_KEY = "agro_chain_cart";

const listing: MarketplaceListing = {
  id: "listing_1",
  fishType: "catfish",
  businessName: "E2E Cluster Co",
  clusterFarmerName: "E2E Test Cluster Farmer",
} as MarketplaceListing;

const pkg: PackagingOption = { weightKg: 5, quantity: 400, pricePerUnit: 1000 } as PackagingOption;

function wrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe("useCart", () => {
  beforeEach(() => {
    localStorage.clear();
    apiFetchMock.mockReset();
  });

  it("throws when used outside a CartProvider", () => {
    expect(() => renderHook(() => useCart())).toThrow(/CartProvider/);
  });

  it("hydrates from localStorage on mount", async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ cartItemId: "local-1", listingId: "listing_1", quantity: 2, totalPrice: 2000 }]),
    );
    apiFetchMock.mockRejectedValue(new Error("401")); // anonymous — GET /marketplace/cart fails

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.synced).toBe(true));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(2);
  });

  it("addToCart adds a new item and persists it to localStorage once synced", async () => {
    apiFetchMock
      .mockRejectedValueOnce(new Error("401")) // initial GET /marketplace/cart (anonymous)
      .mockResolvedValueOnce({ data: { cartItemId: "server-1" } }); // POST /marketplace/cart

    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.synced).toBe(true));

    act(() => {
      result.current.addToCart(listing, pkg, { variant: "Table Size" as any, processed: false });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].listingId).toBe("listing_1");

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
      expect(stored).toHaveLength(1);
    });
  });

  it("addToCart increments quantity instead of duplicating when the same variant is added twice", async () => {
    apiFetchMock.mockRejectedValue(new Error("401"));

    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.synced).toBe(true));

    act(() => {
      result.current.addToCart(listing, pkg, { variant: "Table Size" as any, processed: false });
    });
    act(() => {
      result.current.addToCart(listing, pkg, { variant: "Table Size" as any, processed: false });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it("flushes a guest's local-only cart to the backend once the session becomes authenticated", async () => {
    // This is the fix for the bug where items added anonymously never reached
    // the backend Cart table (POST /marketplace/cart 401s while anonymous),
    // so checkout would find nothing after the user logged in.
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        {
          cartItemId: "cart-local-123",
          listingId: "listing_1",
          fishType: "catfish",
          variant: "Table Size",
          processed: false,
          deliveryType: "pickup",
          weightKg: 5,
          quantity: 1,
          pricePerUnit: 1000,
          totalPrice: 1000,
          businessName: "E2E Cluster Co",
          clusterFarmerName: "E2E Test Cluster Farmer",
        },
      ]),
    );

    apiFetchMock
      .mockResolvedValueOnce({ data: { cartId: "server-cart", items: [], cartTotal: 0 } }) // GET succeeds — now authenticated, server cart empty
      .mockResolvedValueOnce({ data: { cartItemId: "server-flushed-1" } }); // flush POST

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.synced).toBe(true));

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/marketplace/cart",
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].cartItemId).toBe("server-flushed-1");
  });

  it("does not flush when the backend cart already has items — server cart takes precedence", async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ cartItemId: "cart-local-999", listingId: "stale-listing", quantity: 1, totalPrice: 500 }]),
    );
    apiFetchMock.mockResolvedValueOnce({
      data: {
        cartId: "server-cart",
        items: [
          {
            cartItemId: "server-existing-1",
            listingId: "listing_1",
            fishType: "catfish",
            variant: "Table Size",
            processed: false,
            weightKg: 5,
            quantity: 3,
            pricePerUnit: 1000,
            totalPrice: 3000,
          },
        ],
        cartTotal: 3000,
      },
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.synced).toBe(true));

    // Only the one GET call — no flush POST, since the server cart already had items.
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].cartItemId).toBe("server-existing-1");
  });

  it("clearCart empties the cart", async () => {
    apiFetchMock.mockRejectedValue(new Error("401"));
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.synced).toBe(true));

    act(() => {
      result.current.addToCart(listing, pkg, { variant: "Table Size" as any, processed: false });
    });
    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.clearCart();
    });
    expect(result.current.items).toHaveLength(0);
  });
});
