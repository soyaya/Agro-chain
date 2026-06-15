"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  DollarSign,
  UserPlus,
} from "lucide-react";
import {
  adminService,
  type AdminMetricResponse,
  type AdminChartsResponse,
} from "~/lib/services/admin.service";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

type Metrics = AdminMetricResponse["data"]["metrics"];
type Charts = AdminChartsResponse["data"]["charts"];

const STATS = (m: Metrics) => [
  { label: "Total Users", value: m.totalUsers.toLocaleString(), icon: Users },
  {
    label: "New Users Today",
    value: m.newUsersToday.toLocaleString(),
    icon: UserPlus,
  },
  {
    label: "Active Listings",
    value: m.activeListings.toLocaleString(),
    icon: Package,
  },
  {
    label: "Orders Today",
    value: m.ordersToday.toLocaleString(),
    icon: ShoppingCart,
  },
  {
    label: "Transaction Volume",
    value: `₦${Number(m.transactionVolume).toLocaleString()}`,
    icon: DollarSign,
  },
  {
    label: "Platform Revenue",
    value: `₦${Number(m.platformRevenue).toLocaleString()}`,
    icon: TrendingUp,
  },
];

function BarChart({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <motion.div
      variants={SLIDE_UP_VARIANT}
      className="border-gray-border rounded-2xl border bg-(--white) p-6 shadow-sm"
    >
      <h2 className="font-ubuntu text-heading-colour mb-5 text-xl font-semibold">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="font-roboto-slab text-text-colour text-sm">
          No data yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((row, i) => (
            <div key={row.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-roboto-slab text-heading-colour text-sm capitalize">
                  {row.label.replace(/_/g, " ")}
                </span>
                <span className="font-roboto-slab text-text-colour text-sm">
                  {row.count}
                </span>
              </div>
              <div className="bg-gray-bg h-2 w-full overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((row.count / max) * 100)}%` }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: i * 0.06,
                  }}
                  className="bg-theme-green-dark h-full rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [charts, setCharts] = useState<Charts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [metricsRes, chartsRes] = await Promise.all([
          adminService.getMetrics(),
          adminService.getCharts(),
        ]);
        if (!mounted) return;
        setMetrics(metricsRes.data.metrics);
        setCharts(chartsRes.data.charts);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load analytics",
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

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div
        variants={SLIDE_UP_VARIANT}
        initial="hidden"
        animate="visible"
      >
        <h1 className="font-ubuntu text-heading-colour text-3xl font-bold">
          Analytics
        </h1>
        <p className="font-roboto-slab text-text-colour">
          Platform-wide metrics and trends.
        </p>
      </motion.div>

      {loading ? (
        <div className="border-gray-border text-text-colour rounded-2xl border bg-(--white) p-6">
          Loading analytics...
        </div>
      ) : metrics ? (
        <>
          <motion.div
            variants={STAGGER_CONTAINER_VARIANT}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {STATS(metrics).map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={SLIDE_UP_VARIANT}
                  className="border-gray-border rounded-2xl border bg-(--white) p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Icon className="text-theme-green-dark" size={22} />
                  </div>
                  <p className="font-ubuntu text-heading-colour mb-1 text-3xl font-bold">
                    {stat.value}
                  </p>
                  <p className="font-roboto-slab text-text-colour text-sm">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            variants={STAGGER_CONTAINER_VARIANT}
            initial="hidden"
            animate="visible"
            className="grid gap-6 lg:grid-cols-2"
          >
            <BarChart
              title="Orders by Status"
              rows={(charts?.ordersByStatus ?? []).map((o) => ({
                label: o.status,
                count: o._count.id,
              }))}
            />
            <BarChart
              title="Popular Fish Types"
              rows={(charts?.popularFishTypes ?? []).map((f) => ({
                label: f.fish_type,
                count: f._count.id,
              }))}
            />
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
