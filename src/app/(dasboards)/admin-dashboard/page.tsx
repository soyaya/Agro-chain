"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Package, Users, UserPlus } from "lucide-react";
import { adminService } from "~/lib/services/admin.service";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeListings: 0,
    ordersToday: 0,
    transactionVolume: 0,
    platformRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await adminService.getMetrics();
        if (mounted) {
          setMetrics(response.data.metrics);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: "Total Users", value: metrics.totalUsers.toLocaleString(), icon: Users },
      { label: "New Users Today", value: metrics.newUsersToday.toLocaleString(), icon: UserPlus },
      { label: "Active Listings", value: metrics.activeListings.toLocaleString(), icon: Package },
      { label: "Orders Today", value: metrics.ordersToday.toLocaleString(), icon: ShoppingCart },
    ],
    [metrics],
  );

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div variants={SLIDE_UP_VARIANT} initial="hidden" animate="visible">
        <h1 className="font-ubuntu text-heading-colour text-3xl font-bold">Admin Dashboard</h1>
        <p className="font-roboto-slab text-text-colour">Platform overview and live metrics</p>
      </motion.div>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={SLIDE_UP_VARIANT}
              className="border-gray-border rounded-2xl border bg-(--white) p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <Icon className="text-green-700" size={24} />
              </div>
              <p className="font-ubuntu text-heading-colour mb-1 text-3xl font-bold">
                {loading ? "..." : stat.value}
              </p>
              <p className="font-roboto-slab text-text-colour text-sm">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          variants={SLIDE_UP_VARIANT}
          initial="hidden"
          animate="visible"
          className="border-gray-border rounded-2xl border bg-(--white) p-6 shadow-sm"
        >
          <h2 className="font-ubuntu text-heading-colour mb-4 text-xl font-semibold">
            Revenue Snapshot
          </h2>
          <p className="text-text-colour text-sm">
            Transaction volume: ₦{metrics.transactionVolume.toLocaleString()}
          </p>
          <p className="text-text-colour text-sm">
            Platform revenue: ₦{metrics.platformRevenue.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          variants={SLIDE_UP_VARIANT}
          initial="hidden"
          animate="visible"
          className="border-gray-border rounded-2xl border bg-(--white) p-6 shadow-sm"
        >
          <h2 className="font-ubuntu text-heading-colour mb-4 text-xl font-semibold">Next Steps</h2>
          <div className="text-text-colour space-y-2 text-sm">
            <p>Review new cluster farmer applications.</p>
            <p>Monitor order volume and platform activity.</p>
            <p>Track active listings across all roles.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
