"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Package, Truck, XCircle, X } from "lucide-react";
import { toast } from "sonner";
import { clusterService, type BackendClusterOrder, type ApprovedRider } from "~/lib/services/cluster.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

const FULFILLMENT_STAGE_LABELS: Record<string, string> = {
  awaiting_farmer_dispatch: "Awaiting farmer dispatch",
  dispatched_to_cluster: "Dispatched — awaiting your receipt",
  at_cluster_office: "At your office",
  ready_for_pickup: "Ready for buyer pickup",
  escalated_to_rider: "Escalated to rider",
  out_for_delivery: "Out for delivery",
  delivered_awaiting_confirmation: "Delivered — awaiting buyer confirmation",
  completed: "Completed",
};

interface EscalateModalProps {
  isOpen: boolean;
  riders: ApprovedRider[];
  onClose: () => void;
  onConfirm: (riderId: string) => void;
  loading: boolean;
}

function EscalateModal({ isOpen, riders, onClose, onConfirm, loading }: EscalateModalProps) {
  const [selectedRiderId, setSelectedRiderId] = useState("");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-(--white) p-(--space-xl) shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">Escalate to Rider</h3>
              <button onClick={onClose} className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 flex max-h-64 flex-col gap-2 overflow-y-auto">
              {riders.length === 0 ? (
                <p className="font-roboto-slab py-4 text-center text-sm text-(--text-colour)">
                  No approved riders in your region yet.
                </p>
              ) : (
                riders.map((rider) => (
                  <button
                    key={rider.id}
                    onClick={() => setSelectedRiderId(rider.id)}
                    className={`flex items-center justify-between rounded-2xl border p-(--space-md) text-left transition ${
                      selectedRiderId === rider.id
                        ? "border-(--theme-green-dark) bg-green-50"
                        : "border-(--border-gray) hover:bg-(--bg-pink)"
                    }`}
                  >
                    <div>
                      <p className="font-roboto-slab text-sm font-semibold text-(--heading-colour)">
                        {rider.full_name}
                      </p>
                      <p className="font-roboto-slab text-xs text-gray-400">{rider.phone_number}</p>
                    </div>
                    {selectedRiderId === rider.id && <div className="h-4 w-4 rounded-full bg-(--theme-green-dark)" />}
                  </button>
                ))
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-(--gap-base)">
              <button
                onClick={onClose}
                className="font-roboto-slab flex h-12 items-center justify-center rounded-full border border-(--border-gray) text-sm font-medium text-(--text-colour) transition hover:bg-(--bg-pink)"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedRiderId && onConfirm(selectedRiderId)}
                disabled={loading || !selectedRiderId}
                className="font-roboto-slab flex h-12 items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Escalating..." : "Escalate"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ClusterOrdersPage() {
  const [orders, setOrders] = useState<BackendClusterOrder[]>([]);
  const [riders, setRiders] = useState<ApprovedRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [escalateOrderId, setEscalateOrderId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const [ordersRes, ridersRes] = await Promise.all([
          clusterService.getOrders(),
          clusterService.getApprovedRiders(),
        ]);
        if (mounted) {
          setOrders(ordersRes.data.orders ?? []);
          setRiders(ridersRes.data.riders ?? []);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load orders");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await clusterService.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status } : o)));
      toast.success("Order updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    }
  };

  const handleReceive = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await clusterService.receiveOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, fulfillmentStage: "at_cluster_office" } : o)),
      );
      toast.success("Marked received at your office.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReadyForPickup = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await clusterService.markReadyForPickup(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, fulfillmentStage: "ready_for_pickup" } : o)),
      );
      toast.success("Marked ready for pickup.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEscalate = async (riderId: string) => {
    if (!escalateOrderId) return;
    setActionLoading(escalateOrderId);
    try {
      await clusterService.escalateToRider(escalateOrderId, riderId);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === escalateOrderId
            ? { ...o, fulfillmentStage: "escalated_to_rider", assignedRiderId: riderId }
            : o,
        ),
      );
      toast.success("Order escalated to rider.");
      setEscalateOrderId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to escalate order");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading incoming orders..." size="lg" />;
  }

  if (errorMessage) {
    return (
      <EmptyState
        icon={Package}
        title="Unable to load orders"
        description={errorMessage}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
        size="lg"
      />
    );
  }

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div variants={FADE_IN_VARIANT} initial="hidden" animate="visible">
        <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Orders</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Review buyer orders and update fulfillment status
        </p>
      </motion.div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="New orders from buyers will appear here."
          size="lg"
        />
      ) : (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {orders.map((order) => (
            <motion.div
              key={order.orderId}
              variants={FADE_IN_VARIANT}
              className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                    Order #{order.orderId}
                  </h3>
                  <p className="text-sm text-(--text-colour)">
                    {order.buyerName} • {order.buyerPhone}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {order.status}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-(--text-colour)">
                <p>
                  {order.fishType} • {order.variant ?? "table_size"} • {order.processed ? "processed" : "unprocessed"}
                </p>
                <p>
                  {order.weightKg}kg × {order.quantity} • {order.deliveryOption}
                </p>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {order.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.orderId, "confirmed")}
                      className="flex items-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      <CheckCircle size={14} />
                      Accept
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.orderId, "cancelled")}
                      className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </>
                )}

                {order.status === "confirmed" && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, "processing")}
                    className="flex items-center gap-2 rounded-full border border-(--border-gray) px-4 py-2 text-xs font-semibold text-(--heading-colour) transition hover:bg-(--gray-bg)"
                  >
                    <Package size={14} />
                    Start Processing
                  </button>
                )}

                {order.status === "processing" && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, "shipped")}
                    className="flex items-center gap-2 rounded-full border border-(--border-gray) px-4 py-2 text-xs font-semibold text-(--heading-colour) transition hover:bg-(--gray-bg)"
                  >
                    <Truck size={14} />
                    Mark as Shipped
                  </button>
                )}

                {order.status === "shipped" && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, "delivered")}
                    className="flex items-center gap-2 rounded-full border border-(--border-gray) px-4 py-2 text-xs font-semibold text-(--heading-colour) transition hover:bg-(--gray-bg)"
                  >
                    <CheckCircle size={14} />
                    Mark Delivered
                  </button>
                )}
              </div>

              {/* Physical Fulfillment */}
              <div className="mt-4 rounded-xl border border-(--border-gray) bg-(--gray-bg) p-3">
                <p className="font-roboto-slab mb-2 text-xs font-medium text-(--text-colour)">
                  {FULFILLMENT_STAGE_LABELS[order.fulfillmentStage] ?? order.fulfillmentStage}
                </p>
                <div className="flex flex-wrap gap-2">
                  {order.fulfillmentStage === "dispatched_to_cluster" && (
                    <button
                      onClick={() => handleReceive(order.orderId)}
                      disabled={actionLoading === order.orderId}
                      className="flex items-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      <Package size={14} />
                      Confirm Received
                    </button>
                  )}
                  {order.fulfillmentStage === "at_cluster_office" && order.fulfillmentMethod === "pickup" && (
                    <button
                      onClick={() => handleReadyForPickup(order.orderId)}
                      disabled={actionLoading === order.orderId}
                      className="flex items-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      <CheckCircle size={14} />
                      Mark Ready for Pickup
                    </button>
                  )}
                  {order.fulfillmentStage === "at_cluster_office" && order.fulfillmentMethod === "delivery" && (
                    <button
                      onClick={() => setEscalateOrderId(order.orderId)}
                      disabled={actionLoading === order.orderId}
                      className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      <Truck size={14} />
                      Escalate to Rider
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <EscalateModal
        isOpen={!!escalateOrderId}
        riders={riders}
        onClose={() => setEscalateOrderId(null)}
        onConfirm={handleEscalate}
        loading={!!actionLoading}
      />
    </div>
  );
}
