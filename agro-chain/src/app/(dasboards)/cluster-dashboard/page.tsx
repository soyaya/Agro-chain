"use client";

import { motion } from "framer-motion";
import { Users, FileText, Clock, CheckCircle } from "lucide-react";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

export default function ClusterDashboardPage() {
  // Mock data - replace with actual data fetching
  const stats = [
    {
      label: "Farmers Under Me",
      value: "45",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Pending Approvals",
      value: "8",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Active Listings",
      value: "32",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Supply (kg)",
      value: "125,000",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

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
              className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="mb-(--space-lg) flex items-center gap-(--space-md)">
                <div className={`rounded-xl p-(--space-md) ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
              <p className="font-ubuntu mb-1 text-3xl font-bold text-(--heading-colour)">
                {stat.value}
              </p>
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
          <div className="flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors hover:bg-(--bg-pink)">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="font-roboto-slab text-sm text-(--text-colour)">
              Approved listing from John Doe - Catfish 5000kg
            </p>
            <span className="ml-auto text-xs text-gray-400">1 hour ago</span>
          </div>
          <div className="flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors hover:bg-(--bg-pink)">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <p className="font-roboto-slab text-sm text-(--text-colour)">
              New listing pending approval from Jane Smith
            </p>
            <span className="ml-auto text-xs text-gray-400">3 hours ago</span>
          </div>
          <div className="flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors hover:bg-(--bg-pink)">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="font-roboto-slab text-sm text-(--text-colour)">
              New farmer joined your cluster - Mike Johnson
            </p>
            <span className="ml-auto text-xs text-gray-400">1 day ago</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
