"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Receipt, TrendingUp, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { farmerService, type FarmerPayout } from "~/lib/services/farmer.service";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";

const quickActions = [
  {
    title: "Payment History",
    description: "View all your payout records and earnings",
    href: "/farmers-dashboard/financial/payments",
    icon: Receipt,
    color: "bg-blue-600",
  },
  {
    title: "Loan Applications",
    description: "Apply for agricultural financing (coming soon)",
    href: "/farmers-dashboard/financial/loans",
    icon: DollarSign,
    color: "bg-green-600",
    disabled: true,
  },
  {
    title: "Credit Purchases",
    description: "Buy supplies on credit (coming soon)",
    href: "/farmers-dashboard/financial/credit",
    icon: TrendingUp,
    color: "bg-purple-600",
    disabled: true,
  },
];

export default function FarmerFinancialPage() {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [payouts, setPayouts] = useState<FarmerPayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await farmerService.getPayouts();
        if (mounted) {
          setTotalEarnings(res.data.totalEarnings ?? 0);
          setPendingPayouts(res.data.pendingPayouts ?? 0);
          setPayouts((res.data.payouts ?? []).slice(0, 5));
        }
      } catch {
        toast.error("Could not load financial data");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const stats = [
    { label: "Total Earnings", value: `₦${totalEarnings.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50", change: "All time" },
    { label: "Pending Payouts", value: `₦${pendingPayouts.toLocaleString()}`, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", change: "Awaiting release" },
    { label: "Total Payouts", value: payouts.length.toString(), icon: Receipt, color: "text-blue-600", bg: "bg-blue-50", change: "Recorded" },
  ];

  if (loading) return <LoadingState message="Loading financial data..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-heading-colour">Financial Services</h1>
        <p className="font-roboto-slab text-text-colour">
          Track earnings, payouts, and access financial tools
        </p>
      </motion.div>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-(--gap-lg) sm:grid-cols-3"
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              variants={SLIDE_UP_VARIANT}
              className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <div className="mb-(--space-lg) flex items-center justify-between">
                <div className={`rounded-xl p-(--space-md) ${s.bg}`}>
                  <Icon size={24} className={s.color} />
                </div>
                <span className="font-roboto-slab text-xs text-gray-400">{s.change}</span>
              </div>
              <p className="font-ubuntu mb-1 text-3xl font-bold text-heading-colour">{s.value}</p>
              <p className="font-roboto-slab text-sm text-text-colour">{s.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-heading-colour">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-(--gap-lg) sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const inner = (
              <div className="flex items-start gap-(--space-lg)">
                <div className={`rounded-xl p-(--space-md) ${action.color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-ubuntu mb-1 text-base font-semibold text-heading-colour group-hover:text-theme-green-dark">
                    {action.title}
                  </h3>
                  <p className="font-roboto-slab mb-(--space-md) text-sm text-text-colour">{action.description}</p>
                  {!action.disabled && (
                    <div className="flex items-center gap-2 text-sm font-medium text-theme-green-dark">
                      <span>Open</span>
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  )}
                </div>
              </div>
            );
            return action.disabled ? (
              <div
                key={action.href}
                className="group cursor-not-allowed rounded-2xl border border-input-border bg-gray-50 p-(--space-xl) opacity-60 shadow-sm"
              >
                {inner}
              </div>
            ) : (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm transition-all duration-300 hover:scale-105 hover:border-gray-300 hover:shadow-lg"
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm"
      >
        <div className="mb-(--space-lg) flex items-center justify-between">
          <h2 className="font-ubuntu text-xl font-semibold text-heading-colour">Recent Payouts</h2>
          <Link
            href="/farmers-dashboard/financial/payments"
            className="font-roboto-slab text-sm text-theme-green-dark hover:underline"
          >
            View all
          </Link>
        </div>

        {payouts.length === 0 ? (
          <p className="font-roboto-slab py-(--space-lg) text-center text-sm text-gray-500">
            No payouts recorded yet. Earnings appear here once orders are confirmed.
          </p>
        ) : (
          <div className="flex flex-col gap-(--space-sm)">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg p-(--space-md) transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-(--space-md)">
                  <div className={`h-2 w-2 rounded-full ${p.status === "completed" ? "bg-green-500" : p.status === "pending" ? "bg-yellow-500" : "bg-gray-400"}`} />
                  <div>
                    <p className="font-roboto-slab text-sm text-text-colour">
                      Payout {p.orderNumber ? `· ${p.orderNumber}` : ""}
                    </p>
                    <p className="font-roboto-slab text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-ubuntu text-sm font-semibold text-heading-colour">
                    ₦{p.amount.toLocaleString()}
                  </p>
                  <p className="font-roboto-slab text-xs capitalize text-gray-400">{p.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
