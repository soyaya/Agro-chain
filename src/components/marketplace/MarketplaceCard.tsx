"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Package,
  Phone,
  Truck,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { MarketplaceListing } from "~/types";
import { SCALE_IN_VARIANT } from "~/types/constants";
import { cn } from "~/lib/utils";
import { useAuth } from "~/lib/auth-context";

interface MarketplaceCardProps {
  listing: MarketplaceListing;
  isLiked?: boolean;
  onToggleLike?: (listing: MarketplaceListing) => void;
  onClick?: () => void;
  onAddToCart?: (listing: MarketplaceListing) => void;
}

export function MarketplaceCard({
  listing,
  isLiked,
  onToggleLike,
  onClick,
  onAddToCart,
}: MarketplaceCardProps) {
  const router = useRouter();
  const { user } = useAuth();

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/marketplace/${listing.id}`);
      return;
    }
    onAddToCart?.(listing);
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const packagePrices = (
    listing.packaging?.map((p) => p.pricePerUnit ?? 0) ?? []
  ).filter((p) => p > 0);
  const lowestPrice =
    packagePrices.length > 0
      ? Math.min(...packagePrices)
      : (listing.pricePerKg ?? 0);
  const highestPrice =
    packagePrices.length > 0 ? Math.max(...packagePrices) : lowestPrice;
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
        "border-gray-border flex flex-col gap-(--gap-base) rounded-3xl border bg-(--white) p-(--space-lg) shadow-sm transition",
        onClick && "cursor-pointer hover:shadow-md",
      )}
    >
      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-1 pr-8">
          <h3 className="font-ubuntu text-heading-colour text-xl font-bold">
            {listing.fishType}
          </h3>
          <p className="text-text-colour text-sm font-medium">
            {listing.businessName}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike?.(listing);
            }}
            className="group absolute top-0 right-0 z-10 p-1 transition-colors"
            aria-label={isLiked ? "Unlike listing" : "Like listing"}
          >
            <Heart
              size={20}
              className={cn(
                "transition-colors",
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-muted-text hover:text-red-500",
              )}
            />
          </button>
          <span className="font-ubuntu text-theme-green-dark mt-6 text-lg font-bold">
            ₦{displayPricePerKg.toLocaleString()}/kg
          </span>
          {lowestPrice !== highestPrice && (
            <span className="text-text-colour text-xs">
              Packs from ₦{lowestPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-(--space-md)">
        <div className="text-text-colour flex items-center gap-2 text-sm">
          <Package size={16} />
          <span>{listing.totalAvailableKg}kg available</span>
        </div>

        <div className="text-text-colour flex items-center gap-2 text-sm">
          <MapPin size={16} />
          <span>
            {listing.localGovernment}, {listing.state}
          </span>
        </div>

        <div className="text-text-colour flex items-center gap-2 text-sm">
          <Phone size={16} />
          <span>{listing.clusterFarmerContact}</span>
        </div>
      </div>

      {/* Packaging Options */}
      <div className="bg-gray-bg flex flex-col gap-(--space-md) rounded-2xl p-(--space-md)">
        <p className="text-heading-colour text-sm font-medium">
          Available Packages:
        </p>
        <div className="flex flex-wrap gap-2">
          {listing.packaging.map((pkg, index) => (
            <div
              key={index}
              className="flex items-center gap-1 rounded-full bg-(--white) px-(--space-md) py-1 text-sm"
            >
              <span className="text-heading-colour font-medium">
                {pkg.weightKg}kg
              </span>
              <span className="text-text-colour">×{pkg.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Options */}
      {listing.deliveryOptions.length > 0 && (
        <div className="text-text-colour flex items-center gap-2 text-sm">
          <Truck size={16} />
          <span>{listing.deliveryOptions.join(", ")}</span>
        </div>
      )}

      {/* Harvest Date */}
      <div className="text-text-colour text-sm">
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
          className="border-gray-border text-text-colour hover:bg-gray-bg flex h-10 items-center justify-center rounded-full border text-sm font-medium transition"
        >
          View Details
        </button>
        <button
          onClick={handleAddToCart}
          aria-label={
            user ? `Add ${listing.fishType} to cart` : "Log in to buy"
          }
          className="bg-theme-green-dark flex h-10 items-center justify-center gap-2 rounded-full text-sm font-medium text-white transition hover:opacity-90"
        >
          <ShoppingCart size={16} aria-hidden="true" />
          Order Now
        </button>
      </div>
    </motion.div>
  );
}
