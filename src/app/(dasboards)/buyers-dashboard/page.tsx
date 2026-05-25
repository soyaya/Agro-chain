"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Package, Clock, CheckCircle } from "lucide-react";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { buyerService, type BackendOrder } from "~/lib/services/buyer.service";

export default function BuyersDashboardPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await buyerService.getOrders();
        if (mounted) setOrders(response.data.orders ?? []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => [
    { label: "Total Orders", value: orders.length.toLocaleString(), icon: ShoppingCart },
    { label: "Pending Orders", value: orders.filter((o) => ["pending", "payment_pending", "confirmed", "processing"].includes(o.status)).length.toLocaleString(), icon: Clock },
    { label: "Completed", value: orders.filter((o) => ["completed", "delivered"].includes(o.status)).length.toLocaleString(), icon: CheckCircle },
    { label: "Saved Listings", value: "-", icon: Package },
  ], [orders]);

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">
          Welcome back, Buyer!
        </h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Here&apos;s an overview of your orders and activities
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-(--gap-lg) sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={SLIDE_UP_VARIANT}
              className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <Icon size={22} className="text-green-700" />
              </div>
              <p className="font-ubuntu mb-1 text-3xl font-bold text-(--heading-colour)">{loading ? "..." : stat.value}</p>
              <p className="font-roboto-slab text-sm text-(--text-colour)">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
          Quick Actions
        </h2>
        <div className="flex flex-col gap-(--gap-base) sm:flex-row">
          <a
            href="/marketplace"
            className="font-roboto-slab flex-1 rounded-xl bg-(--theme-green-dark) px-(--space-lg) py-(--space-lg) text-center font-medium text-white transition-opacity duration-200 hover:opacity-90 focus:ring-2 focus:ring-(--theme-green-dark) focus:ring-offset-2 focus:outline-none"
          >
            Browse Marketplace
          </a>
          <a
            href="/buyers-dashboard/orders"
            className="font-roboto-slab flex-1 rounded-xl border border-(--border-gray) bg-(--white) px-(--space-lg) py-(--space-lg) text-center font-medium text-(--heading-colour) transition-colors duration-200 hover:bg-(--bg-pink) focus:ring-2 focus:ring-(--border-gray) focus:ring-offset-2 focus:outline-none"
          >
            View My Orders
          </a>
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
          Recent Orders
        </h2>
        <div className="flex flex-col gap-(--space-md)">
          {(orders.slice(0, 4)).map((order) => (
            <div key={order.orderId} className="flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors hover:bg-(--bg-pink)">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <p className="font-roboto-slab text-sm text-(--text-colour)">
                {order.orderNumber} - {order.status}
              </p>
              <span className="ml-auto text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="font-roboto-slab text-sm text-(--text-colour)">No recent orders yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
