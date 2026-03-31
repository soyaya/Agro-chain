"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  } catch (error) {
    return [];
  }
};

const computePricePerUnit = (pkg: PackagingOption) => pkg.pricePerUnit ?? pkg.weightKg * BASE_PRICE_PER_KG_NAIRA;

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getInitialCart());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

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
          const response = await apiFetch<{ cartItemId?: string } | { id?: string }>(
            "/marketplace/cart",
            {
              method: "POST",
              body: JSON.stringify({
                listingId: listing.id,
                variant: options.variant,
                processed: options.processed,
                weightKg: pkg.weightKg,
                quantity: 1,
              }),
            },
          );
          const serverId = (response as { cartItemId?: string }).cartItemId ?? response.id;
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
    addToCart,
    updateQuantity,
    updateDeliveryType,
    clearCart,
    setItems,
  };
}
