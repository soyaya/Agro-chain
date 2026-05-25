"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, FileText, Clock, CheckCircle } from "lucide-react";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { clusterService, type ClusterListingSummary } from "~/lib/services/cluster.service";

export default function ClusterDashboardPage() {
  const [summary, setSummary] = useState<ClusterListingSummary>({
    farmersUnderMe: 0,
    pendingApproval: 0,
    allListings: 0,
    totalSupply: 0,
  });
  const [activities, setActivities] = useState<Array<{ id: string; text: string; at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [listingRes, activityRes] = await Promise.all([
          clusterService.getListings(),
          clusterService.getCurrentActivities(),
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
    { label: "Farmers Under Me", value: summary.farmersUnderMe.toLocaleString(), icon: Users },
    { label: "Pending Approvals", value: summary.pendingApproval.toLocaleString(), icon: Clock },
    { label: "Active Listings", value: summary.allListings.toLocaleString(), icon: CheckCircle },
    { label: "Total Supply (kg)", value: summary.totalSupply.toLocaleString(), icon: FileText },
  ], [summary]);

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">
          Welcome back, Cluster Farmer! 👋
        </h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Manage your farmers and marketplace listings
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
                <Icon className="text-green-700" size={22} />
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
            href="/cluster-dashboard/pending-approvals"
            className="font-roboto-slab flex-1 rounded-xl bg-(--theme-green-dark) px-(--space-lg) py-(--space-lg) text-center font-medium text-white transition-opacity duration-200 hover:opacity-90 focus:ring-2 focus:ring-(--theme-green-dark) focus:ring-offset-2 focus:outline-none"
          >
            Review Pending Listings
          </a>
          <a
            href="/cluster-dashboard/farmers"
            className="font-roboto-slab flex-1 rounded-xl border border-(--border-gray) bg-(--white) px-(--space-lg) py-(--space-lg) text-center font-medium text-(--heading-colour) transition-colors duration-200 hover:bg-(--bg-pink) focus:ring-2 focus:ring-(--border-gray) focus:ring-offset-2 focus:outline-none"
          >
            View My Farmers
          </a>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
          Recent Activity
        </h2>
        <div className="flex flex-col gap-(--space-md)">
          {activities.length === 0 ? (
            <p className="font-roboto-slab text-sm text-(--text-colour)">No recent activity yet.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors hover:bg-(--bg-pink)">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p className="font-roboto-slab text-sm text-(--text-colour)">{activity.text}</p>
                <span className="ml-auto text-xs text-gray-400">{new Date(activity.at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
