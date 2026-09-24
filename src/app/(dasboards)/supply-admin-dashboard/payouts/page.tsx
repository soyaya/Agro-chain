"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, FileSignature } from "lucide-react";
import { supplyAdminService, type SupplyAdminPayout, type SupplyAdminContract } from "~/lib/services/supply-admin.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT, formatStatus } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

const STATUS_STYLES: Record<SupplyAdminPayout["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function SupplyAdminPayoutsPage() {
  const [payouts, setPayouts] = useState<SupplyAdminPayout[]>([]);
  const [contract, setContract] = useState<SupplyAdminContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const [payoutsRes, contractRes] = await Promise.all([
          supplyAdminService.getMyPayouts(),
          supplyAdminService.getMyContract().catch(() => null),
        ]);
        if (mounted) {
          setPayouts(payoutsRes.data.payouts);
          setContract(contractRes?.data.contract ?? null);
        }
      } catch (error) {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "Failed to load payouts");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState message="Loading your payouts..." size="lg" />;

  if (errorMessage) {
    return (
      <EmptyState
        icon={Wallet}
        title="Unable to load payouts"
        description={errorMessage}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
        size="lg"
      />
    );
  }

  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = payouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">Payouts</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Your earnings from demands you've personally sourced and fulfilled, paid per your
          standing supply contract.
        </p>
      </motion.div>

      {contract && (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50">
            <FileSignature size={22} className="text-(--theme-green-dark)" />
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-roboto-slab text-sm text-(--text-colour)">Your standing contract</p>
              <p className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                ₦{Number(contract.pricePerKg).toLocaleString()}/kg
              </p>
            </div>
            <div className="text-right">
              <p className="font-roboto-slab text-sm text-(--text-colour)">Paid out</p>
              <p className="font-ubuntu font-semibold text-(--heading-colour)">
                {contract.payoutDelayDays} day{contract.payoutDelayDays === 1 ? "" : "s"} after each sale
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm">
          <p className="text-sm text-(--text-colour)">Total paid out</p>
          <p className="font-ubuntu text-2xl font-bold text-(--heading-colour)">₦{totalPaid.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm">
          <p className="text-sm text-(--text-colour)">Scheduled / pending</p>
          <p className="font-ubuntu text-2xl font-bold text-(--heading-colour)">₦{totalPending.toLocaleString()}</p>
        </div>
      </div>

      {payouts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payouts yet"
          description="Payouts appear here once a buyer confirms receipt of a demand you fulfilled."
          size="lg"
        />
      ) : (
        <motion.div variants={STAGGER_CONTAINER_VARIANT} initial="hidden" animate="visible" className="flex flex-col gap-3">
          {payouts.map((payout) => (
            <motion.div
              key={payout.payoutId}
              variants={FADE_IN_VARIANT}
              className="flex items-center justify-between rounded-2xl border border-(--border-gray) bg-(--white) p-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-(--heading-colour)">
                  {payout.orderId ? `Order #${payout.orderId.slice(0, 8)}` : "Demand payout"}
                </p>
                <p className="text-xs text-(--text-colour)">
                  {new Date(payout.createdAt).toLocaleString()} · Scheduled{" "}
                  {new Date(payout.scheduledFor).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-ubuntu font-bold text-(--heading-colour)">
                  ₦{Number(payout.amount).toLocaleString()}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[payout.status]}`}>
                  {formatStatus(payout.status)}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
