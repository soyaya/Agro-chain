"use client";

import { motion } from "framer-motion";
import { Calendar, Package, Clock } from "lucide-react";
import type { FarmerSupplyListing } from "~/types";
import { STATUS_COLORS, SCALE_IN_VARIANT } from "~/types/constants";
import { cn } from "~/lib/utils";

interface ListingCardProps {
  listing: FarmerSupplyListing;
  onClick?: () => void;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function ListingCard({
  listing,
  onClick,
  showActions = false,
  onApprove,
  onReject,
}: ListingCardProps) {
  const totalValue = listing.packaging.reduce(
    (sum, pkg) => sum + pkg.quantity * pkg.pricePerUnit,
    0,
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      variants={SCALE_IN_VARIANT}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      role="article"
      aria-label={`${listing.fishType} supply listing from ${listing.farmerName}, status: ${listing.status}`}
      className={cn(
        "flex flex-col gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--space-lg) shadow-sm transition",
        onClick && "cursor-pointer hover:shadow-md",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
            {listing.fishType}
          </h3>
          <p className="text-sm text-(--text-colour)">{listing.farmerName}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-(--space-md) py-1 text-sm font-medium",
            STATUS_COLORS[listing.status],
          )}
        >
          {listing.status}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-(--space-md)">
        <div className="flex items-center gap-2 text-sm text-(--text-colour)">
          <Package size={16} />
          <span>{listing.totalAvailableKg}kg available</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-(--text-colour)">
          <Calendar size={16} />
          <span>Harvest: {formatDate(listing.harvestDate)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-(--text-colour)">
          <Clock size={16} />
          <span>Listed: {formatDate(listing.createdAt)}</span>
        </div>
      </div>

      {/* Packaging Options */}
      <div className="flex flex-col gap-(--space-md) rounded-2xl bg-(--gray-bg) p-(--space-md)">
        <p className="text-sm font-medium text-(--heading-colour)">Packaging Options:</p>
        <div className="flex flex-col gap-1">
          {listing.packaging.map((pkg, index) => (
            <div key={index} className="flex justify-between text-sm text-(--text-colour)">
              <span>
                {pkg.weightKg}kg × {pkg.quantity}
              </span>
              <span className="font-medium">₦{pkg.pricePerUnit.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-(--border-gray) pt-(--space-md) text-sm font-medium text-(--heading-colour)">
          <span>Total Value:</span>
          <span>₦{totalValue.toLocaleString()}</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && listing.status === "pending" && (
        <div
          className="grid grid-cols-2 gap-(--gap-base)"
          role="group"
          aria-label="Listing actions"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReject?.(listing.id);
            }}
            aria-label={`Reject ${listing.fishType} listing from ${listing.farmerName}`}
            className="flex h-10 items-center justify-center rounded-full border border-(--border-gray) text-sm font-medium text-(--text-colour) transition hover:bg-(--gray-bg)"
          >
            Reject
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApprove?.(listing.id);
            }}
            aria-label={`Approve ${listing.fishType} listing from ${listing.farmerName}`}
            className="flex h-10 items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90"
          >
            Approve
          </button>
        </div>
      )}

      {/* Rejection Reason */}
      {listing.status === "rejected" && listing.rejectionReason && (
        <div className="rounded-2xl bg-red-50 p-(--space-md)">
          <p className="text-sm text-(--error-red)">
            <span className="font-medium">Reason: </span>
            {listing.rejectionReason}
          </p>
        </div>
      )}
    </motion.div>
  );
}
