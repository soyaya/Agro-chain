"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { clusterService, type BackendClusterOrder } from "~/lib/services/cluster.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

export default function ClusterOrdersPage() {
  const [orders, setOrders] = useState<BackendClusterOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await clusterService.getOrders();
        if (mounted) {
          setOrders(response.data.orders ?? []);
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
        <h1 className="font-ubuntu text-heading-colour text-3xl font-bold">Orders</h1>
        <p className="font-roboto-slab text-text-colour">
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
              className="border-gray-border rounded-2xl border bg-(--white) p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-ubuntu text-heading-colour text-lg font-bold">
                    Order #{order.orderId}
                  </h3>
                  <p className="text-text-colour text-sm">
                    {order.buyerName} • {order.buyerPhone}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {order.status}
                </span>
              </div>

              <div className="text-text-colour mt-4 flex flex-col gap-2 text-sm">
                <p>
                  {order.fishType} • {order.variant ?? "table_size"} •{" "}
                  {order.processed ? "processed" : "unprocessed"}
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
                      className="bg-theme-green-dark flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
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
                    className="border-gray-border text-heading-colour hover:bg-gray-bg flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition"
                  >
                    <Package size={14} />
                    Start Processing
                  </button>
                )}

                {order.status === "processing" && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, "shipped")}
                    className="border-gray-border text-heading-colour hover:bg-gray-bg flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition"
                  >
                    <Truck size={14} />
                    Mark as Shipped
                  </button>
                )}

                {order.status === "shipped" && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, "delivered")}
                    className="border-gray-border text-heading-colour hover:bg-gray-bg flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition"
                  >
                    <CheckCircle size={14} />
                    Mark Delivered
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
