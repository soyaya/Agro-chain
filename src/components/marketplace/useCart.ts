"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { MarketplaceListing, PackagingOption } from "~/types";
import { FALLBACK_PRICES_PER_KG, type FishType, type FishVariant } from "~/types/constants";
import { apiFetch } from "~/lib/api";
import { usePlatformSettings } from "~/context/PlatformSettingsContext";

export interface CartItem {
  cartItemId?: string;
  listingId: string;
  fishType: string;
  variant: FishVariant;
  processed: boolean;
  deliveryType: "pickup" | "delivery";
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
  } catch {
    return [];
  }
};

export function useCart() {
  const { pricePerKg } = usePlatformSettings();

  const computePricePerUnit = (pkg: PackagingOption, fishType: string): number => {
    if (pkg.pricePerUnit != null) return pkg.pricePerUnit;
    const rate = pricePerKg[fishType as FishType] ?? FALLBACK_PRICES_PER_KG.catfish;
    return pkg.weightKg * rate;
  };
  const [items, setItems] = useState<CartItem[]>([]);
  const [synced, setSynced] = useState(false);

  // Hydrate from localStorage first, then sync with backend cart if logged in
  useEffect(() => {
    setItems(getInitialCart());

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
            deliveryType: "pickup" as const,
            weightKg: Number(item.weightKg),
            quantity: item.quantity,
            pricePerUnit: Number(item.pricePerUnit),
            totalPrice: Number(item.totalPrice),
            businessName: "",
            clusterFarmerName: "",
          }));
          setItems(mapped);
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

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice, 0),
    [items],
  );

  const addToCart = useCallback(
    (
      listing: MarketplaceListing,
      pkg: PackagingOption,
      options: { variant: FishVariant; processed: boolean },
    ) => {
      const pricePerUnit = computePricePerUnit(pkg, listing.fishType);
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
            deliveryType: "pickup",
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
          // keep local cart in place even if backend sync fails
        }
      })();
      toast.success("Added to cart");
    },
    [],
  );

  const updateDeliveryType = useCallback((index: number, deliveryType: "pickup" | "delivery") => {
    setItems((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      return prev.map((item, idx) => (idx === index ? { ...item, deliveryType } : item));
    });
  }, []);

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
    updateDeliveryType,
    clearCart,
    setItems,
  };
}
