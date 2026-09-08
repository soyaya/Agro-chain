"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import type { MarketplaceListing, PackagingOption } from "~/types";
import { BASE_PRICE_PER_KG_NAIRA } from "~/types/constants";
import type { FishVariant } from "~/types/constants";
import { apiFetch } from "~/lib/api";

export interface CartItem {
  cartItemId?: string;
  listingId: string;
  fishType: string;
  variant: FishVariant;
  processed: boolean;
  weightKg: number;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  businessName: string;
  clusterFarmerName: string;
}

const CART_STORAGE_KEY = "agro_chain_cart";
const createLocalId = () => `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getInitialCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch (error) {
    return [];
  }
};

// pkg.pricePerUnit is typed as `number` but the API actually serializes it as
// a string (Prisma Decimal) — `??` alone doesn't coerce a present string, so
// downstream arithmetic (cart subtotal, totals) silently does string
// concatenation instead of addition unless every value is coerced here.
const computePricePerUnit = (pkg: PackagingOption) =>
  pkg.pricePerUnit != null ? Number(pkg.pricePerUnit) : pkg.weightKg * BASE_PRICE_PER_KG_NAIRA;

function useCartState() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [synced, setSynced] = useState(false);

  // Hydrate from localStorage first, then sync with backend cart if logged in
  useEffect(() => {
    const localItems = getInitialCart();
    setItems(localItems);

    const syncWithBackend = async () => {
      try {
        const response = await apiFetch<{
          status: string;
          data: {
            cartId: string; items: Array<{
              cartItemId: string;
              listingId: string;
              fishType: string;
              variant: string;
              processed: boolean;
              weightKg: number;
              quantity: number;
              pricePerUnit: number;
              totalPrice: number;
            }>; cartTotal: number
          };
        }>("/marketplace/cart");

        const serverItems = response.data.items ?? [];
        if (serverItems.length > 0) {
          // Server cart takes precedence over stale localStorage
          const mapped: CartItem[] = serverItems.map((item) => ({
            cartItemId: item.cartItemId,
            listingId: item.listingId,
            fishType: item.fishType,
            variant: item.variant as FishVariant,
            processed: item.processed,
            weightKg: Number(item.weightKg),
            quantity: item.quantity,
            pricePerUnit: Number(item.pricePerUnit),
            totalPrice: Number(item.totalPrice),
            businessName: "",
            clusterFarmerName: "",
          }));
          setItems(mapped);
        } else if (localItems.length > 0) {
          // GET succeeding means this is now an authenticated session, but the
          // backend cart is empty — this is a guest cart built up before login
          // (every addToCart POST silently 401'd while anonymous). Flush it to
          // the backend now so checkout can actually find these items.
          const flushed = await Promise.all(
            localItems.map(async (item) => {
              try {
                const flushResponse = await apiFetch<{ data: { cartItemId: string } }>(
                  "/marketplace/cart",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      listingId: item.listingId,
                      variant: item.variant,
                      processed: item.processed,
                      weightKg: item.weightKg,
                      quantity: item.quantity,
                      pricePerUnit: item.pricePerUnit,
                    }),
                  },
                );
                const serverId = flushResponse.data?.cartItemId;
                return serverId ? { ...item, cartItemId: serverId } : item;
              } catch {
                return item;
              }
            }),
          );
          setItems(flushed);
        }
      } catch {
        // Not logged in or backend unreachable — keep local cart
      } finally {
        setSynced(true);
      }
    };

    void syncWithBackend();
  }, []);

  // Only persist to localStorage after the initial backend sync is done
  useEffect(() => {
    if (!synced) return;
    if (typeof window === "undefined") return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, synced]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  // Number(...) here, not just at the point items are added — a cart item
  // already sitting in localStorage from before computePricePerUnit was
  // fixed (or a network hiccup during the server sync's own coercion) would
  // otherwise keep a stale string totalPrice forever and silently break this
  // sum into string concatenation again.
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.totalPrice), 0),
    [items],
  );

  const addToCart = useCallback(
    (
      listing: MarketplaceListing,
      pkg: PackagingOption,
      options: { variant: FishVariant; processed: boolean },
    ) => {
      const pricePerUnit = computePricePerUnit(pkg);
      const localId = createLocalId();
      setItems((prev) => {
        const existing = prev.find(
          (item) =>
            item.listingId === listing.id &&
            item.weightKg === pkg.weightKg &&
            item.variant === options.variant &&
            item.processed === options.processed,
        );

        if (existing) {
          return prev.map((item) =>
            item === existing
              ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.pricePerUnit,
              }
              : item,
          );
        }

        return [
          ...prev,
          {
            cartItemId: localId,
            listingId: listing.id,
            fishType: listing.fishType,
            variant: options.variant,
            processed: options.processed,
            weightKg: pkg.weightKg,
            quantity: 1,
            pricePerUnit,
            totalPrice: pricePerUnit,
            businessName: listing.businessName,
            clusterFarmerName: listing.clusterFarmerName,
          },
        ];
      });
      void (async () => {
        try {
          const response = await apiFetch<{ status: string; data: { cartItemId: string } }>(
            "/marketplace/cart",
            {
              method: "POST",
              body: JSON.stringify({
                listingId: listing.id,
                variant: options.variant,
                processed: options.processed,
                weightKg: pkg.weightKg,
                quantity: 1,
                pricePerUnit,
              }),
            },
          );
          const serverId = response.data?.cartItemId;
          if (serverId) {
            setItems((prev) =>
              prev.map((item) =>
                item.cartItemId === localId ? { ...item, cartItemId: serverId } : item,
              ),
            );
          }
        } catch {
          // keep local cart in place even if backend sync fails (e.g. still anonymous —
          // syncWithBackend's guest-cart flush picks this up once they log in)
        }
      })();
      toast.success("Added to cart");
    },
    [],
  );

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setItems((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      if (quantity <= 0) {
        const item = prev[index];
        if (item?.cartItemId) {
          void apiFetch(`/marketplace/cart/${item.cartItemId}`, { method: "DELETE" });
        }
        return prev.filter((_, idx) => idx !== index);
      }
      const item = prev[index];
      if (item?.cartItemId) {
        void apiFetch(`/marketplace/cart/${item.cartItemId}`, {
          method: "PATCH",
          body: JSON.stringify({ quantity }),
        });
      }
      return prev.map((item, idx) =>
        idx === index
          ? { ...item, quantity, totalPrice: quantity * item.pricePerUnit }
          : item,
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    totalItems,
    subtotal,
    synced,
    addToCart,
    updateQuantity,
    clearCart,
    setItems,
  };
}

type CartContextValue = ReturnType<typeof useCartState>;

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCartState();
  return createElement(CartContext.Provider, { value: cart }, children);
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
