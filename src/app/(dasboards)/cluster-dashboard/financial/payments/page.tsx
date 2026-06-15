"use client";

// === Coming Soon - existing content preserved below
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { Receipt, CheckCircle, Clock, AlertCircle, DollarSign, TrendingUp } from "lucide-react";
// import { toast } from "sonner";
// import { clusterService, type ClusterPayout } from "~/lib/services/cluster.service";
// import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
// import { LoadingState } from "~/components/ui/LoadingState";
// import { EmptyState } from "~/components/ui/EmptyState";

import { ComingSoon } from "~/components/shared/ComingSoon";

export default function ClusterPaymentHistoryPage() {
  return <ComingSoon />;

  /* === Original content (preserved, not deleted)

  const STATUS_CONFIG = {
    completed:  { label: "Completed",  color: "text-theme-green-dark",  bg: "bg-green-tint",  icon: CheckCircle },
    pending:    { label: "Pending",    color: "text-yellow-700", bg: "bg-yellow-100", icon: Clock },
    processing: { label: "Processing", color: "text-blue-700",   bg: "bg-blue-100",   icon: Clock },
    failed:     { label: "Failed",     color: "text-red-700",    bg: "bg-red-100",    icon: AlertCircle },
  } as const;

  function statusCfg(s: string) {
    return STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  }

  const [payouts, setPayouts] = useState<ClusterPayout[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await clusterService.getPayouts();
        if (mounted) {
          setPayouts(res.data.payouts ?? []);
          setTotalEarnings(res.data.totalClusterEarnings ?? 0);
          setPendingAmount(res.data.pendingPayouts ?? 0);
        }
      } catch {
        toast.error("Failed to load payment history");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const completedCount = payouts.filter((p) => p.status === "completed").length;
  const completionRate = payouts.length > 0 ? Math.round((completedCount / payouts.length) * 100) : 0;

  const stats = [
    { label: "Total Cluster Earnings", value: `₦${totalEarnings.toLocaleString()}`, icon: DollarSign, color: "text-theme-green-dark", bg: "bg-green-tint" },
    { label: "Pending", value: `₦${pendingAmount.toLocaleString()}`, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Total Payouts", value: payouts.length.toString(), icon: Receipt, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (loading) return <LoadingState message="Loading payment history..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-heading-colour">Payment History</h1>
        <p className="font-roboto-slab text-text-colour">Payout records for all fulfilled cluster orders</p>
      </motion.div>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-(--gap-lg) lg:grid-cols-4"
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              variants={SLIDE_UP_VARIANT}
              className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <div className={`mb-(--space-md) inline-flex rounded-xl p-(--space-md) ${s.bg}`}>
                <Icon size={22} className={s.color} />
              </div>
              <p className="font-ubuntu mb-1 text-2xl font-bold text-heading-colour">{s.value}</p>
              <p className="font-roboto-slab text-sm text-text-colour">{s.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-heading-colour">
          All Payouts
        </h2>
        {payouts.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No payouts yet"
            description="Payouts appear here after buyers confirm delivery of fulfilled orders"
            size="md"
          />
        ) : (
          <div className="flex flex-col gap-(--space-md)">
            {payouts.map((p) => {
              const cfg = statusCfg(p.status);
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-input-border p-(--space-lg) transition-all duration-200 hover:border-gray-border hover:shadow-sm"
                >
                  <div className="flex items-center gap-(--space-lg)">
                    <div className={`rounded-xl p-(--space-md) ${cfg.bg}`}>
                      <StatusIcon size={20} className={cfg.color} />
                    </div>
                    <div>
                      <p className="font-ubuntu text-base font-semibold text-heading-colour">
                        Payout {p.orderNumber ? `· ${p.orderNumber}` : `#${p.id.slice(0, 8)}`}
                      </p>
                      <p className="font-roboto-slab text-sm text-muted-text">
                        {new Date(p.createdAt).toLocaleDateString()}
                        {p.paidAt ? ` · Paid ${new Date(p.paidAt).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-ubuntu text-lg font-bold text-heading-colour">
                      ₦{p.amount.toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
  */
}
