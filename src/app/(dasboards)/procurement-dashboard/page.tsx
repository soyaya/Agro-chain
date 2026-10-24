"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, CheckCircle, Clock } from "lucide-react";
import { procurementService, type ProcurementOrderRow } from "~/lib/services/procurement.service";
import { useAuth } from "~/lib/auth-context";
import { LoadingState } from "~/components/ui/LoadingState";

export default function ProcurementDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || "Officer";
  const [orders, setOrders] = useState<ProcurementOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    procurementService
      .getOrders(1, 100)
      .then((res) => {
        if (mounted) setOrders(res.data.orders);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const eligibleCount = orders.filter((o) => o.eligible).length;
  const claimedByMe = orders.filter((o) => o.procurementOfficerId === user?.id).length;

  if (loading) return <LoadingState message="Loading your dashboard..." size="lg" />;

  const stats = [
    { label: "Orders needing a procurement officer", value: eligibleCount, icon: Clock, color: "text-yellow-700" },
    { label: "Claimed by you", value: claimedByMe, icon: CheckCircle, color: "text-green-700" },
    { label: "Total orders platform-wide", value: orders.length, icon: Package, color: "text-blue-700" },
  ];

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Welcome back, {firstName}</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Fill orders with no cluster farmer available, and run farm consultancy visits.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-4 md:grid-cols-3"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm">
              <Icon className={`mb-4 ${stat.color}`} size={24} />
              <p className="font-ubuntu mb-1 text-3xl font-bold text-(--heading-colour)">{stat.value}</p>
              <p className="font-roboto-slab text-sm text-(--text-colour)">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      <div className="flex gap-(--gap-base)">
        <a
          href="/procurement-dashboard/orders"
          className="font-roboto-slab rounded-xl bg-(--theme-green-dark) px-(--space-lg) py-(--space-md) text-sm font-semibold text-white transition hover:opacity-90"
        >
          View Orders
        </a>
        <a
          href="/procurement-dashboard/farmer-records"
          className="font-roboto-slab rounded-xl border border-(--border-gray) bg-(--white) px-(--space-lg) py-(--space-md) text-sm font-semibold text-(--heading-colour) transition hover:bg-(--gray-bg)"
        >
          Farmer Records
        </a>
      </div>
    </div>
  );
}
