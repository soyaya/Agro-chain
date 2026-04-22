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

export function CartDrawer({ isOpen, items, subtotal, onClose, onUpdateQuantity }: CartDrawerProps) {
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
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-(--white) shadow-xl"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-(--theme-green-dark)" />
                <h2 className="font-ubuntu text-lg font-bold text-(--heading-colour)">Your Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <ShoppingBag size={40} className="text-gray-300" />
                  <p className="text-sm text-gray-500">Your cart is empty.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item, index) => (
                    <div
                      key={`${item.listingId}-${item.weightKg}-${item.variant}-${item.processed}-${index}`}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-roboto-slab font-semibold text-(--heading-colour)">
                            {item.fishType} • {item.variant}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.processed ? "Processed" : "Unprocessed"} • {item.weightKg}kg pack •{" "}
                            {item.deliveryType === "delivery" ? "Delivery" : "Pickup"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.clusterFarmerName}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-(--heading-colour)">
                          ₦{item.totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-medium text-(--heading-colour)">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-white"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          ₦{item.pricePerUnit.toLocaleString()} per pack
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-(--heading-colour)">
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
                    ? "cursor-not-allowed bg-gray-300"
                    : "bg-(--theme-green-dark) hover:opacity-90"
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
