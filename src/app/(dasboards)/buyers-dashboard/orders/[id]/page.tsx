"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT, STATUS_COLORS } from "~/types/constants";
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

const statusIcons: Record<OrderStatus, typeof Package> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

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
        const message = error instanceof Error ? error.message : "Failed to load order";
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

  const StatusIcon = statusIcons[order.status];
  const statusColor = STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800";
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
      const message = error instanceof Error ? error.message : "Failed to confirm delivery";
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
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Orders
          </button>
          <h1 className="font-ubuntu text-3xl font-bold text-gray-900">Order Details</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-4 py-2 text-sm font-medium ${statusColor}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
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
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Items Ordered</h2>
            <div className="flex flex-col gap-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="font-roboto-slab font-semibold text-gray-900">
                        {item.fishType}
                        {item.variant ? ` • ${item.variant}` : ""}
                      </p>
                      <p className="font-roboto-slab text-sm text-gray-500">
                        {item.weightKg}kg Pack × {item.quantity}{" "}
                        {item.processed ? "• Processed" : "• Unprocessed"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-left sm:mt-0 sm:text-right">
                    <p className="font-roboto-slab font-bold text-gray-900">
                      ₦{item.totalPrice.toLocaleString()}
                    </p>
                    <p className="font-roboto-slab text-xs text-gray-500">
                      ₦{item.pricePerUnit.toLocaleString()} per pack
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₦{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span>
                  {order.deliveryFee
                    ? `₦${order.deliveryFee.toLocaleString()}`
                    : "Calculated at checkout"}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="font-ubuntu font-bold text-gray-900">Total</span>
                <span className="font-ubuntu text-xl font-bold text-green-600">
                  ₦{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tracking */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Order Tracking</h2>
            <div className="relative mt-6 ml-4 space-y-8 border-l-2 border-green-200 pb-4">
              <div className="relative">
                <div className="absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-green-100">
                  <Package size={20} className="text-green-600" />
                </div>
                <div className="ml-10">
                  <h3 className="font-roboto-slab font-bold text-gray-900">Order Placed</h3>
                  <p className="font-roboto-slab text-sm text-gray-500">
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
                  className={`absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${["processing", "shipped", "delivered"].includes(order.status) ? "bg-green-100" : "bg-gray-100"}`}
                >
                  <Clock
                    size={20}
                    className={
                      ["processing", "shipped", "delivered"].includes(order.status)
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  />
                </div>
                <div className="ml-10">
                  <h3
                    className={`font-roboto-slab font-bold ${["processing", "shipped", "delivered"].includes(order.status) ? "text-gray-900" : "text-gray-400"}`}
                  >
                    Processing
                  </h3>
                  <p className="font-roboto-slab text-sm text-gray-500">
                    Supplier is preparing your order
                  </p>
                </div>
              </div>

              <div className="relative">
                <div
                  className={`absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${["shipped", "delivered"].includes(order.status) ? "bg-green-100" : "bg-gray-100"}`}
                >
                  <Truck
                    size={20}
                    className={
                      ["shipped", "delivered"].includes(order.status)
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  />
                </div>
                <div className="ml-10">
                  <h3
                    className={`font-roboto-slab font-bold ${["shipped", "delivered"].includes(order.status) ? "text-gray-900" : "text-gray-400"}`}
                  >
                    Shipped
                  </h3>
                  <p className="font-roboto-slab text-sm text-gray-500">Your order is on the way</p>
                </div>
              </div>

              <div className="relative">
                <div
                  className={`absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${order.status === "delivered" ? "bg-green-100" : "bg-gray-100"}`}
                >
                  <CheckCircle
                    size={20}
                    className={order.status === "delivered" ? "text-green-600" : "text-gray-400"}
                  />
                </div>
                <div className="ml-10">
                  <h3
                    className={`font-roboto-slab font-bold ${order.status === "delivered" ? "text-gray-900" : "text-gray-400"}`}
                  >
                    Delivered
                  </h3>
                  <p className="font-roboto-slab text-sm text-gray-500">
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
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="font-ubuntu text-xl font-bold text-gray-900">Confirm Delivery</h2>
                  <p className="font-roboto-slab text-sm text-gray-500">
                    Confirm you received your delivery in good condition to start the 24-hour payout
                    window.
                  </p>
                </div>

                {!deliveryConfirmed ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => setPayoutDropdownOpen((prev) => !prev)}
                      className="font-roboto-slab flex flex-1 items-center justify-center rounded-full border border-green-600 px-6 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                    >
                      Yes, received in good condition
                    </button>
                    <button
                      onClick={() => toast.info("We’ve noted your issue and will follow up.")}
                      className="font-roboto-slab flex flex-1 items-center justify-center rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Report an Issue
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    Delivery confirmed. Payout countdown started for {selectedPayoutWindow}.
                  </div>
                )}

                <AnimatePresence>
                  {payoutDropdownOpen && !deliveryConfirmed && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <p className="mb-3 text-sm text-gray-600">
                        Select payout countdown window (max 24 hours):
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {payoutOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => setSelectedPayoutWindow(option)}
                            className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                              selectedPayoutWindow === option
                                ? "bg-green-600 text-white"
                                : "border border-gray-200 text-gray-700 hover:bg-gray-50"
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
                          className="flex flex-1 items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {confirmingDelivery ? "Confirming..." : "Start Payout Countdown"}
                        </button>
                        <button
                          onClick={() => setPayoutDropdownOpen(false)}
                          className="flex flex-1 items-center justify-center rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
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
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Order Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Order ID</p>
                <p className="font-roboto-slab font-medium text-gray-900">{order.id}</p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Date Placed</p>
                <p className="font-roboto-slab font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Supplier</p>
                <p className="font-roboto-slab font-medium text-gray-900">
                  {order.clusterFarmerName}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">
              Delivery Information
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Delivery Type</p>
                <p className="font-roboto-slab font-medium text-gray-900">{order.deliveryOption}</p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Shipping Address</p>
                <p className="font-roboto-slab leading-relaxed font-medium text-gray-900">
                  {order.deliveryAddress}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Payment Check</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Payment Status</p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
              {order.paymentMethod && (
                <div>
                  <p className="font-roboto-slab mb-1 text-sm text-gray-500">Payment Method</p>
                  <p className="font-roboto-slab font-medium text-gray-900">
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
