"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Package, Truck } from "lucide-react";
import { useCart } from "~/components/marketplace/useCart";
import { BASE_DELIVERY_FEE_NAIRA } from "~/types/constants";
import { apiFetch } from "~/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const derivedDeliveryType = useMemo(
    () => (cart.items.some((item) => item.deliveryType === "delivery") ? "delivery" : "pickup"),
    [cart.items],
  );

  const deliveryFee = derivedDeliveryType === "delivery" ? BASE_DELIVERY_FEE_NAIRA : 0;
  const totalAmount = cart.subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (derivedDeliveryType === "delivery") {
      if (!deliveryAddress.trim()) {
        setAddressError("Delivery address is required.");
        toast.error("Please provide a delivery address");
        return;
      }
      if (deliveryAddress.trim().length < 10) {
        setAddressError("Please provide a more specific delivery address.");
        toast.error("Delivery address looks too short");
        return;
      }
    }
    setAddressError(null);

    setSubmitting(true);
    try {
      await apiFetch("/marketplace/checkout", {
        method: "POST",
        body: JSON.stringify({
          deliveryType: derivedDeliveryType,
          deliveryAddress: derivedDeliveryType === "delivery" ? deliveryAddress : undefined,
          deliveryFee,
          cartItems: cart.items.map((item) => ({
            cartItemId: item.cartItemId ?? `${item.listingId}-${item.weightKg}-${item.variant}`,
            quantity: item.quantity,
          })),
          totalAmount,
        }),
      });

      toast.success("Order placed successfully");
      cart.clearCart();
      router.push("/buyers-dashboard/orders");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to place order";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--gray-bg)">
      <div className="container-max-width px-(--section-px) py-(--section-py) sm:px-(--section-px-sm) sm:py-(--section-py-sm) lg:px-(--section-px-lg) lg:py-(--section-py-lg)">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-(--gap-lg) lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-(--white) p-(--space-xl) shadow-sm">
              <h1 className="font-ubuntu text-2xl font-bold text-(--heading-colour)">
                Checkout
              </h1>
              <p className="mt-1 text-sm text-(--text-colour)">
                Review your cart and confirm delivery options.
              </p>

              <div className="mt-6 flex flex-col gap-4">
                {cart.items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-(--border-gray) p-6 text-center text-sm text-(--text-colour)">
                    Your cart is empty.
                  </div>
                ) : (
                  cart.items.map((item, index) => (
                    <div
                      key={`${item.listingId}-${item.weightKg}-${item.variant}-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-(--border-gray) p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-roboto-slab font-semibold text-(--heading-colour)">
                            {item.fishType} • {item.variant}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.processed ? "Processed" : "Unprocessed"} • {item.weightKg}kg pack
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-(--heading-colour)">
                          ₦{item.totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Qty: {item.quantity}</span>
                        <span>₦{item.pricePerUnit.toLocaleString()} per pack</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8">
                <h2 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                  Delivery Preferences (Per Item)
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  {cart.items.map((item, index) => (
                    <div
                      key={`${item.listingId}-${item.weightKg}-${item.variant}-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-(--border-gray) p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-(--heading-colour)">
                          {item.fishType} • {item.variant}
                        </p>
                        <p className="text-xs text-(--text-colour)">
                          {item.weightKg}kg pack × {item.quantity}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => cart.updateDeliveryType(index, "pickup")}
                          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                            item.deliveryType === "pickup"
                              ? "border-(--theme-green-dark) bg-green-50 text-(--theme-green-dark)"
                              : "border-(--border-gray) text-(--text-colour) hover:bg-(--gray-bg)"
                          }`}
                        >
                          <Package size={14} />
                          Pickup
                        </button>
                        <button
                          onClick={() => cart.updateDeliveryType(index, "delivery")}
                          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                            item.deliveryType === "delivery"
                              ? "border-(--theme-green-dark) bg-green-50 text-(--theme-green-dark)"
                              : "border-(--border-gray) text-(--text-colour) hover:bg-(--gray-bg)"
                          }`}
                        >
                          <Truck size={14} />
                          Delivery
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {derivedDeliveryType === "delivery" && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-(--heading-colour)">
                      Delivery Address
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (addressError) setAddressError(null);
                      }}
                      className={`mt-2 h-24 w-full rounded-2xl border p-4 text-sm text-(--text-colour) outline-none transition ${
                        addressError
                          ? "border-red-400 focus:border-red-500"
                          : "border-(--border-input) focus:border-(--theme-green-dark)"
                      }`}
                      placeholder="Enter delivery address"
                    />
                    {addressError && (
                      <p className="mt-2 text-xs text-red-500">{addressError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-3xl bg-(--white) p-(--space-xl) shadow-sm">
              <h2 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                Order Summary
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm text-(--text-colour)">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-(--heading-colour)">
                    ₦{cart.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-(--heading-colour)">
                    ₦{deliveryFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-(--border-gray) pt-3">
                  <span className="font-ubuntu text-base font-bold text-(--heading-colour)">
                    Total
                  </span>
                  <span className="font-ubuntu text-base font-bold text-(--theme-green-dark)">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Place Order"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
