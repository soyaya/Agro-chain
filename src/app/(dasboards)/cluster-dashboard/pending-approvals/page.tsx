"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ListingCard } from "~/components/listings/ListingCard";
import type { FarmerSupplyListing } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { clusterService } from "~/lib/services/cluster.service";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

function RejectModal({ isOpen, onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    onConfirm(reason);
    setReason("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="bg-opacity-50 fixed inset-0 z-50 bg-(--black)"
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
                  <XCircle size={24} className="text-error-red" />
                </div>
                <div>
                  <h3 className="font-ubuntu text-heading-colour text-xl font-bold">
                    Reject Listing
                  </h3>
                  <p className="text-text-colour text-sm">
                    Please provide a reason for rejection
                  </p>
                </div>
              </div>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="font-roboto-slab focus:border-gray-border text-text-colour border-input-border h-32 w-full rounded-2xl border p-(--space-md) text-base transition outline-none"
              />

              <div className="grid grid-cols-2 gap-(--gap-base)">
                <button
                  onClick={onClose}
                  className="border-gray-border text-text-colour hover:bg-gray-bg flex h-12 items-center justify-center rounded-full border text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex h-12 items-center justify-center rounded-full bg-red-600 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Reject Listing
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function PendingApprovalsPage() {
  const [listings, setListings] = useState<FarmerSupplyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    const loadListings = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await clusterService.getPendingApprovals();
        const payload = response.data.listings;

        if (mounted) {
          setListings(
            payload.map((item) => ({
              id: item.id,
              farmerId: "",
              farmerName: item.farmerName,
              fishType: item.fishType,
              harvestDate: new Date(item.harvestDate),
              totalAvailableKg: item.totalFishAvailable,
              packaging: [
                {
                  weightKg: item.packaging.weightKg,
                  quantity: item.packaging.quantity,
                },
              ],
              status: "pending",
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            })),
          );
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load listings";
        if (mounted) {
          setErrorMessage(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadListings();

    return () => {
      mounted = false;
    };
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await clusterService.reviewListing(id, "approved");

      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Listing approved successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to approve listing";
      toast.error(message);
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedListingId(id);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedListingId) return;

    try {
      await clusterService.reviewListing(selectedListingId, "rejected", reason);

      setListings((prev) => prev.filter((l) => l.id !== selectedListingId));
      toast.success("Listing rejected");
      setRejectModalOpen(false);
      setSelectedListingId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reject listing";
      toast.error(message);
    }
  };

  return (
    <div className="bg-gray-bg min-h-screen">
      <div className="container-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-(--section-py-lg)">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER_VARIANT}
          className="flex flex-col gap-(--section-gap)"
        >
          {/* Header */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="flex flex-col gap-(--gap-sm)"
          >
            <h1 className="font-ubuntu text-heading-colour text-3xl font-bold lg:text-4xl">
              Pending Approvals
            </h1>
            <p className="font-roboto-slab text-text-colour">
              Review and approve farmer supply listings
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="flex items-center gap-(--gap-base) rounded-2xl bg-yellow-50 p-(--space-base)"
          >
            <AlertCircle size={24} className="text-yellow-600" />
            <div>
              <p className="font-roboto-slab flex items-center text-sm font-medium text-yellow-800">
                <span className="font-semibold">{listings.length} </span>{" "}
                listing
                {listings.length !== 1 ? "s" : ""} awaiting review
              </p>
              <p className="text-sm text-yellow-700">
                Approved listings will appear on the marketplace under your name
              </p>
            </div>
          </motion.div>

          {/* Listings Grid */}
          {loading ? (
            <div className="border-gray-border rounded-3xl border bg-(--white) p-(--section-gap) text-center">
              <p className="text-text-colour">Loading pending approvals...</p>
            </div>
          ) : errorMessage ? (
            <div className="border-gray-border rounded-3xl border bg-(--white) p-(--section-gap) text-center">
              <p className="text-error-red">{errorMessage}</p>
            </div>
          ) : listings.length > 0 ? (
            <motion.div
              variants={STAGGER_CONTAINER_VARIANT}
              className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2 lg:grid-cols-3"
            >
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showActions
                  onApprove={handleApprove}
                  onReject={handleRejectClick}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={FADE_IN_VARIANT}
              className="border-gray-border flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border bg-(--white) p-(--section-gap)"
            >
              <CheckCircle size={48} className="text-theme-green-dark" />
              <div className="flex flex-col items-center gap-2 text-center">
                <h3 className="font-ubuntu text-heading-colour text-xl font-bold">
                  All caught up!
                </h3>
                <p className="text-text-colour">
                  No pending listings to review at the moment
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedListingId(null);
        }}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}
