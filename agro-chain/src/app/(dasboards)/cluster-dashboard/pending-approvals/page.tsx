"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ListingCard } from "~/components/listings/ListingCard";
import type { FarmerSupplyListing } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";

// Mock data - replace with actual API call
const mockPendingListings: FarmerSupplyListing[] = [
  {
    id: "1",
    farmerId: "farmer-1",
    farmerName: "John Doe",
    fishType: "Catfish",
    harvestDate: new Date("2024-03-15"),
    totalAvailableKg: 2000,
    packaging: [
      { weightKg: 1, quantity: 1000, pricePerUnit: 1500 },
      { weightKg: 5, quantity: 200, pricePerUnit: 7000 },
    ],
    status: "pending",
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
  {
    id: "2",
    farmerId: "farmer-2",
    farmerName: "Jane Smith",
    fishType: "Tilapia",
    harvestDate: new Date("2024-03-12"),
    totalAvailableKg: 1500,
    packaging: [{ weightKg: 2, quantity: 750, pricePerUnit: 2800 }],
    status: "pending",
    createdAt: new Date("2024-03-08"),
    updatedAt: new Date("2024-03-08"),
  },
  {
    id: "3",
    farmerId: "farmer-3",
    farmerName: "Mike Johnson",
    fishType: "Catfish",
    harvestDate: new Date("2024-03-18"),
    totalAvailableKg: 3000,
    packaging: [{ weightKg: 3, quantity: 1000, pricePerUnit: 4200 }],
    status: "pending",
    createdAt: new Date("2024-03-11"),
    updatedAt: new Date("2024-03-11"),
  },
];

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
                  <XCircle size={24} className="text-(--error-red)" />
                </div>
                <div>
                  <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                    Reject Listing
                  </h3>
                  <p className="text-sm text-(--text-colour)">
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
                  onClick={onClose}
                  className="flex h-12 items-center justify-center rounded-full border border-(--border-gray) text-sm font-medium text-(--text-colour) transition hover:bg-(--gray-bg)"
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
  const [listings, setListings] = useState<FarmerSupplyListing[]>(mockPendingListings);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Listing approved successfully!");
    } catch (error) {
      toast.error("Failed to approve listing");
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedListingId(id);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedListingId) return;

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setListings((prev) => prev.filter((l) => l.id !== selectedListingId));
      toast.success("Listing rejected");
      setRejectModalOpen(false);
      setSelectedListingId(null);
    } catch (error) {
      toast.error("Failed to reject listing");
    }
  };

  return (
    <div className="min-h-screen bg-(--gray-bg)">
      <div className="container-max-width px-(--section-px) py-(--section-py) sm:px-(--section-px-sm) sm:py-(--section-py-sm) lg:px-(--section-px-lg) lg:py-(--section-py-lg)">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER_VARIANT}
          className="flex flex-col gap-(--section-gap)"
        >
          {/* Header */}
          <motion.div variants={FADE_IN_VARIANT} className="flex flex-col gap-(--gap-sm)">
            <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour) lg:text-4xl">
              Pending Approvals
            </h1>
            <p className="font-roboto-slab text-(--text-colour)">
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
                <span className="font-semibold">{listings.length}{" "}</span> listing
                {listings.length !== 1 ? "s" : ""} awaiting review
              </p>
              <p className="text-sm text-yellow-700">
                Approved listings will appear on the marketplace under your name
              </p>
            </div>
          </motion.div>

          {/* Listings Grid */}
          {listings.length > 0 ? (
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
              className="flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap)"
            >
              <CheckCircle size={48} className="text-green-600" />
              <div className="flex flex-col items-center gap-2 text-center">
                <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                  All caught up!
                </h3>
                <p className="text-(--text-colour)">No pending listings to review at the moment</p>
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
