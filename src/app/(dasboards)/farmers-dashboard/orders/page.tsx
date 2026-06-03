"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle, Truck, XCircle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { farmerService, type BackendFarmerOrder } from "~/lib/services/farmer.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Package }> = {
  pending:    { label: "Pending",    color: "text-yellow-700", bg: "bg-yellow-100", icon: Clock },
  confirmed:  { label: "Confirmed",  color: "text-blue-700",   bg: "bg-blue-100",   icon: CheckCircle },
  processing: { label: "Processing", color: "text-purple-700", bg: "bg-purple-100", icon: Package },
  shipped:    { label: "Shipped",    color: "text-indigo-700", bg: "bg-indigo-100", icon: Truck },
  delivered:  { label: "Delivered",  color: "text-green-700",  bg: "bg-green-100",  icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "text-red-700",    bg: "bg-red-100",    icon: XCircle },
};

function statusCfg(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
}

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<BackendFarmerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await farmerService.getOrders();
        if (mounted) setOrders(res.data.orders ?? []);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    {
      label: "Pending",
      value: orders.filter((o) => ["pending", "confirmed", "processing"].includes(o.status)).length,
      icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50",
    },
    {
      label: "Shipped / Delivered",
      value: orders.filter((o) => ["shipped", "delivered"].includes(o.status)).length,
      icon: Truck, color: "text-green-600", bg: "bg-green-50",
    },
    {
      label: "Cancelled",
      value: orders.filter((o) => o.status === "cancelled").length,
      icon: XCircle, color: "text-red-600", bg: "bg-red-50",
    },
  ];

  if (loading) return <LoadingState message="Loading orders..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-heading-colour">My Orders</h1>
        <p className="font-roboto-slab text-text-colour">
          Orders placed by buyers against your supply listings
        </p>
      </motion.div>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-(--gap-lg) lg:grid-cols-4"
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              variants={FADE_IN_VARIANT}
              className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm"
            >
              <div className={`mb-(--space-md) inline-flex rounded-xl p-(--space-md) ${s.bg}`}>
                <Icon size={22} className={s.color} />
              </div>
              <p className="font-ubuntu text-2xl font-bold text-heading-colour">{s.value}</p>
              <p className="font-roboto-slab text-sm text-text-colour">{s.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-heading-colour">
          All Orders
        </h2>

        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="Orders will appear here once buyers purchase your listings"
            size="md"
          />
        ) : (
          <div className="flex flex-col gap-(--space-md)">
            {orders.map((order) => {
              const cfg = statusCfg(order.status);
              const StatusIcon = cfg.icon;
              return (
                <motion.div
                  key={order.orderId}
                  variants={FADE_IN_VARIANT}
                  className="rounded-xl border border-input-border p-(--space-lg) transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="font-ubuntu text-base font-semibold text-heading-colour">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}
                        >
                          <StatusIcon size={12} />
                          {cfg.label}
                        </span>
                        {order.processed !== undefined && (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                            {order.processed ? "Processed" : "Unprocessed"}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
                        <div>
                          <p className="font-roboto-slab text-xs text-gray-500">Buyer</p>
                          <p className="font-roboto-slab text-sm font-medium text-heading-colour">
                            {order.buyerName}
                          </p>
                        </div>
                        <div>
                          <p className="font-roboto-slab text-xs text-gray-500">Fish Type</p>
                          <p className="font-roboto-slab text-sm font-medium text-heading-colour">
                            {order.fishType}
                            {order.variant ? ` · ${order.variant}` : ""}
                          </p>
                        </div>
                        <div>
                          <p className="font-roboto-slab text-xs text-gray-500">Quantity / Weight</p>
                          <p className="font-roboto-slab text-sm font-medium text-heading-colour">
                            {order.quantity} × {order.weightKg}kg
                          </p>
                        </div>
                        <div>
                          <p className="font-roboto-slab text-xs text-gray-500">Delivery</p>
                          <p className="font-roboto-slab text-sm font-medium text-heading-colour capitalize">
                            {order.deliveryOption}
                          </p>
                        </div>
                      </div>
                      {order.totalAmount != null && (
                        <p className="font-ubuntu mt-2 text-sm font-semibold text-theme-green-dark">
                          ₦{order.totalAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <p className="font-roboto-slab shrink-0 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
