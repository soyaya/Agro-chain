"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Package, FileText, Clock, CheckCircle } from "lucide-react";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { farmerService, type FarmerListingSummary } from "~/lib/services/farmer.service";

export default function FarmersDashboardPage() {
  const [summary, setSummary] = useState<FarmerListingSummary>({
    totalListings: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    totalSupply: 0,
  });
  const [activities, setActivities] = useState<Array<{ id: string; text: string; at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [listingRes, activityRes] = await Promise.all([
          farmerService.getListings(),
          farmerService.getRecentActivities(),
        ]);

        if (!mounted) return;

        setSummary(listingRes.data.summary);
        setActivities(
          (activityRes.data.activities ?? []).slice(0, 6).map((item) => ({
            id: item.id,
            text: item.description,
            at: item.created_at,
          })),
        );
      } catch {
        if (!mounted) return;
        setActivities([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Total Listings",
        value: summary.totalListings.toLocaleString(),
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        label: "Pending Approval",
        value: summary.pendingApproval.toLocaleString(),
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      },
      {
        label: "Approved",
        value: summary.approved.toLocaleString(),
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        label: "Total Supply (kg)",
        value: summary.totalSupply.toLocaleString(),
        icon: Package,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
    ],
    [summary],
  );

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-ubuntu text-heading-colour mb-2 text-3xl font-bold">
          Welcome back, Farmer! 👋
        </h1>
        <p className="font-roboto-slab text-text-colour">
          Here&apos;s an overview of your farm activities
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
              className="border-input-border rounded-2xl border bg-(--white) p-(--space-xl) shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="mb-(--space-lg) flex items-center gap-(--space-md)">
                <div className={`rounded-xl p-(--space-md) ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
              <p className="font-ubuntu text-heading-colour mb-1 text-3xl font-bold">
                {loading ? "..." : stat.value}
              </p>
              <p className="font-roboto-slab text-text-colour text-sm">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="border-input-border rounded-2xl border bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu text-heading-colour mb-(--space-lg) text-xl font-semibold">
          Quick Actions
        </h2>
        <div className="flex flex-col gap-(--gap-base) sm:flex-row">
          <a
            href="/farmers-dashboard/listings/create"
            className="font-roboto-slab bg-theme-green-dark focus:ring-theme-green-dark flex-1 rounded-xl px-(--space-lg) py-(--space-lg) text-center font-medium text-white transition-all duration-300 ease-in-out hover:cursor-pointer hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            Create New Listing
          </a>
          <a
            href="/farmers-dashboard/listings"
            className="font-roboto-slab border-gray-border text-heading-colour hover:bg-pink-bg focus:ring-border-gray flex-1 rounded-xl border bg-(--white) px-(--space-lg) py-(--space-lg) text-center font-medium transition-all duration-300 ease-in-out hover:cursor-pointer focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            View All Listings
          </a>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="border-input-border rounded-2xl border bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu text-heading-colour mb-(--space-lg) text-xl font-semibold">
          Recent Activity
        </h2>
        <div className="flex flex-col gap-(--space-md)">
          {activities.length === 0 ? (
            <p className="font-roboto-slab text-text-colour text-sm">No recent activity yet.</p>
          ) : (
            activities.map((item) => (
              <div
                key={item.id}
                className="hover:bg-pink-bg flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors"
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p className="font-roboto-slab text-text-colour text-sm">{item.text}</p>
                <span className="ml-auto text-xs text-gray-400">
                  {new Date(item.at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
