"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Truck } from "lucide-react";
import { toast } from "sonner";
import { clusterService, type PendingRider } from "~/lib/services/cluster.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

export default function ClusterRidersPage() {
  const [riders, setRiders] = useState<PendingRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await clusterService.getPendingRiders();
        if (mounted) setRiders(res.data.riders);
      } catch (error) {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "Failed to load riders");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleReview = async (riderId: string, status: "approved" | "rejected") => {
    setActionLoading(riderId);
    try {
      await clusterService.reviewRider(riderId, status);
      setRiders((prev) => prev.filter((r) => r.id !== riderId));
      toast.success(status === "approved" ? "Rider approved." : "Rider rejected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to review rider");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingState message="Loading pending riders..." size="lg" />;

  if (errorMessage) {
    return (
      <EmptyState
        icon={Truck}
        title="Unable to load riders"
        description={errorMessage}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
        size="lg"
      />
    );
  }

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">Rider Approvals</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Review riders invited by admin for your region before they can accept deliveries.
        </p>
      </motion.div>

      {riders.length > 0 ? (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2 lg:grid-cols-3"
        >
          {riders.map((rider) => (
            <motion.div
              key={rider.id}
              variants={FADE_IN_VARIANT}
              className="flex flex-col gap-(--gap-base) rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg) shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  <Truck size={22} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-ubuntu font-semibold text-(--heading-colour)">{rider.full_name}</p>
                  <p className="font-roboto-slab text-sm text-(--text-colour)">{rider.location_lga}</p>
                </div>
              </div>

              <div className="font-roboto-slab flex flex-col gap-1 text-sm text-(--text-colour)">
                <p>{rider.phone_number}</p>
                {rider.email && <p>{rider.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-(--gap-base)">
                <button
                  onClick={() => handleReview(rider.id, "rejected")}
                  disabled={actionLoading === rider.id}
                  className="font-roboto-slab flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  onClick={() => handleReview(rider.id, "approved")}
                  disabled={actionLoading === rider.id}
                  className="font-roboto-slab flex h-10 items-center justify-center gap-2 rounded-xl bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={Truck}
          title="No riders pending review"
          description="Riders invited by admin for your region will appear here."
          size="lg"
        />
      )}
    </div>
  );
}
