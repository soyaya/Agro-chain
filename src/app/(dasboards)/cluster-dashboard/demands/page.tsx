"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  Package,
  MapPin,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  clusterService,
  type BackendDemand,
  type DemandStatus,
  type ApprovedRider,
} from "~/lib/services/cluster.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

// === Status config

const STATUS_CONFIG: Record<DemandStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  assigned: { label: "Assigned", className: "bg-blue-50 text-blue-700 border-blue-200" },
  accepted: { label: "Accepted", className: "bg-green-50 text-green-700 border-green-200" },
  declined: { label: "Declined", className: "bg-red-50 text-red-700 border-red-200" },
  fulfilled: { label: "Fulfilled", className: "bg-gray-50 text-gray-700 border-gray-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-50 text-gray-500 border-gray-200" },
};

const FULFILLMENT_STAGE_LABELS: Record<string, string> = {
  awaiting_farmer_dispatch: "Awaiting acceptance",
  at_cluster_office: "Sourced — at your office",
  ready_for_pickup: "Ready for buyer pickup",
  escalated_to_rider: "Escalated to rider",
  out_for_delivery: "Out for delivery",
  delivered_awaiting_confirmation: "Delivered — awaiting buyer confirmation",
  completed: "Completed",
};

// === Decline Modal

interface DeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

