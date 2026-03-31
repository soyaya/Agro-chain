"use client";

import { motion } from "framer-motion";
import { MapPin, Package, Phone, Truck, ShoppingCart, Heart } from "lucide-react";
import type { MarketplaceListing } from "~/types";
import { SCALE_IN_VARIANT } from "~/types/constants";
import { cn } from "~/lib/utils";

interface MarketplaceCardProps {
  listing: MarketplaceListing;
  isLiked?: boolean;
  onToggleLike?: (listing: MarketplaceListing) => void;
  onClick?: () => void;
  onAddToCart?: (listing: MarketplaceListing) => void;
}

export function MarketplaceCard({ listing, isLiked, onToggleLike, onClick, onAddToCart }: MarketplaceCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const packagePrices = listing.packaging?.map((p) => p.pricePerUnit) ?? [];
  const lowestPrice = packagePrices.length > 0 ? Math.min(...packagePrices) : listing.pricePerKg ?? 0;
  const highestPrice = packagePrices.length > 0 ? Math.max(...packagePrices) : lowestPrice;
  const displayPricePerKg = listing.pricePerKg ?? lowestPrice;

  return (
    <motion.div
      variants={SCALE_IN_VARIANT}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      role="article"
      aria-label={`${listing.fishType} listing from ${listing.businessName}`}
      className={cn(
        "flex flex-col gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--space-lg) shadow-sm transition",
        onClick && "cursor-pointer hover:shadow-md",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between relative">
        <div className="flex flex-col gap-1 pr-8">
          <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
            {listing.fishType}
          </h3>
          <p className="text-sm font-medium text-(--text-colour)">{listing.businessName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike?.(listing);
            }}
            className="absolute top-0 right-0 p-1 transition-colors group z-10"
            aria-label={isLiked ? "Unlike listing" : "Like listing"}
          >
            <Heart size={20} className={cn("transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500")} />
          </button>
          <span className="font-ubuntu text-lg font-bold text-(--theme-green-dark) mt-6">
            ₦{displayPricePerKg.toLocaleString()}/kg
          </span>
          {lowestPrice !== highestPrice && (
            <span className="text-xs text-(--text-colour)">
              Packs from ₦{lowestPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-(--space-md)">
        <div className="flex items-center gap-2 text-sm text-(--text-colour)">
          <Package size={16} />
          <span>{listing.totalAvailableKg}kg available</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-(--text-colour)">
          <MapPin size={16} />
          <span>
            {listing.localGovernment}, {listing.state}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-(--text-colour)">
          <Phone size={16} />
          <span>{listing.clusterFarmerContact}</span>
        </div>
      </div>

      {/* Packaging Options */}
      <div className="flex flex-col gap-(--space-md) rounded-2xl bg-(--gray-bg) p-(--space-md)">
        <p className="text-sm font-medium text-(--heading-colour)">Available Packages:</p>
        <div className="flex flex-wrap gap-2">
          {listing.packaging.map((pkg, index) => (
            <div
              key={index}
              className="flex items-center gap-1 rounded-full bg-(--white) px-(--space-md) py-1 text-sm"
            >
              <span className="font-medium text-(--heading-colour)">{pkg.weightKg}kg</span>
              <span className="text-(--text-colour)">×{pkg.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Options */}
      {listing.deliveryOptions.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-(--text-colour)">
          <Truck size={16} />
          <span>{listing.deliveryOptions.join(", ")}</span>
        </div>
      )}

      {/* Harvest Date */}
      <div className="text-sm text-(--text-colour)">
        Harvested: {formatDate(listing.harvestDate)}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-(--gap-base)">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          aria-label={`View details for ${listing.fishType} listing`}
          className="flex h-10 items-center justify-center rounded-full border border-(--border-gray) text-sm font-medium text-(--text-colour) transition hover:bg-(--gray-bg)"
        >
          View Details
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(listing);
          }}
          aria-label={`Add ${listing.fishType} to cart`}
          className="flex h-10 items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90"
        >
          <ShoppingCart size={16} aria-hidden="true" />
          Order Now
        </button>
      </div>
    </motion.div>
  );
}
