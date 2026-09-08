"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Clock, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";
import { buyerService, type BuyerOrderDetail, type BuyerOrderTrackingEvent } from "~/lib/services/buyer.service";

const FULFILLMENT_STAGE_LABELS: Record<string, string> = {
  awaiting_farmer_dispatch: "Awaiting farmer dispatch",
  dispatched_to_cluster: "On the way to the cluster office",
  at_cluster_office: "At the cluster office",
  ready_for_pickup: "Ready for pickup at the cluster office",
  escalated_to_rider: "Escalated to a delivery rider",
  out_for_delivery: "Out for delivery",
  delivered_awaiting_confirmation: "Delivered — please confirm receipt",
  completed: "Completed",
};

const PAYOUT_OPTIONS = ["30 seconds", "5 minutes", "30 minutes", "1 hour", "6 hours", "12 hours", "24 hours"];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [order, setOrder] = useState<BuyerOrderDetail | null>(null);
  const [tracking, setTracking] = useState<BuyerOrderTrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPayoutWindow, setSelectedPayoutWindow] = useState("24 hours");
  const [confirming, setConfirming] = useState(false);
  const [payingNow, setPayingNow] = useState(false);

  const load = async () => {
    if (!orderId) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const [orderRes, trackingRes] = await Promise.all([
        buyerService.getOrder(orderId),
        buyerService.getOrderTracking(orderId),
      ]);
      setOrder(orderRes.data.order);
      setTracking(trackingRes.data.tracking ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handlePayNow = async () => {
    if (!order || !orderId) return;
    setPayingNow(true);
    try {
      const response = await buyerService.payOrderWithWallet(orderId);
      toast.success(
        response.data.status === "completed"
          ? "Payment successful!"
          : "Payment is processing — you'll be notified once it's confirmed.",
      );
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to pay with wallet");
    } finally {
      setPayingNow(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order || !orderId) return;
    setConfirming(true);
    try {
      await buyerService.confirmDelivery(orderId, selectedPayoutWindow);
      toast.success(
        order.fulfillmentMethod === "pickup"
          ? "Pickup confirmed. Payout countdown started."
          : "Delivery confirmed. Payout countdown started.",
      );
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <LoadingState message="Loading order details..." size="lg" />;

  if (errorMessage || !order) {
    return (
      <EmptyState
        icon={Package}
        title="Unable to load order"
        description={errorMessage ?? "We couldn't find the order you're looking for."}
        actionLabel="Back to Orders"
        actionHref="/buyers-dashboard/orders"
        size="lg"
      />
    );
  }

  const canConfirm = ["ready_for_pickup", "delivered_awaiting_confirmation"].includes(order.fulfillmentStage);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
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
          <h1 className="font-ubuntu text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 capitalize">
            {order.status.replace(/_/g, " ")}
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
                        {item.fishType ?? order.listingFishType}
                        {item.variant ? ` • ${item.variant}` : ""}
                      </p>
                      <p className="font-roboto-slab text-sm text-gray-500">
                        {item.weightKg}
                        {item.unit === "piece" ? " piece" : "kg"} × {item.quantity}{" "}
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
                <span>{order.deliveryFee ? `₦${order.deliveryFee.toLocaleString()}` : "None (pickup)"}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="font-ubuntu font-bold text-gray-900">Total</span>
                <span className="font-ubuntu text-xl font-bold text-green-600">
                  ₦{order.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tracking timeline — driven by real OrderTracking events */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Order Tracking</h2>
            {tracking.length === 0 ? (
              <p className="font-roboto-slab text-sm text-gray-500">No tracking events yet.</p>
            ) : (
              <div className="relative ml-4 space-y-6 border-l-2 border-green-200 pb-2">
                {tracking.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[25px] flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-green-100">
                      {idx === tracking.length - 1 ? (
                        <Clock size={16} className="text-green-600" />
                      ) : (
                        <CheckCircle size={16} className="text-green-600" />
                      )}
                    </div>
                    <div className="ml-8">
                      <p className="font-roboto-slab font-semibold text-gray-900 capitalize">
                        {event.status.replace(/_/g, " ")}
                      </p>
                      <p className="font-roboto-slab text-sm text-gray-500">{event.message}</p>
                      <p className="font-roboto-slab text-xs text-gray-400">
                        {new Date(event.createdAt).toLocaleString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Confirm delivery/pickup */}
          {canConfirm && (
            <motion.div
              variants={FADE_IN_VARIANT}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="font-ubuntu mb-2 text-xl font-bold text-gray-900">
                Confirm {order.fulfillmentMethod === "pickup" ? "Pickup" : "Delivery"}
              </h2>
              <p className="font-roboto-slab mb-4 text-sm text-gray-500">
                {order.fulfillmentMethod === "pickup"
                  ? "Confirm you've picked up your order from the cluster office to start the payout countdown."
                  : "Confirm you received your delivery in good condition to start the payout countdown."}
              </p>

              <p className="mb-3 text-sm text-gray-600">Select payout countdown window:</p>
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PAYOUT_OPTIONS.map((option) => (
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

              <button
                onClick={handleConfirmDelivery}
                disabled={confirming}
                className="flex h-12 w-full items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {confirming ? "Confirming..." : `Confirm ${order.fulfillmentMethod === "pickup" ? "Pickup" : "Delivery"}`}
              </button>
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
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Order Number</p>
                <p className="font-roboto-slab font-medium text-gray-900">{order.orderNumber}</p>
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
                <p className="font-roboto-slab font-medium text-gray-900">{order.clusterFarmerName}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Fulfillment</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Method</p>
                <p className="font-roboto-slab font-medium text-gray-900 capitalize">
                  {order.fulfillmentMethod}
                </p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Current Stage</p>
                <p className="font-roboto-slab font-medium text-gray-900">
                  {FULFILLMENT_STAGE_LABELS[order.fulfillmentStage] ?? order.fulfillmentStage}
                </p>
              </div>
              {order.fulfillmentMethod === "pickup" ? (
                <div>
                  <p className="font-roboto-slab mb-1 text-sm text-gray-500">Pickup Location</p>
                  <p className="font-roboto-slab leading-relaxed font-medium text-gray-900">
                    {order.warehouseLocation ?? "Cluster office address will be shared once assigned."}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-roboto-slab mb-1 text-sm text-gray-500">Delivery Address</p>
                  <p className="font-roboto-slab leading-relaxed font-medium text-gray-900">
                    {order.deliveryAddress}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Payment</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Payment Status</p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentStatus !== "paid" && (
                <button
                  onClick={handlePayNow}
                  disabled={payingNow}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {payingNow ? "Processing..." : "Pay Now"}
                </button>
              )}
            </div>
          </motion.div>

          {order.notes && (
            <motion.div
              variants={FADE_IN_VARIANT}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="font-ubuntu mb-2 flex items-center gap-2 text-xl font-bold text-gray-900">
                <FileText size={18} /> Notes
              </h2>
              <p className="font-roboto-slab text-sm text-gray-500">{order.notes}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
