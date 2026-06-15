"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import type { Order } from "~/types";
import {
  FADE_IN_VARIANT,
  STAGGER_CONTAINER_VARIANT,
  STATUS_COLORS,
} from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";
import { apiFetch } from "~/lib/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractOrder(response: any): Order | null {
  if (response && typeof response === "object") {
    if ("id" in response) return response as Order;
    if (response.data?.order) return response.data.order as Order;
    if (response.order) return response.order as Order;
    if (response.data) return response.data as Order;
  }
  return null;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [payoutDropdownOpen, setPayoutDropdownOpen] = useState(false);
  const [selectedPayoutWindow, setSelectedPayoutWindow] = useState("24 hours");
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await apiFetch(`/buyers/orders/${orderId}`);
        const payload = extractOrder(response);
        if (mounted) {
          setOrder(payload ?? null);
          setDeliveryConfirmed(Boolean(payload?.deliveryConfirmed));
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load order";
        if (mounted) {
          setErrorMessage(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (orderId) {
      void loadOrder();
    }

    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (loading) {
    return <LoadingState message="Loading order details..." size="lg" />;
  }

  if (errorMessage) {
    return (
      <EmptyState
        icon={Package}
        title="Unable to load order"
        description={errorMessage}
        actionLabel="Back to Orders"
        actionHref="/buyers-dashboard/orders"
        size="lg"
      />
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon={Package}
        title="Order Not Found"
        description="We couldn't find the order you're looking for."
        actionLabel="Back to Orders"
        actionHref="/buyers-dashboard/orders"
        size="lg"
      />
    );
  }

  const statusColor =
    STATUS_COLORS[order.status] || "bg-gray-bg text-text-colour-2";
  const payoutOptions = [
    "30 seconds",
    "5 minutes",
    "30 minutes",
    "1 hour",
    "6 hours",
    "12 hours",
    "24 hours",
  ];

  const handleConfirmDelivery = async () => {
    if (!order) return;
    setConfirmingDelivery(true);
    try {
      await apiFetch(`/buyers/orders/${order.id}/confirm-delivery`, {
        method: "PATCH",
        body: JSON.stringify({ payoutDelay: selectedPayoutWindow }),
      });
      setDeliveryConfirmed(true);
      toast.success("Delivery confirmed. Payout countdown started.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to confirm delivery";
      toast.error(message);
    } finally {
      setConfirmingDelivery(false);
      setPayoutDropdownOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push("/buyers-dashboard/orders")}
            className="group text-muted-text hover:text-heading-colour flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Orders
          </button>
          <h1 className="font-ubuntu text-heading-colour text-3xl font-bold">
            Order Details
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-4 py-2 text-sm font-medium ${statusColor}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <button className="border-gray-border text-text-colour-2 hover:bg-gray-bg flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium">
            <FileText size={16} />
            Invoice
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Order Items */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="border-gray-border rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu text-heading-colour mb-4 text-xl font-bold">
              Items Ordered
            </h2>
            <div className="flex flex-col gap-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="border-gray-border bg-gray-bg flex flex-col rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-green-tint text-theme-green-dark flex h-12 w-12 items-center justify-center rounded-lg">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="font-roboto-slab text-heading-colour font-semibold">
                        {item.fishType}
                        {item.variant ? ` • ${item.variant}` : ""}
                      </p>
                      <p className="font-roboto-slab text-muted-text text-sm">
                        {item.weightKg}kg Pack × {item.quantity}{" "}
                        {item.processed ? "• Processed" : "• Unprocessed"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-left sm:mt-0 sm:text-right">
                    <p className="font-roboto-slab text-heading-colour font-bold">
                      ₦{item.totalPrice.toLocaleString()}
                    </p>
                    <p className="font-roboto-slab text-muted-text text-xs">
                      ₦{item.pricePerUnit.toLocaleString()} per pack
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-gray-border mt-6 flex flex-col gap-3 border-t pt-6">
              <div className="text-text-colour flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₦{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="text-text-colour flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>
                  {order.deliveryFee
                    ? `₦${order.deliveryFee.toLocaleString()}`
                    : "Calculated at checkout"}
                </span>
              </div>
              <div className="border-gray-border flex justify-between border-t pt-3">
                <span className="font-ubuntu text-heading-colour font-bold">
                  Total
                </span>
                <span className="font-ubuntu text-theme-green-dark text-xl font-bold">
                  ₦{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tracking */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="border-gray-border rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu text-heading-colour mb-4 text-xl font-bold">
              Order Tracking
            </h2>
            <div className="border-gray-border relative mt-6 ml-4 space-y-8 border-l-2 pb-4">
              <div className="relative">
                <div className="bg-green-tint absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white">
                  <Package size={20} className="text-theme-green-dark" />
                </div>
                <div className="ml-10">
                  <h3 className="font-roboto-slab text-heading-colour font-bold">
                    Order Placed
                  </h3>
                  <p className="font-roboto-slab text-muted-text text-sm">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div
                  className={`absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${["processing", "shipped", "delivered"].includes(order.status) ? "bg-green-tint" : "bg-gray-bg"}`}
                >
                  <Clock
                    size={20}
                    className={
                      ["processing", "shipped", "delivered"].includes(
                        order.status,
                      )
                        ? "text-theme-green-dark"
                        : "text-muted-text"
                    }
                  />
                </div>
                <div className="ml-10">
                  <h3
                    className={`font-roboto-slab font-bold ${["processing", "shipped", "delivered"].includes(order.status) ? "text-heading-colour" : "text-muted-text"}`}
                  >
                    Processing
                  </h3>
                  <p className="font-roboto-slab text-muted-text text-sm">
                    Supplier is preparing your order
                  </p>
                </div>
              </div>

              <div className="relative">
                <div
                  className={`absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${["shipped", "delivered"].includes(order.status) ? "bg-green-tint" : "bg-gray-bg"}`}
                >
                  <Truck
                    size={20}
                    className={
                      ["shipped", "delivered"].includes(order.status)
                        ? "text-theme-green-dark"
                        : "text-muted-text"
                    }
                  />
                </div>
                <div className="ml-10">
                  <h3
                    className={`font-roboto-slab font-bold ${["shipped", "delivered"].includes(order.status) ? "text-heading-colour" : "text-muted-text"}`}
                  >
                    Shipped
                  </h3>
                  <p className="font-roboto-slab text-muted-text text-sm">
                    Your order is on the way
                  </p>
                </div>
              </div>

              <div className="relative">
                <div
                  className={`absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${order.status === "delivered" ? "bg-green-tint" : "bg-gray-bg"}`}
                >
                  <CheckCircle
                    size={20}
                    className={
                      order.status === "delivered"
                        ? "text-theme-green-dark"
                        : "text-muted-text"
                    }
                  />
                </div>
                <div className="ml-10">
                  <h3
                    className={`font-roboto-slab font-bold ${order.status === "delivered" ? "text-heading-colour" : "text-muted-text"}`}
                  >
                    Delivered
                  </h3>
                  <p className="font-roboto-slab text-muted-text text-sm">
                    Order successfully delivered
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delivery Confirmation */}
          {order.status === "delivered" && (
            <motion.div
              variants={FADE_IN_VARIANT}
              className="border-gray-border rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="font-ubuntu text-heading-colour text-xl font-bold">
                    Confirm Delivery
                  </h2>
                  <p className="font-roboto-slab text-muted-text text-sm">
                    Confirm you received your delivery in good condition to
                    start the 24-hour payout window.
                  </p>
                </div>

                {!deliveryConfirmed ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => setPayoutDropdownOpen((prev) => !prev)}
                      className="font-roboto-slab text-theme-green-dark hover:bg-green-tint flex flex-1 items-center justify-center rounded-full border border-green-600 px-6 py-3 text-sm font-semibold transition"
                    >
                      Yes, received in good condition
                    </button>
                    <button
                      onClick={() =>
                        toast.info("We’ve noted your issue and will follow up.")
                      }
                      className="font-roboto-slab border-gray-border text-text-colour-2 hover:bg-gray-bg flex flex-1 items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition"
                    >
                      Report an Issue
                    </button>
                  </div>
                ) : (
                  <div className="border-gray-border bg-green-tint text-theme-green-dark rounded-xl border p-4 text-sm">
                    Delivery confirmed. Payout countdown started for{" "}
                    {selectedPayoutWindow}.
                  </div>
                )}

                <AnimatePresence>
                  {payoutDropdownOpen && !deliveryConfirmed && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-gray-border rounded-2xl border bg-white p-4 shadow-sm"
                    >
                      <p className="text-text-colour mb-3 text-sm">
                        Select payout countdown window (max 24 hours):
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {payoutOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => setSelectedPayoutWindow(option)}
                            className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                              selectedPayoutWindow === option
                                ? "bg-theme-green-dark text-white"
                                : "border-gray-border text-text-colour-2 hover:bg-gray-bg border"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          onClick={handleConfirmDelivery}
                          disabled={confirmingDelivery}
                          className="bg-theme-green-dark hover:bg-theme-green-light flex flex-1 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {confirmingDelivery
                            ? "Confirming..."
                            : "Start Payout Countdown"}
                        </button>
                        <button
                          onClick={() => setPayoutDropdownOpen(false)}
                          className="border-gray-border text-text-colour-2 hover:bg-gray-bg flex flex-1 items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-6">
          <motion.div
            variants={FADE_IN_VARIANT}
            className="border-gray-border rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu text-heading-colour mb-4 text-xl font-bold">
              Order Details
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab text-muted-text mb-1 text-sm">
                  Order ID
                </p>
                <p className="font-roboto-slab text-heading-colour font-medium">
                  {order.id}
                </p>
              </div>
              <div>
                <p className="font-roboto-slab text-muted-text mb-1 text-sm">
                  Date Placed
                </p>
                <p className="font-roboto-slab text-heading-colour font-medium">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="font-roboto-slab text-muted-text mb-1 text-sm">
                  Supplier
                </p>
                <p className="font-roboto-slab text-heading-colour font-medium">
                  {order.clusterFarmerName}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={FADE_IN_VARIANT}
            className="border-gray-border rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu text-heading-colour mb-4 text-xl font-bold">
              Delivery Information
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab text-muted-text mb-1 text-sm">
                  Delivery Type
                </p>
                <p className="font-roboto-slab text-heading-colour font-medium">
                  {order.deliveryOption}
                </p>
              </div>
              <div>
                <p className="font-roboto-slab text-muted-text mb-1 text-sm">
                  Shipping Address
                </p>
                <p className="font-roboto-slab text-heading-colour leading-relaxed font-medium">
                  {order.deliveryAddress}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={FADE_IN_VARIANT}
            className="border-gray-border rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu text-heading-colour mb-4 text-xl font-bold">
              Payment Check
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab text-muted-text mb-1 text-sm">
                  Payment Status
                </p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    order.paymentStatus === "paid"
                      ? "bg-green-tint text-theme-green-dark"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
              {order.paymentMethod && (
                <div>
                  <p className="font-roboto-slab text-muted-text mb-1 text-sm">
                    Payment Method
                  </p>
                  <p className="font-roboto-slab text-heading-colour font-medium">
                    {order.paymentMethod}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
