"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Package, Truck, Clock } from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT, STATUS_COLORS } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";
import { apiFetch } from "~/lib/api";

type OrdersResponse = Order[] | { orders?: Order[]; data?: Order[] };

export default function ClusterOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await apiFetch<OrdersResponse>("/cluster/orders");
        const payload = Array.isArray(response) ? response : response.orders ?? response.data ?? [];
        if (mounted) {
          setOrders(payload);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load orders";
        if (mounted) {
          setErrorMessage(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await apiFetch(`/cluster/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status } : order)),
      );
      toast.success("Order updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update order";
      toast.error(message);
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
              key={order.id}
              variants={FADE_IN_VARIANT}
              className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-(--text-colour)">
                    {order.buyerName} • {order.buyerPhone}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-(--text-colour)">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>
                      {item.fishType} • {item.variant ?? "Table Size"} •{" "}
                      {item.processed ? "Processed" : "Unprocessed"} • {item.weightKg}kg ×{" "}
                      {item.quantity}
                    </span>
                    <span className="font-semibold text-(--heading-colour)">
                      ₦{item.totalPrice.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-(--text-colour)">
                <div className="flex items-center gap-2">
                  <Truck size={14} />
                  <span>{order.deliveryOption}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {order.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.id, "confirmed")}
                      className="flex items-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      <CheckCircle size={14} />
                      Accept
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "cancelled")}
                      className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </>
                )}

                {order.status === "confirmed" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "processing")}
                    className="flex items-center gap-2 rounded-full border border-(--border-gray) px-4 py-2 text-xs font-semibold text-(--heading-colour) transition hover:bg-(--gray-bg)"
                  >
                    <Package size={14} />
                    Start Processing
                  </button>
                )}

                {order.status === "processing" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "shipped")}
                    className="flex items-center gap-2 rounded-full border border-(--border-gray) px-4 py-2 text-xs font-semibold text-(--heading-colour) transition hover:bg-(--gray-bg)"
                  >
                    <Truck size={14} />
                    Mark as Shipped
                  </button>
                )}

                {order.status === "shipped" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "delivered")}
                    className="flex items-center gap-2 rounded-full border border-(--border-gray) px-4 py-2 text-xs font-semibold text-(--heading-colour) transition hover:bg-(--gray-bg)"
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
