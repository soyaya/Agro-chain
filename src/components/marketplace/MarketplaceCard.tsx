"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Fish } from "lucide-react";
import type { MarketplaceListing } from "~/types";
import { SCALE_IN_VARIANT, FISH_TYPE_CATEGORIES } from "~/types/constants";
import { cn } from "~/lib/utils";

interface MarketplaceCardProps {
  listing: MarketplaceListing;
  isLiked?: boolean;
  onToggleLike?: (listing: MarketplaceListing) => void;
  onClick?: () => void;
  onAddToCart?: (listing: MarketplaceListing) => void;
}

export function MarketplaceCard({ listing, isLiked, onToggleLike, onClick, onAddToCart }: MarketplaceCardProps) {
  const unit = listing.unit === "piece" ? "piece" : "kg";
  const displayPricePerKg = listing.pricePerKg !== undefined ? Number(listing.pricePerKg) : 0;

  const displayImage =
    listing.imageUrl ?? FISH_TYPE_CATEGORIES.find((c) => c.value === listing.fishType)?.imageUrl;

  return (
    <motion.div
      variants={SCALE_IN_VARIANT}
      role="article"
      aria-label={`${listing.fishType} listing`}
      className="flex flex-col rounded-2xl border border-(--border-gray) bg-(--white) shadow-sm transition-[border-color,box-shadow] duration-200 overflow-hidden hover:border-(--theme-green-dark)/40 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative h-44 w-full bg-(--gray-bg)">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={`${listing.fishType}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Fish size={40} className="text-(--text-colour) opacity-30" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour) leading-tight">
            {listing.fishType}
          </h3>
          <span className="font-ubuntu text-base font-bold text-(--theme-green-dark) whitespace-nowrap">
            ₦{displayPricePerKg.toLocaleString()}/{unit}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-(--text-colour)">
          <MapPin size={14} />
          <span>{listing.localGovernment}, {listing.state}</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            aria-label={`View details for ${listing.fishType}`}
            className="flex h-10 items-center justify-center rounded-full border border-(--border-gray) text-sm font-medium text-(--text-colour) transition hover:bg-(--gray-bg) cursor-pointer"
            style={{ cursor: "pointer" }}
          >
            View Details
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            aria-label={`Order ${listing.fishType}`}
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90 cursor-pointer"
            style={{ cursor: "pointer" }}
          >
            Order Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
