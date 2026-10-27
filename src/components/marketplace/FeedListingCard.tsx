"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Wheat } from "lucide-react";
import type { FeedListing } from "~/lib/services/feed.service";
import { SCALE_IN_VARIANT } from "~/types/constants";

interface FeedListingCardProps {
  listing: FeedListing;
  onClick?: () => void;
}

export function FeedListingCard({ listing, onClick }: FeedListingCardProps) {
  return (
    <motion.div
      variants={SCALE_IN_VARIANT}
      role="article"
      aria-label={`${listing.brandName} feed listing`}
      className="flex flex-col rounded-2xl border border-(--border-gray) bg-(--white) shadow-sm transition-[border-color,box-shadow] duration-200 overflow-hidden hover:border-(--theme-green-dark)/40 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative h-44 w-full bg-(--gray-bg)">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.brandName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Wheat size={40} className="text-(--text-colour) opacity-30" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour) leading-tight">
              {listing.brandName}
            </h3>
            <p className="text-sm text-(--text-colour)">
              {listing.categoryLabel} ({listing.pelletSizeMm != null ? `${listing.pelletSizeMm}mm` : `${listing.minPelletSizeMm}–${listing.maxPelletSizeMm}mm`}) ·{" "}
              {listing.pelletForm} · {listing.bagWeightKg}kg bag
            </p>
          </div>
          <span className="font-ubuntu text-base font-bold text-(--theme-green-dark) whitespace-nowrap">
            ₦{listing.pricePerBag.toLocaleString()}/bag
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-(--text-colour)">
          <MapPin size={14} />
          <span>
            {[listing.subCommunity, listing.localGovernment, listing.state].filter(Boolean).join(", ")}
          </span>
        </div>

        {/* Actions */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          aria-label={`View details for ${listing.brandName}`}
          className="flex h-10 items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90 cursor-pointer mt-1"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
}
