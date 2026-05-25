"use client";

// Re-export everything from CartContext so existing imports keep working.
// Cart state is now shared via CartProvider in the marketplace layout.
export type { CartItem } from "~/context/CartContext";
export { useCartContext as useCart } from "~/context/CartContext";
