"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { adminService, type AdminOrder } from "~/lib/services/admin.service";
import { FADE_IN_VARIANT, STATUS_COLORS } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

// === Page

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "direct" | "demand">(
    "all",
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await adminService.getOrders();
        if (mounted) setOrders(response.data.orders ?? []);
      } catch (error) {
        if (mounted)
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load orders",
          );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = orders.filter((o) => {
    const statusMatch = filterStatus === "all" || o.status === filterStatus;
    const typeMatch = filterType === "all" || o.orderType === filterType;
    return statusMatch && typeMatch;
  });

  const statusCounts: Record<string, number> = {
    all: orders.length,
    draft: orders.filter((o) => o.status === "draft").length,
    payment_pending: orders.filter((o) => o.status === "payment_pending")
      .length,
    paid: orders.filter((o) => o.status === "paid").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading) return <LoadingState message="Loading orders..." size="lg" />;

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-ubuntu text-heading-colour mb-2 text-3xl font-bold">
          Order Management
        </h1>
        <p className="font-roboto-slab text-text-colour">
          View and monitor all marketplace and demand-based orders.
        </p>
      </motion.div>

      {/* Type Filter */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="flex gap-2"
      >
        {(["all", "direct", "demand"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`font-roboto-slab rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition ${
              filterType === type
                ? "border-theme-green-dark text-theme-green-dark bg-green-tint"
                : "border-gray-border text-text-colour hover:bg-pink-bg bg-(--white)"
            }`}
          >
            {type === "all"
              ? "All Types"
              : type === "direct"
                ? "Marketplace"
                : "Demand-Based"}
          </button>
        ))}
      </motion.div>

      {/* Status Tabs */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-(--gap-base) sm:grid-cols-5 lg:grid-cols-10"
      >
        {(
          [
            "all",
            "draft",
            "payment_pending",
            "paid",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "completed",
            "cancelled",
          ] as const
        ).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`flex flex-col gap-1 rounded-2xl border p-(--space-sm) transition-all duration-200 ${
              filterStatus === status
                ? "border-theme-green-dark bg-green-tint"
                : "border-gray-border hover:bg-pink-bg bg-(--white)"
            }`}
          >
            <span className="font-ubuntu text-heading-colour text-lg font-bold">
              {statusCounts[status] ?? 0}
            </span>
            <span className="font-roboto-slab text-text-colour text-xs leading-tight capitalize">
              {status.replace("_", " ")}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Orders Table */}
      {filtered.length > 0 ? (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="border-gray-border overflow-hidden rounded-2xl border bg-(--white) shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-gray-border bg-pink-bg border-b">
                <tr>
                  {[
                    "Order #",
                    "Buyer",
                    "Cluster Farmer",
                    "Amount",
                    "Status",
                    "Payment",
                    "Type",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="font-roboto-slab text-text-colour px-4 py-3 text-left text-xs font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border-gray divide-y">
                {filtered.map((order) => {
                  const statusColor =
                    STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] ??
                    "bg-gray-bg text-text-colour-2";
                  return (
                    <motion.tr
                      key={order.id}
                      variants={FADE_IN_VARIANT}
                      className="hover:bg-pink-bg transition"
                    >
                      <td className="font-roboto-slab text-heading-colour px-4 py-3 text-sm font-medium">
                        {order.orderNumber}
                      </td>
                      <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm">
                        {order.buyerName}
                      </td>
                      <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm">
                        {order.clusterFarmerName}
                      </td>
                      <td className="font-roboto-slab text-heading-colour px-4 py-3 text-sm font-medium">
                        ₦{Number(order.grandTotal).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-roboto-slab rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor}`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-roboto-slab text-xs font-medium capitalize ${
                            order.paymentStatus === "paid"
                              ? "text-theme-green-dark"
                              : "text-yellow-600"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-roboto-slab rounded-full border px-2 py-0.5 text-xs capitalize ${
                            order.orderType === "demand"
                              ? "border-purple-200 bg-purple-50 text-purple-700"
                              : "border-blue-200 bg-blue-50 text-blue-700"
                          }`}
                        >
                          {order.orderType === "demand"
                            ? "Demand"
                            : "Marketplace"}
                        </span>
                      </td>
                      <td className="font-roboto-slab text-muted-text px-4 py-3 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={
            filterStatus === "all"
              ? "No orders yet."
              : `No ${filterStatus.replace("_", " ")} orders.`
          }
          size="lg"
        />
      )}
    </div>
  );
}
