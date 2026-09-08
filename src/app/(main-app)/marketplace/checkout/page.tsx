"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Package, Truck } from "lucide-react";
import { useCart } from "~/components/marketplace/useCart";
import { isSeedlingFishType } from "~/types/constants";
import { apiFetch } from "~/lib/api";
import { buyerService } from "~/lib/services/buyer.service";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  // Delivery is one consolidated trip for the whole order, not a per-item
  // choice — the buyer picks pickup or delivery once, and the price scales
  // with the order's total weight.
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  // Admin-configured, weight-tiered fee, fetched fresh so what the buyer sees
  // here always matches what the backend actually charges at checkout (it
  // recomputes this server-side and ignores any client-supplied value).
  const [realDeliveryFee, setRealDeliveryFee] = useState<number | null>(null);

  const totalWeightKg = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.weightKg, 0),
    [cart.items],
  );

  useEffect(() => {
    if (deliveryType !== "delivery") {
      setRealDeliveryFee(null);
      return;
    }
    let mounted = true;
    const firstListingId = cart.items[0]?.listingId;
    const params = new URLSearchParams({ totalWeightKg: String(totalWeightKg) });
    if (firstListingId) params.set("listingId", firstListingId);
    apiFetch<{ data: { deliveryFee: number } }>(`/marketplace/delivery-fee?${params.toString()}`)
      .then((res) => {
        if (mounted) setRealDeliveryFee(res.data.deliveryFee);
      })
      .catch(() => {
        // Non-fatal — the actual charge is still computed correctly server-side;
        // this only affects the pre-payment preview.
      });
    return () => {
      mounted = false;
    };
  }, [deliveryType, totalWeightKg, cart.items]);

  const deliveryFee = deliveryType === "delivery" ? (realDeliveryFee ?? 0) : 0;
  const totalAmount = cart.subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (deliveryType === "delivery") {
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
      const checkoutResponse = await apiFetch<{ data: { order: { id: string; grand_total: number } } }>(
        "/marketplace/checkout",
        {
          method: "POST",
          body: JSON.stringify({
            deliveryType,
            deliveryAddress: deliveryType === "delivery" ? deliveryAddress : undefined,
            // deliveryFee is computed server-side from admin settings — not sent.
            cartItems: cart.items.map((item) => ({
              cartItemId: item.cartItemId ?? `${item.listingId}-${item.weightKg}-${item.variant}`,
              quantity: item.quantity,
            })),
            // The backend's `totalAmount` field is the pre-delivery subtotal —
            // it adds deliveryFee itself for grand_total. Sending the
            // fee-inclusive `totalAmount` here double-counts delivery.
            totalAmount: cart.subtotal,
          }),
        },
      );

      const order = checkoutResponse.data.order;
      cart.clearCart();

      try {
        const paymentResponse = await buyerService.payOrderWithWallet(order.id);
        toast.success(
          paymentResponse.data.status === "completed"
            ? "Payment successful!"
            : "Payment is processing — you'll be notified once it's confirmed.",
        );
      } catch (paymentError) {
        // Order already exists server-side (payment_pending) — send the buyer to
        // the order detail page so they can retry payment from there instead of
        // stranding them on an empty checkout page.
        const message =
          paymentError instanceof Error ? paymentError.message : "Failed to start payment";
        toast.error(`${message}. You can retry payment from your order.`);
      }
      router.push(`/buyers-dashboard/orders/${order.id}`);
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
                            {item.processed ? "Processed" : "Unprocessed"} •{" "}
                            {isSeedlingFishType(item.fishType) ? `${item.weightKg} piece` : `${item.weightKg}kg`} pack
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-(--heading-colour)">
                          ₦{Number(item.totalPrice).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Qty: {item.quantity}</span>
                        <span>₦{Number(item.pricePerUnit).toLocaleString()} per pack</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8">
                <h2 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                  Delivery
                </h2>
                <p className="mt-1 text-xs text-(--text-colour)">
                  One delivery covers your whole order — the fee scales with total weight
                  ({totalWeightKg}kg).
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setDeliveryType("pickup")}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                      deliveryType === "pickup"
                        ? "border-(--theme-green-dark) bg-green-50 text-(--theme-green-dark)"
                        : "border-(--border-gray) text-(--text-colour) hover:bg-(--gray-bg)"
                    }`}
                  >
                    <Package size={14} />
                    Pickup
                  </button>
                  <button
                    onClick={() => setDeliveryType("delivery")}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                      deliveryType === "delivery"
                        ? "border-(--theme-green-dark) bg-green-50 text-(--theme-green-dark)"
                        : "border-(--border-gray) text-(--text-colour) hover:bg-(--gray-bg)"
                    }`}
                  >
                    <Truck size={14} />
                    Delivery
                  </button>
                </div>

                {deliveryType === "delivery" && (
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
