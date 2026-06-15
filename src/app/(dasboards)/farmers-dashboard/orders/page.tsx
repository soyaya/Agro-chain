"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import {
  farmerService,
  type BackendFarmerOrder,
} from "~/lib/services/farmer.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Package }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700",
    bg: "bg-blue-100",
    icon: CheckCircle,
  },
  processing: {
    label: "Processing",
    color: "text-purple-700",
    bg: "bg-purple-100",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "text-indigo-700",
    bg: "bg-indigo-100",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-theme-green-dark",
    bg: "bg-green-tint",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: XCircle,
  },
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
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending",
      value: orders.filter((o) =>
        ["pending", "confirmed", "processing"].includes(o.status),
      ).length,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Shipped / Delivered",
      value: orders.filter((o) => ["shipped", "delivered"].includes(o.status))
        .length,
      icon: Truck,
      color: "text-theme-green-dark",
      bg: "bg-green-tint",
    },
    {
      label: "Cancelled",
      value: orders.filter((o) => o.status === "cancelled").length,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  if (loading) return <LoadingState message="Loading orders..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-ubuntu text-heading-colour mb-2 text-3xl font-bold">
          My Orders
        </h1>
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
              className="border-input-border rounded-2xl border bg-(--white) p-(--space-xl) shadow-sm"
            >
              <div
                className={`mb-(--space-md) inline-flex rounded-xl p-(--space-md) ${s.bg}`}
              >
                <Icon size={22} className={s.color} />
              </div>
              <p className="font-ubuntu text-heading-colour text-2xl font-bold">
                {s.value}
              </p>
              <p className="font-roboto-slab text-text-colour text-sm">
                {s.label}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="border-input-border rounded-2xl border bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu text-heading-colour mb-(--space-lg) text-xl font-semibold">
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
                  className="border-input-border hover:border-gray-border rounded-xl border p-(--space-lg) transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="font-ubuntu text-heading-colour text-base font-semibold">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}
                        >
                          <StatusIcon size={12} />
                          {cfg.label}
                        </span>
                        {order.processed !== undefined && (
                          <span className="bg-gray-bg text-text-colour rounded-full px-2 py-1 text-xs">
                            {order.processed ? "Processed" : "Unprocessed"}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
                        <div>
                          <p className="font-roboto-slab text-muted-text text-xs">
                            Buyer
                          </p>
                          <p className="font-roboto-slab text-heading-colour text-sm font-medium">
                            {order.buyerName}
                          </p>
                        </div>
                        <div>
                          <p className="font-roboto-slab text-muted-text text-xs">
                            Fish Type
                          </p>
                          <p className="font-roboto-slab text-heading-colour text-sm font-medium">
                            {order.fishType}
                            {order.variant ? ` · ${order.variant}` : ""}
                          </p>
                        </div>
                        <div>
                          <p className="font-roboto-slab text-muted-text text-xs">
                            Quantity / Weight
                          </p>
                          <p className="font-roboto-slab text-heading-colour text-sm font-medium">
                            {order.quantity} × {order.weightKg}kg
                          </p>
                        </div>
                        <div>
                          <p className="font-roboto-slab text-muted-text text-xs">
                            Delivery
                          </p>
                          <p className="font-roboto-slab text-heading-colour text-sm font-medium capitalize">
                            {order.deliveryOption}
                          </p>
                        </div>
                      </div>
                      {order.totalAmount != null && (
                        <p className="font-ubuntu text-theme-green-dark mt-2 text-sm font-semibold">
                          ₦{order.totalAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <p className="font-roboto-slab text-muted-text shrink-0 text-xs">
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