function DeclineModal({ isOpen, onClose, onConfirm, loading }: DeclineModalProps) {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-(--white) p-(--space-xl) shadow-lg"
          >
            <div className="flex flex-col gap-(--gap-base)">
              <div className="flex items-center gap-(--gap-base)">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <XCircle size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                    Decline Demand
                  </h3>
                  <p className="font-roboto-slab text-sm text-(--text-colour)">
                    Reason is optional but helpful for the buyer
                  </p>
                </div>
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for declining (optional)..."
                className="font-roboto-slab h-28 w-full rounded-2xl border border-(--border-input) p-(--space-md) text-sm text-(--text-colour) transition outline-none focus:border-(--border-gray)"
              />
              <div className="grid grid-cols-2 gap-(--gap-base)">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="font-roboto-slab flex h-12 items-center justify-center rounded-full border border-(--border-gray) text-sm font-medium text-(--text-colour) transition hover:bg-(--bg-pink) disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(reason)}
                  disabled={loading}
                  className="font-roboto-slab flex h-12 items-center justify-center rounded-full bg-red-600 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Declining..." : "Decline"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// === Escalate Modal

interface EscalateModalProps {
  isOpen: boolean;
  riders: ApprovedRider[];
  onClose: () => void;
  onConfirm: (riderId: string) => void;
  loading: boolean;
}

function EscalateModal({ isOpen, riders, onClose, onConfirm, loading }: EscalateModalProps) {
  const [selectedRiderId, setSelectedRiderId] = useState("");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-(--white) p-(--space-xl) shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">Escalate to Rider</h3>
              <button onClick={onClose} className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 flex max-h-64 flex-col gap-2 overflow-y-auto">
              {riders.length === 0 ? (
                <p className="font-roboto-slab py-4 text-center text-sm text-(--text-colour)">
                  No approved riders in your region yet.
                </p>
              ) : (
                riders.map((rider) => (
                  <button
                    key={rider.id}
                    onClick={() => setSelectedRiderId(rider.id)}
                    className={`flex items-center justify-between rounded-2xl border p-(--space-md) text-left transition ${
                      selectedRiderId === rider.id
                        ? "border-(--theme-green-dark) bg-green-50"
                        : "border-(--border-gray) hover:bg-(--bg-pink)"
                    }`}
                  >
                    <div>
                      <p className="font-roboto-slab text-sm font-semibold text-(--heading-colour)">
                        {rider.full_name}
                      </p>
                      <p className="font-roboto-slab text-xs text-gray-400">{rider.phone_number}</p>
                    </div>
                    {selectedRiderId === rider.id && <div className="h-4 w-4 rounded-full bg-(--theme-green-dark)" />}
                  </button>
                ))
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-(--gap-base)">
              <button
                onClick={onClose}
                className="font-roboto-slab flex h-12 items-center justify-center rounded-full border border-(--border-gray) text-sm font-medium text-(--text-colour) transition hover:bg-(--bg-pink)"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedRiderId && onConfirm(selectedRiderId)}
                disabled={loading || !selectedRiderId}
                className="font-roboto-slab flex h-12 items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Escalating..." : "Escalate"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// === Page

export default function ClusterDemandsPage() {
  const [demands, setDemands] = useState<BackendDemand[]>([]);
  const [riders, setRiders] = useState<ApprovedRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [escalateDemandId, setEscalateDemandId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<DemandStatus | "all">("all");

  const load = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [demandsRes, ridersRes] = await Promise.all([
        clusterService.getDemands(),
        clusterService.getApprovedRiders(),
      ]);
      setDemands(demandsRes.data.demands ?? []);
      setRiders(ridersRes.data.riders ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load demands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      await clusterService.acceptDemand(id);
      toast.success("Demand accepted — source it and mark it ready or escalate to a rider.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept demand");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineClick = (id: string) => {
    setSelectedId(id);
    setDeclineModalOpen(true);
  };

  const handleDeclineConfirm = async (reason: string) => {
    if (!selectedId) return;
    setActionLoading(selectedId);
    try {
      await clusterService.declineDemand(selectedId, reason || undefined);
      toast.success("Demand declined.");
      setDeclineModalOpen(false);
      setSelectedId(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to decline demand");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReadyForPickup = async (id: string) => {
    setActionLoading(id);
    try {
      await clusterService.markDemandReadyForPickup(id);
      toast.success("Marked ready for pickup.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update demand");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEscalate = async (riderId: string) => {
    if (!escalateDemandId) return;
    setActionLoading(escalateDemandId);
    try {
      await clusterService.escalateDemandToRider(escalateDemandId, riderId);
      toast.success("Escalated to rider for delivery.");
      setEscalateDemandId(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to escalate to rider");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered =
    filterStatus === "all" ? demands : demands.filter((d) => d.status === filterStatus);
  const assignedCount = demands.filter((d) => d.status === "assigned").length;

  const counts = {
    all: demands.length,
    assigned: demands.filter((d) => d.status === "assigned").length,
    accepted: demands.filter((d) => d.status === "accepted").length,
    declined: demands.filter((d) => d.status === "declined").length,
    fulfilled: demands.filter((d) => d.status === "fulfilled").length,
  };

  if (loading) return <LoadingState message="Loading demands..." size="lg" />;

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
      >
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">Demands</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Custom buyer requests assigned to you by admin. Accept to source it yourself, then hand
          it off for pickup or delivery — the buyer confirms when it arrives.
        </p>
      </motion.div>

      {/* Alert for new assigned demands */}
      {assignedCount > 0 && (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-(--gap-base) rounded-2xl bg-blue-50 p-(--space-lg)"
        >
          <AlertCircle size={22} className="shrink-0 text-blue-600" />
          <p className="font-roboto-slab text-sm text-blue-800">
            <span className="font-semibold">{assignedCount}</span> new demand
            {assignedCount !== 1 ? "s" : ""} assigned to you — review and accept or decline
          </p>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-(--gap-base) sm:grid-cols-5"
      >
        {(["all", "assigned", "accepted", "declined", "fulfilled"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`flex flex-col gap-1 rounded-2xl border p-(--space-md) transition-all duration-200 ${
              filterStatus === status
                ? "border-(--theme-green-dark) bg-green-50"
                : "border-(--border-gray) bg-(--white) hover:bg-(--bg-pink)"
            }`}
          >
            <span className="font-ubuntu text-xl font-bold text-(--heading-colour)">
              {counts[status]}
            </span>
            <span className="font-roboto-slab text-xs text-(--text-colour) capitalize">
              {status}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Demands */}
      {filtered.length > 0 ? (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2"
        >
          {filtered.map((demand) => {
            const config = STATUS_CONFIG[demand.status];
            return (
              <motion.div
                key={demand.id}
                variants={FADE_IN_VARIANT}
                className="flex flex-col gap-4 rounded-3xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
              >
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour) capitalize">
                      {demand.fishVariant.replace("_", " ")}
                    </h3>
                    <p className="font-roboto-slab text-sm text-(--text-colour)">
                      from {demand.buyerName}
                    </p>
                  </div>
                  <span
                    className={`font-roboto-slab rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
                  >
                    {config.label}
                  </span>
                </div>

                <div className="h-px w-full bg-gray-100" />

                {/* Details */}
                <div className="flex flex-col gap-2.5">
                  <div className="font-roboto-slab flex items-center gap-2 text-sm text-(--text-colour)">
                    <Package size={15} className="shrink-0 text-gray-400" />
                    <span>
                      {demand.quantityPieces ? `${demand.quantityPieces} pcs` : `${demand.weightKg} kg`} · ₦
                      {demand.grandTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="font-roboto-slab flex items-center gap-2 text-sm text-(--text-colour)">
                    <MapPin size={15} className="shrink-0 text-gray-400" />
                    <span>
                      {demand.locationLga}, {demand.locationState}
                    </span>
                  </div>
                  <div className="font-roboto-slab flex items-center gap-2 text-sm text-(--text-colour)">
                    <Clock size={15} className="shrink-0 text-gray-400" />
                    <span>
                      {new Date(demand.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {demand.notes && (
                    <p className="font-roboto-slab text-sm text-(--text-colour)">
                      <span className="font-medium">Note:</span> {demand.notes}
                    </p>
                  )}
                </div>

                {/* Assign-stage actions */}
                {demand.status === "assigned" && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleAccept(demand.id)}
                      disabled={actionLoading === demand.id}
                      className="font-roboto-slab flex items-center justify-center gap-2 rounded-xl bg-(--theme-green-dark) py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineClick(demand.id)}
                      disabled={actionLoading === demand.id}
                      className="font-roboto-slab flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Decline
                    </button>
                  </div>
                )}

                {/* Physical fulfillment, once accepted */}
                {demand.status === "accepted" && (
                  <div className="rounded-xl border border-(--border-gray) bg-(--gray-bg) p-3">
                    <p className="font-roboto-slab mb-2 text-xs font-medium text-(--text-colour)">
                      {FULFILLMENT_STAGE_LABELS[demand.fulfillmentStage] ?? demand.fulfillmentStage}
                    </p>
                    {demand.fulfillmentStage === "at_cluster_office" && demand.fulfillmentMethod === "pickup" && (
                      <button
                        onClick={() => handleReadyForPickup(demand.id)}
                        disabled={actionLoading === demand.id}
                        className="font-roboto-slab flex w-full items-center justify-center gap-2 rounded-xl bg-(--theme-green-dark) py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        <CheckCircle size={16} />
                        Mark Ready for Pickup
                      </button>
                    )}
                    {demand.fulfillmentStage === "at_cluster_office" && demand.fulfillmentMethod === "delivery" && (
                      <button
                        onClick={() => setEscalateDemandId(demand.id)}
                        disabled={actionLoading === demand.id}
                        className="font-roboto-slab flex w-full items-center justify-center gap-2 rounded-xl bg-(--theme-green-dark) py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        <Truck size={16} />
                        Escalate to Rider
                      </button>
                    )}
                  </div>
                )}
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
              ? "No demands have been assigned to you yet. Admin will assign buyer demands to you based on your location."
              : `No ${filterStatus} demands at the moment`
          }
          size="lg"
        />
      )}

      <DeclineModal
        isOpen={declineModalOpen}
        onClose={() => {
          setDeclineModalOpen(false);
          setSelectedId(null);
        }}
        onConfirm={handleDeclineConfirm}
        loading={!!actionLoading}
      />

      <EscalateModal
        isOpen={!!escalateDemandId}
        riders={riders}
        onClose={() => setEscalateDemandId(null)}
        onConfirm={handleEscalate}
        loading={!!actionLoading}
      />
    </div>
  );
}
