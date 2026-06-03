"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Package, MapPin, Clock, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminService,
  type AdminDemand,
  type AdminDemandStatus,
  type AdminClusterFarmerOption,
} from "~/lib/services/admin.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

// === Status config

const STATUS_CONFIG: Record<AdminDemandStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  assigned: { label: "Assigned", className: "bg-blue-50 text-blue-700 border-blue-200" },
  accepted: { label: "Accepted", className: "bg-green-50 text-green-700 border-green-200" },
  declined: { label: "Declined", className: "bg-red-50 text-red-700 border-red-200" },
  fulfilled: { label: "Fulfilled", className: "bg-gray-50 text-gray-700 border-gray-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-50 text-gray-500 border-gray-200" },
};

// === Assign Modal

interface AssignModalProps {
  isOpen: boolean;
  demand: AdminDemand | null;
  farmers: AdminClusterFarmerOption[];
  onClose: () => void;
  onConfirm: (farmerId: string) => void;
  loading: boolean;
}

function AssignModal({ isOpen, demand, farmers, onClose, onConfirm, loading }: AssignModalProps) {
  const [selectedFarmerId, setSelectedFarmerId] = useState("");

  const handleClose = () => {
    setSelectedFarmerId("");
    onClose();
  };

  // Filter farmers in same state if possible
  const relevantFarmers = demand
    ? farmers.filter((f) => f.locationState.toLowerCase() === demand.locationState.toLowerCase())
    : farmers;
  const displayFarmers = relevantFarmers.length > 0 ? relevantFarmers : farmers;

  return (
    <AnimatePresence>
      {isOpen && demand && (
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
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-(--white) p-(--space-xl) shadow-lg"
          >
            <div className="flex flex-col gap-(--gap-base)">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-(--gap-base)">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <UserCheck size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-ubuntu text-heading-colour text-xl font-bold">
                      Assign Demand
                    </h3>
                    <p className="font-roboto-slab text-text-colour text-sm">
                      {demand.fishType} · {demand.weightKg}kg · {demand.locationState}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Farmer list */}
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                {displayFarmers.length === 0 ? (
                  <p className="font-roboto-slab text-text-colour py-4 text-center text-sm">
                    No cluster farmers available
                  </p>
                ) : (
                  displayFarmers.map((farmer) => (
                    <button
                      key={farmer.id}
                      onClick={() => setSelectedFarmerId(farmer.id)}
                      className={`flex items-center justify-between rounded-2xl border p-(--space-md) text-left transition ${
                        selectedFarmerId === farmer.id
                          ? "border-theme-green-dark bg-green-50"
                          : "border-gray-border hover:bg-pink-bg"
                      }`}
                    >
                      <div>
                        <p className="font-roboto-slab text-heading-colour text-sm font-semibold">
                          {farmer.fullName}
                        </p>
                        {farmer.businessName && (
                          <p className="font-roboto-slab text-text-colour text-xs">
                            {farmer.businessName}
                          </p>
                        )}
                        <p className="font-roboto-slab text-xs text-gray-400">
                          {farmer.locationLga}, {farmer.locationState}
                        </p>
                      </div>
                      {selectedFarmerId === farmer.id && (
                        <div className="bg-theme-green-dark h-4 w-4 rounded-full" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {relevantFarmers.length === 0 && farmers.length > 0 && (
                <p className="font-roboto-slab text-xs text-yellow-600">
                  No cluster farmers in {demand.locationState} - showing all available farmers
                </p>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-(--gap-base)">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="font-roboto-slab border-gray-border text-text-colour hover:bg-pink-bg flex h-12 items-center justify-center rounded-full border text-sm font-medium transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedFarmerId && onConfirm(selectedFarmerId)}
                  disabled={loading || !selectedFarmerId}
                  className="font-roboto-slab bg-theme-green-dark flex h-12 items-center justify-center rounded-full text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// === Page

export default function AdminDemandsPage() {
  const [demands, setDemands] = useState<AdminDemand[]>([]);
  const [farmers, setFarmers] = useState<AdminClusterFarmerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<AdminDemandStatus | "all">("all");
  const [assignModal, setAssignModal] = useState<AdminDemand | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const [demandsRes, farmersRes] = await Promise.all([
          adminService.getDemands(),
          adminService.getClusterFarmers(),
        ]);
        if (mounted) {
          setDemands(demandsRes.data.demands ?? []);
          setFarmers(farmersRes.data.farmers ?? []);
        }
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

  const handleAssignConfirm = async (farmerId: string) => {
    if (!assignModal) return;
    setActionLoading(true);
    try {
      await adminService.assignDemand(assignModal.id, farmerId);
      setDemands((prev) =>
        prev.map((d) =>
          d.id === assignModal.id
            ? {
                ...d,
                status: "assigned" as AdminDemandStatus,
                assignedClusterFarmerName: farmers.find((f) => f.id === farmerId)?.fullName,
              }
            : d,
        ),
      );
      toast.success("Demand assigned to cluster farmer.");
      setAssignModal(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign demand");
    } finally {
      setActionLoading(false);
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
        <h1 className="font-ubuntu text-heading-colour mb-2 text-3xl font-bold">
          Demand Management
        </h1>
        <p className="font-roboto-slab text-text-colour">
          Review buyer demands and assign them to available cluster farmers.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-(--gap-base) sm:grid-cols-6"
      >
        {(["all", "pending", "assigned", "accepted", "declined", "fulfilled"] as const).map(
          (status) => (
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
          ),
        )}
      </motion.div>

      {/* Table */}
      {filtered.length > 0 ? (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="border-gray-border overflow-hidden rounded-2xl border bg-(--white) shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-gray-border bg-pink-bg border-b">
                <tr>
                  {[
                    "Buyer",
                    "Fish Type",
                    "Weight",
                    "Location",
                    "Status",
                    "Assigned To",
                    "Date",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="font-roboto-slab text-text-colour px-4 py-3 text-left text-xs font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border-gray divide-y">
                {filtered.map((demand) => {
                  const config = STATUS_CONFIG[demand.status];
                  return (
                    <motion.tr
                      key={demand.id}
                      variants={FADE_IN_VARIANT}
                      className="hover:bg-pink-bg transition"
                    >
                      <td className="px-4 py-3">
                        <p className="font-roboto-slab text-heading-colour text-sm font-medium">
                          {demand.buyerName}
                        </p>
                        {demand.buyerPhone && (
                          <p className="font-roboto-slab text-xs text-gray-400">
                            {demand.buyerPhone}
                          </p>
                        )}
                      </td>
                      <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm capitalize">
                        {demand.fishType}
                      </td>
                      <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm">
                        {demand.weightKg} kg
                      </td>
                      <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm">
                        {demand.locationLga}, {demand.locationState}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-roboto-slab rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm">
                        {demand.assignedClusterFarmerName ?? "-"}
                      </td>
                      <td className="font-roboto-slab px-4 py-3 text-xs text-gray-400">
                        {new Date(demand.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {demand.status === "pending" && (
                          <button
                            onClick={() => setAssignModal(demand)}
                            className="font-roboto-slab bg-theme-green-dark flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                          >
                            <UserCheck size={13} />
                            Assign
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No demands found"
          description={
            filterStatus === "all" ? "No buyer demands yet." : `No ${filterStatus} demands.`
          }
          size="lg"
        />
      )}

      <AssignModal
        isOpen={!!assignModal}
        demand={assignModal}
        farmers={farmers}
        onClose={() => setAssignModal(null)}
        onConfirm={handleAssignConfirm}
        loading={actionLoading}
      />
    </div>
  );
}
