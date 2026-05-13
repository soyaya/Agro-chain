"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Package, MapPin, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { apiFetch } from "~/lib/api";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

// === Types

interface PendingListing {
  id: string;
  fishType: string;
  farmerName: string;
  harvestDate: string;
  listedDate: string;
  totalFishAvailable: number;
  packaging: { weightKg: number; quantity: number };
  createdAt: string;
  updatedAt: string;
}

// === Reject Modal

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

function RejectModal({ isOpen, onClose, onConfirm, loading }: RejectModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    onConfirm(reason);
  };

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
                    Reject Listing
                  </h3>
                  <p className="font-roboto-slab text-sm text-(--text-colour)">
                    Please provide a reason for rejection
                  </p>
                </div>
              </div>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="font-roboto-slab h-32 w-full rounded-2xl border border-(--border-input) p-(--space-md) text-base text-(--text-colour) transition outline-none focus:border-(--border-gray)"
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
                  onClick={handleSubmit}
                  disabled={loading || !reason.trim()}
                  className="font-roboto-slab flex h-12 items-center justify-center rounded-full bg-red-600 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Rejecting..." : "Reject Listing"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// === Main Page

export default function ClusterListingsPage() {
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await apiFetch<{
          status: string;
          data: { listings: PendingListing[] };
        }>("/listings/cluster-pending");
        if (mounted) setListings(response.data.listings ?? []);
      } catch (error) {
        if (mounted)
          setErrorMessage(error instanceof Error ? error.message : "Failed to load listings");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await apiFetch(`/listings/${id}/cluster-approve`, {
        method: "PUT",
        body: JSON.stringify({ action: "approve" }),
      });
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Listing approved — it will now appear on the marketplace under your name.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve listing");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedId(id);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await apiFetch(`/listings/${selectedId}/cluster-approve`, {
        method: "PUT",
        body: JSON.stringify({ action: "reject", reason }),
      });
      setListings((prev) => prev.filter((l) => l.id !== selectedId));
      toast.success("Listing rejected.");
      setRejectModalOpen(false);
      setSelectedId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject listing");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading pending listings..." size="lg" />;

  if (errorMessage) {
    return (
      <EmptyState
        icon={Package}
        title="Unable to load listings"
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
        className="flex flex-col gap-2"
      >
        <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Pending Listings</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Review and approve farmer supply listings. Approved listings appear on the marketplace
          under your name.
        </p>
      </motion.div>

      {/* Info Banner */}
      {listings.length > 0 && (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-(--gap-base) rounded-2xl bg-yellow-50 p-(--space-lg)"
        >
          <AlertCircle size={22} className="shrink-0 text-yellow-600" />
          <p className="font-roboto-slab text-sm text-yellow-800">
            <span className="font-semibold">{listings.length}</span> listing
            {listings.length !== 1 ? "s" : ""} awaiting your review
          </p>
        </motion.div>
      )}

      {/* Listings Grid */}
      {listings.length > 0 ? (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2 lg:grid-cols-3"
        >
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              variants={FADE_IN_VARIANT}
              className="flex flex-col gap-4 rounded-3xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
            >
              {/* Top */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour) capitalize">
                    {listing.fishType}
                  </h3>
                  <p className="font-roboto-slab text-sm text-(--text-colour)">
                    by {listing.farmerName}
                  </p>
                </div>
                <span className="font-roboto-slab rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                  Pending
                </span>
              </div>

              <div className="h-px w-full bg-gray-100" />

              {/* Details */}
              <div className="flex flex-col gap-2.5">
                <div className="font-roboto-slab flex items-center gap-2 text-sm text-(--text-colour)">
                  <Package size={15} className="shrink-0 text-gray-400" />
                  <span>
                    {listing.totalFishAvailable.toLocaleString()} fish ·{" "}
                    {listing.packaging.weightKg}kg/unit
                  </span>
                </div>
                <div className="font-roboto-slab flex items-center gap-2 text-sm text-(--text-colour)">
                  <Calendar size={15} className="shrink-0 text-gray-400" />
                  <span>
                    Harvest:{" "}
                    {new Date(listing.harvestDate).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="font-roboto-slab flex items-center gap-2 text-sm text-(--text-colour)">
                  <MapPin size={15} className="shrink-0 text-gray-400" />
                  <span>
                    Listed:{" "}
                    {new Date(listing.listedDate).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleApprove(listing.id)}
                  disabled={actionLoading}
                  className="font-roboto-slab flex items-center justify-center gap-2 rounded-xl bg-(--theme-green-dark) py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button
                  onClick={() => handleRejectClick(listing.id)}
                  disabled={actionLoading}
                  className="font-roboto-slab flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap)"
        >
          <CheckCircle size={48} className="text-green-600" />
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
              All caught up!
            </h3>
            <p className="font-roboto-slab text-(--text-colour)">
              No pending listings to review at the moment
            </p>
          </div>
        </motion.div>
      )}

      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedId(null);
        }}
        onConfirm={handleRejectConfirm}
        loading={actionLoading}
      />
    </div>
  );
}
