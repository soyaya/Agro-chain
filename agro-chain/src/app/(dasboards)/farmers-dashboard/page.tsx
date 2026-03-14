"use client";

import { motion } from "framer-motion";
import { Package, FileText, Clock, CheckCircle } from "lucide-react";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

export default function FarmersDashboardPage() {
  // Mock data - replace with actual data fetching
  const stats = [
    {
      label: "Total Listings",
      value: "12",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Pending Approval",
      value: "3",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Approved",
      value: "8",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Supply (kg)",
      value: "15,000",
      icon: Package,
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
          Welcome back, Farmer! 👋
        </h1>
        <p className="font-roboto-slab text-(--text-colour)">
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
            href="/farmers-dashboard/listings/create"
            className="font-roboto-slab flex-1 rounded-xl bg-(--theme-green-dark) px-(--space-lg) py-(--space-lg) text-center font-medium text-white hover:cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90 focus:ring-2 focus:ring-(--theme-green-dark) focus:ring-offset-2 focus:outline-none"
          >
            Create New Listing
          </a>
          <a
            href="/farmers-dashboard/listings"
            className="font-roboto-slab flex-1 rounded-xl border border-(--border-gray) bg-(--white) px-(--space-lg) py-(--space-lg) text-center font-medium text-(--heading-colour) hover:cursor-pointer ease-in-out transition-all duration-300 hover:bg-(--bg-pink) focus:ring-2 focus:ring-(--border-gray) focus:ring-offset-2 focus:outline-none"
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
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
          Recent Activity
        </h2>
        <div className="flex flex-col gap-(--space-md)">
          <div className="flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors hover:bg-(--bg-pink)">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="font-roboto-slab text-sm text-(--text-colour)">
              Listing &quot;Catfish 5000kg&quot; was approved
            </p>
            <span className="ml-auto text-xs text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors hover:bg-(--bg-pink)">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <p className="font-roboto-slab text-sm text-(--text-colour)">
              Listing &quot;Tilapia 3000kg&quot; is pending approval
            </p>
            <span className="ml-auto text-xs text-gray-400">5 hours ago</span>
          </div>
          <div className="flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors hover:bg-(--bg-pink)">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="font-roboto-slab text-sm text-(--text-colour)">
              Profile updated successfully
            </p>
            <span className="ml-auto text-xs text-gray-400">1 day ago</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
