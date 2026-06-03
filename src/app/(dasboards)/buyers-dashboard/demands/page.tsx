"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, Clock, CheckCircle, XCircle, Truck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { buyerService, type BackendDemand, type DemandStatus } from "~/lib/services/buyer.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

// === Status config

const STATUS_CONFIG: Record<
  DemandStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  assigned: {
    label: "Assigned",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: FileText,
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  declined: {
    label: "Declined",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  fulfilled: {
    label: "Fulfilled",
    className: "bg-gray-50 text-gray-700 border-gray-200",
    icon: Truck,
  },
  cancelled: { label: "Cancelled", className: "bg-gray-50 text-gray-500 border-gray-200", icon: X },
};

// === Page

export default function BuyerDemandsPage() {
  const router = useRouter();
  const [demands, setDemands] = useState<BackendDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<DemandStatus | "all">("all");
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await buyerService.getDemands();
        if (mounted) setDemands(response.data.demands ?? []);
      } catch (error) {
        if (mounted)
          setErrorMessage(error instanceof Error ? error.message : "Failed to load demands");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await buyerService.cancelDemand(id);
      setDemands((prev) => prev.filter((d) => d.id !== id));
      toast.success("Demand cancelled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel demand");
    } finally {
      setCancelling(null);
    }
  };

  const filtered =
    filterStatus === "all" ? demands : demands.filter((d) => d.status === filterStatus);

  const counts = {
    all: demands.length,
    pending: demands.filter((d) => d.status === "pending").length,
    assigned: demands.filter((d) => d.status === "assigned").length,
    accepted: demands.filter((d) => d.status === "accepted").length,
    declined: demands.filter((d) => d.status === "declined").length,
    fulfilled: demands.filter((d) => d.status === "fulfilled").length,
    cancelled: demands.filter((d) => d.status === "cancelled").length,
  };

  if (loading) return <LoadingState message="Loading your demands..." size="lg" />;

  if (errorMessage) {
    return (
      <EmptyState
        icon={FileText}
        title="Unable to load demands"
        description={errorMessage}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
        size="lg"
      />
    );
  }

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-ubuntu text-heading-colour mb-2 text-3xl font-bold">My Demands</h1>
          <p className="font-roboto-slab text-text-colour">
            Request custom quantities of fish - any weight, any variant
          </p>
        </div>
        <button
          onClick={() => router.push("/buyers-dashboard/demands/create")}
          className="font-roboto-slab bg-theme-green-dark flex items-center justify-center gap-2 rounded-full px-(--space-xl) py-(--space-md) text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          Create Demand
        </button>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-(--gap-base) sm:grid-cols-4 lg:grid-cols-7"
      >
        {(
          ["all", "pending", "assigned", "accepted", "declined", "fulfilled", "cancelled"] as const
        ).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`flex flex-col gap-1 rounded-2xl border p-(--space-md) transition-all duration-200 ${
              filterStatus === status
                ? "border-theme-green-dark bg-green-50"
                : "border-gray-border hover:bg-pink-bg bg-(--white)"
            }`}
          >
            <span className="font-ubuntu text-heading-colour text-xl font-bold">
              {counts[status]}
            </span>
            <span className="font-roboto-slab text-text-colour text-xs capitalize">{status}</span>
          </button>
        ))}
      </motion.div>

      {/* Demands List */}
      {filtered.length > 0 ? (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-(--gap-lg)"
        >
          {filtered.map((demand) => {
            const config = STATUS_CONFIG[demand.status];
            const StatusIcon = config.icon;
            return (
              <motion.div
                key={demand.id}
                variants={FADE_IN_VARIANT}
                className="border-gray-border rounded-2xl border bg-(--white) p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-roboto-slab flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
                      >
                        <StatusIcon size={13} />
                        {config.label}
                      </span>
                      <span className="font-roboto-slab text-xs text-gray-400">
                        {new Date(demand.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <div>
                        <p className="font-roboto-slab text-xs text-gray-500">Fish Type</p>
                        <p className="font-ubuntu text-heading-colour font-semibold capitalize">
                          {demand.fishType}
                        </p>
                      </div>
                      <div>
                        <p className="font-roboto-slab text-xs text-gray-500">Weight</p>
                        <p className="font-ubuntu text-heading-colour font-semibold">
                          {demand.weightKg} kg
                        </p>
                      </div>
                      <div>
                        <p className="font-roboto-slab text-xs text-gray-500">Variant</p>
                        <p className="font-ubuntu text-heading-colour font-semibold capitalize">
                          {demand.fishVariant.replace("_", " ")}
                        </p>
                      </div>
                      <div>
                        <p className="font-roboto-slab text-xs text-gray-500">Location</p>
                        <p className="font-ubuntu text-heading-colour font-semibold">
                          {demand.locationLga}, {demand.locationState}
                        </p>
                      </div>
                    </div>

                    {demand.notes && (
                      <p className="font-roboto-slab text-text-colour text-sm">
                        <span className="font-medium">Note:</span> {demand.notes}
                      </p>
                    )}
                  </div>

                  {/* Cancel button - only for pending demands */}
                  {demand.status === "pending" && (
                    <button
                      onClick={() => handleCancel(demand.id)}
                      disabled={cancelling === demand.id}
                      className="font-roboto-slab flex shrink-0 items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50 px-(--space-lg) py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <X size={15} />
                      {cancelling === demand.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No demands found"
          description={
            filterStatus === "all"
              ? "Create a demand to request a custom quantity of fish directly from a cluster farmer."
              : `No ${filterStatus} demands at the moment`
          }
          actionLabel={filterStatus === "all" ? "Create Demand" : undefined}
          onAction={
            filterStatus === "all"
              ? () => router.push("/buyers-dashboard/demands/create")
              : undefined
          }
          size="lg"
        />
      )}
    </div>
  );
}
