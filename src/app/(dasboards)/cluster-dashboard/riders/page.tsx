"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Truck, Activity } from "lucide-react";
import { toast } from "sonner";
import { clusterService, type PendingRider, type ApprovedRider } from "~/lib/services/cluster.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

export default function ClusterRidersPage() {
  const [riders, setRiders] = useState<PendingRider[]>([]);
  const [approvedRiders, setApprovedRiders] = useState<ApprovedRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvedLoading, setApprovedLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadApproved = async () => {
    setApprovedLoading(true);
    try {
      const res = await clusterService.getApprovedRiders();
      setApprovedRiders(res.data.riders);
    } catch {
      // Non-fatal — the approvals section above still works without this.
    } finally {
      setApprovedLoading(false);
    }
  };

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
    void loadApproved();
    return () => {
      mounted = false;
    };
  }, []);

  const handleReview = async (riderId: string, status: "approved" | "rejected") => {
    setActionLoading(riderId);
    try {
      await clusterService.reviewRider(riderId, status);
      setRiders((prev) => prev.filter((r) => r.id !== riderId));
      if (status === "approved") void loadApproved();
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
                  <p className="font-roboto-slab text-sm text-(--text-colour)">
                    {[rider.location_sub_community, rider.location_ward, rider.location_lga]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
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

      {/* Approved riders + their delivery activity */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="font-ubuntu mb-2 text-2xl font-bold text-(--heading-colour)">Approved Riders</h2>
        <p className="font-roboto-slab text-(--text-colour)">
          Riders already approved for your region, and their current delivery activity.
        </p>
      </motion.div>

      {approvedLoading ? (
        <LoadingState message="Loading approved riders..." size="lg" />
      ) : approvedRiders.length > 0 ? (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2 lg:grid-cols-3"
        >
          {approvedRiders.map((rider) => (
            <motion.div
              key={rider.id}
              variants={FADE_IN_VARIANT}
              className="flex flex-col gap-(--gap-base) rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg) shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                  <Truck size={22} className="text-green-600" />
                </div>
                <div>
                  <p className="font-ubuntu font-semibold text-(--heading-colour)">{rider.full_name}</p>
                  <p className="font-roboto-slab text-sm text-(--text-colour)">{rider.phone_number}</p>
                </div>
              </div>

              <div className="font-roboto-slab grid grid-cols-2 gap-(--gap-base) rounded-xl bg-(--gray-bg) p-(--space-md) text-sm">
                <div>
                  <p className="font-ubuntu text-lg font-bold text-(--heading-colour)">{rider.activeDeliveries}</p>
                  <p className="text-(--text-colour)">En route now</p>
                </div>
                <div>
                  <p className="font-ubuntu text-lg font-bold text-(--heading-colour)">{rider.completedDeliveries}</p>
                  <p className="text-(--text-colour)">Completed</p>
                </div>
              </div>

              <div className="font-roboto-slab flex items-center gap-2 text-xs text-(--text-colour)">
                <Activity size={14} />
                {rider.lastActiveAt
                  ? `Last active ${new Date(rider.lastActiveAt).toLocaleString()}`
                  : "No delivery activity yet"}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={Truck}
          title="No approved riders yet"
          description="Riders you approve above will appear here along with their delivery activity."
          size="lg"
        />
      )}
    </div>
  );
}
