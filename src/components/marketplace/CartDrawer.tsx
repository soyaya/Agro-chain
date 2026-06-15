"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { CartItem } from "./useCart";

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
}

export function CartDrawer({
  isOpen,
  items,
  subtotal,
  onClose,
  onUpdateQuantity,
}: CartDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-(--white) shadow-xl"
            aria-label="Shopping cart"
          >
            <div className="border-gray-border flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-theme-green-dark" />
                <h2 className="font-ubuntu text-heading-colour text-lg font-bold">
                  Your Cart
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted-text hover:bg-gray-bg rounded-full p-2 transition"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <ShoppingBag size={40} className="text-muted-text" />
                  <p className="text-muted-text text-sm">Your cart is empty.</p>
                </div>
              ) : (
                <motion.div layout className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {items.map((item, index) => (
                      <motion.div
                        key={`${item.listingId}-${item.weightKg}-${item.variant}-${item.processed}-${index}`}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          x: 40,
                          transition: { duration: 0.2 },
                        }}
                        transition={{ duration: 0.25 }}
                        className="border-gray-border bg-gray-bg rounded-2xl border p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-roboto-slab text-heading-colour font-semibold">
                              {item.fishType} • {item.variant}
                            </p>
                            <p className="text-muted-text text-xs">
                              {item.processed ? "Processed" : "Unprocessed"} •{" "}
                              {item.weightKg}kg pack •{" "}
                              {item.deliveryType === "delivery"
                                ? "Delivery"
                                : "Pickup"}
                            </p>
                            <p className="text-muted-text mt-1 text-xs">
                              {item.clusterFarmerName}
                            </p>
                          </div>
                          <p className="text-heading-colour text-sm font-semibold">
                            ₦{item.totalPrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                onUpdateQuantity(index, item.quantity - 1)
                              }
                              className="border-gray-border text-text-colour flex h-8 w-8 items-center justify-center rounded-full border transition hover:bg-white"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-heading-colour text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                onUpdateQuantity(index, item.quantity + 1)
                              }
                              className="border-gray-border text-text-colour flex h-8 w-8 items-center justify-center rounded-full border transition hover:bg-white"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="text-muted-text text-xs">
                            ₦{item.pricePerUnit.toLocaleString()} per pack
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            <div className="border-gray-border border-t px-6 py-4">
              <div className="text-text-colour flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span className="text-heading-colour font-semibold">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>
              <Link
                href={items.length === 0 ? "#" : "/marketplace/checkout"}
                onClick={(event) => {
                  if (items.length === 0) {
                    event.preventDefault();
                  }
                }}
                className={`mt-4 flex h-12 items-center justify-center rounded-full text-sm font-semibold text-white transition ${
                  items.length === 0
                    ? "bg-gray-border cursor-not-allowed"
                    : "bg-theme-green-dark hover:opacity-90"
                }`}
                aria-disabled={items.length === 0}
              >
                Proceed to Checkout
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
