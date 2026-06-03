"use client";

// === Coming Soon - existing content preserved below
// import { motion } from "framer-motion";
// import { DollarSign, ShoppingCart, Receipt, TrendingUp, ArrowRight, AlertCircle } from "lucide-react";
// import Link from "next/link";
// import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

import { ComingSoon } from "~/components/shared/ComingSoon";

export default function FinancialServicesPage() {
  return <ComingSoon />;

  /* === Original content (preserved, not deleted)
  // Mock data - replace with actual data fetching
  const financialStats = [
    {
      label: "Available Credit",
      value: "₦250,000",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+12%",
    },
    {
      label: "Active Loans",
      value: "2",
      icon: Receipt,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "1 pending",
    },
    {
      label: "Credit Purchases",
      value: "₦180,000",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "This month",
    },
    {
      label: "Credit Score",
      value: "720",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "Good",
    },
  ];

  const quickActions = [
    {
      title: "Apply for Loan",
      description: "Get financing for equipment, seeds, or farm expansion",
      href: "/cluster-dashboard/financial/loans",
      icon: DollarSign,
      color: "bg-green-600",
    },
    {
      title: "Buy on Credit",
      description: "Purchase agricultural supplies with flexible payment terms",
      href: "/cluster-dashboard/financial/credit",
      icon: ShoppingCart,
      color: "bg-purple-600",
    },
    {
      title: "View Payments",
      description: "Track your payment history and upcoming dues",
      href: "/cluster-dashboard/financial/payments",
      icon: Receipt,
      color: "bg-blue-600",
    },
    {
      title: "Financial Profile",
      description: "View your credit score and financial standing",
      href: "/cluster-dashboard/financial/profile",
      icon: TrendingUp,
      color: "bg-orange-600",
    },
  ];

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-heading-colour">
          Financial Services 💰
        </h1>
        <p className="font-roboto-slab text-text-colour">
          Access loans, credit purchases, and manage your farm finances
        </p>
      </motion.div>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-(--gap-lg) sm:grid-cols-2 lg:grid-cols-4"
      >
        {financialStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={SLIDE_UP_VARIANT}
              className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm cursor-default ease-in-out transition-all duration-300 hover:shadow-md hover:scale-105"
            >
              <div className="mb-(--space-lg) flex items-center justify-between">
                <div className={`rounded-xl p-(--space-md) ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <span className="font-roboto-slab text-xs text-green-600">{stat.change}</span>
              </div>
              <p className="font-ubuntu mb-1 text-3xl font-bold text-heading-colour">
                {stat.value}
              </p>
              <p className="font-roboto-slab text-sm text-text-colour">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-blue-200 bg-blue-50 p-(--space-xl) shadow-sm"
      >
        <div className="flex items-start gap-(--space-md)">
          <AlertCircle size={24} className="text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-ubuntu mb-2 text-lg font-semibold text-blue-900">
              Financial Services Available
            </h3>
            <p className="font-roboto-slab text-sm text-blue-800">
              You have access to agricultural loans and credit purchases. Maintain a good payment history to increase your credit limit and access better terms.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-heading-colour">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-(--gap-lg) sm:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm cursor-pointer ease-in-out transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:scale-105"
              >
                <div className="flex items-start gap-(--space-lg)">
                  <div className={`rounded-xl p-(--space-md) ${action.color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-ubuntu mb-2 text-lg font-semibold text-heading-colour group-hover:text-theme-green-dark">
                      {action.title}
                    </h3>
                    <p className="font-roboto-slab text-sm text-text-colour mb-(--space-md)">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-theme-green-dark">
                      <span>Get Started</span>
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-heading-colour">
          Recent Financial Activity
        </h2>
        <div className="flex flex-col gap-(--space-md)">
          <div className="flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors hover:bg-pink-bg">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="font-roboto-slab text-sm text-text-colour">
              Loan payment of ₦25,000 processed successfully
            </p>
            <span className="ml-auto text-xs text-gray-400">2 days ago</span>
          </div>
          <div className="flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors hover:bg-pink-bg">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="font-roboto-slab text-sm text-text-colour">
              Credit purchase approved - ₦45,000 for fertilizers
            </p>
            <span className="ml-auto text-xs text-gray-400">5 days ago</span>
          </div>
          <div className="flex items-center gap-(--space-md) rounded-lg p-(--space-md) transition-colors hover:bg-pink-bg">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <p className="font-roboto-slab text-sm text-text-colour">
              Loan application under review - ₦150,000
            </p>
            <span className="ml-auto text-xs text-gray-400">1 week ago</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
  */
}
