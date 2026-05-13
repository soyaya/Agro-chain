"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { buyerService, type BackendOrder } from "~/lib/services/buyer.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT, STATUS_COLORS } from "~/types/constants";
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

    void loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredOrders =
    filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  const statusCounts: Record<string, number> = {
    all: orders.length,
    pending: orders.filter((o) => ["pending", "payment_pending"].includes(o.status)).length,
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
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="font-roboto-slab text-gray-600">Track and manage your fish orders</p>
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
            className={`flex flex-col gap-2 rounded-xl border p-4 transition-all duration-200 ${
              filterStatus === status
                ? "border-green-600 bg-green-50 shadow-md"
                : "border-gray-200 bg-(--white) hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            <span className="font-ubuntu text-2xl font-bold text-gray-900">
              {statusCounts[status]}
            </span>
            <span className="font-roboto-slab text-xs text-gray-600 capitalize">{status}</span>
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
              "bg-gray-100 text-gray-800";

            return (
              <motion.div
                key={order.orderId}
                variants={FADE_IN_VARIANT}
                className="rounded-2xl border border-gray-200 bg-(--white) p-6 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-green-50 p-3">
                        <Package size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-ubuntu text-lg font-bold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <p className="font-roboto-slab text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-4 py-2 text-sm font-medium ${statusColor}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="font-roboto-slab mb-1 text-gray-600">Supplier</p>
                      <p className="font-roboto-slab font-medium text-gray-900">
                        {order.clusterFarmerName}
                      </p>
                    </div>
                    <div>
                      <p className="font-roboto-slab mb-1 text-gray-600">Delivery</p>
                      <p className="font-roboto-slab font-medium text-gray-900">
                        {order.deliveryOption ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="font-roboto-slab mb-1 text-gray-600">Payment Status</p>
                      <p
                        className={`font-roboto-slab font-medium ${
                          order.payment_status === "paid" ? "text-green-600" : "text-yellow-600"
                        }`}
                      >
                        {order.payment_status.charAt(0).toUpperCase() +
                          order.payment_status.slice(1)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
                    <button
                      onClick={() => router.push(`/buyers-dashboard/orders/${order.orderId}`)}
                      className="font-roboto-slab flex flex-1 items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                    >
                      <Eye size={18} />
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
          actionLabel={filterStatus === "all" ? "Browse Marketplace" : undefined}
          actionHref={filterStatus === "all" ? "/marketplace" : undefined}
          size="lg"
        />
      )}
    </div>
  );
}
