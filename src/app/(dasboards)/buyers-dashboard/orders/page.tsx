"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { buyerService, type BackendOrder } from "~/lib/services/buyer.service";
import {
  FADE_IN_VARIANT,
  STAGGER_CONTAINER_VARIANT,
  STATUS_COLORS,
} from "~/types/constants";
import { EmptyState } from "~/components/ui/EmptyState";
import { LoadingState } from "~/components/ui/LoadingState";

export default function BuyerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await buyerService.getOrders();
        if (mounted) {
          setOrders(response.data.orders ?? []);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load orders";
        if (mounted) {
          setErrorMessage(message);
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

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const statusCounts: Record<string, number> = {
    all: orders.length,
    pending: orders.filter((o) =>
      ["pending", "payment_pending"].includes(o.status),
    ).length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading) {
    return <LoadingState message="Loading your orders..." size="lg" />;
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
    <div className="flex flex-col gap-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-ubuntu text-heading-colour mb-2 text-3xl font-bold">
          My Orders
        </h1>
        <p className="font-roboto-slab text-text-colour">
          Track and manage your fish orders
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7"
      >
        {(
          [
            "all",
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
          ] as const
        ).map((status) => (
          <motion.button
            key={status}
            variants={FADE_IN_VARIANT}
            onClick={() => setFilterStatus(status)}
            className={`flex flex-col gap-1 rounded-2xl border p-4 transition-all duration-200 ${
              filterStatus === status
                ? "border-theme-green-dark bg-green-tint"
                : "border-gray-border hover:bg-pink-bg bg-(--white)"
            }`}
          >
            <span className="font-ubuntu text-heading-colour text-xl font-bold">
              {statusCounts[status]}
            </span>
            <span className="font-roboto-slab text-text-colour text-xs capitalize">
              {status}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4"
        >
          {filteredOrders.map((order) => {
            const statusColor =
              STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] ??
              "bg-gray-bg text-text-colour-2";

            return (
              <motion.div
                key={order.orderId}
                variants={FADE_IN_VARIANT}
                className="border-gray-border rounded-2xl border bg-(--white) p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-ubuntu text-heading-colour text-base font-semibold">
                        {order.orderNumber}
                      </h3>
                      <p className="font-roboto-slab text-text-colour text-sm">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}
                    >
                      {order.status
                        ? order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)
                        : "-"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="font-roboto-slab text-text-colour mb-0.5 text-xs">
                        Supplier
                      </p>
                      <p className="font-roboto-slab text-heading-colour font-medium">
                        {order.clusterFarmerName ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="font-roboto-slab text-text-colour mb-0.5 text-xs">
                        Delivery
                      </p>
                      <p className="font-roboto-slab text-heading-colour font-medium">
                        {order.deliveryOption ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="font-roboto-slab text-text-colour mb-0.5 text-xs">
                        Payment
                      </p>
                      <p
                        className={`font-roboto-slab font-medium ${order.payment_status === "paid" ? "text-theme-green-dark" : "text-amber-600"}`}
                      >
                        {order.payment_status
                          ? order.payment_status.charAt(0).toUpperCase() +
                            order.payment_status.slice(1)
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-gray-border flex border-t pt-3">
                    <button
                      onClick={() =>
                        router.push(`/buyers-dashboard/orders/${order.orderId}`)
                      }
                      className="font-roboto-slab bg-theme-green-dark flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      <Eye size={15} />
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={
            filterStatus === "all"
              ? "You haven't placed any orders yet. Browse the marketplace to get started!"
              : `No ${filterStatus} orders at the moment`
          }
          actionLabel={
            filterStatus === "all" ? "Browse Marketplace" : undefined
          }
          actionHref={filterStatus === "all" ? "/marketplace" : undefined}
          size="lg"
        />
      )}
    </div>
  );
}
