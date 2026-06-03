"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MarketplaceCard } from "~/components/marketplace/MarketplaceCard";
import type { MarketplaceListing } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { EmptyState } from "~/components/ui/EmptyState";
import { LoadingState } from "~/components/ui/LoadingState";

// Mock data - replace with actual API call
const mockSavedListings: MarketplaceListing[] = [
  {
    id: "1",
    clusterFarmerId: "cluster-1",
    clusterFarmerName: "Green Valley Farms",
    businessName: "Green Valley Fish Supply",
    fishType: "Catfish",
    harvestDate: new Date("2024-03-15"),
    totalAvailableKg: 2000,
    packaging: [
      { weightKg: 1, quantity: 1000, pricePerUnit: 1500 },
      { weightKg: 5, quantity: 200, pricePerUnit: 7000 },
    ],
    location: "Kaduna North, Kaduna",
    state: "Kaduna",
    localGovernment: "Kaduna North",
    pricePerKg: 1500,
    deliveryOptions: ["Pickup from warehouse", "Delivery within state"],
    visibleOnMarketplace: true,
    status: "approved",
    clusterFarmerContact: "08012345678",
    warehouseLocation: "123 Farm Road, Kaduna",
    logisticsAvailable: true,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
  {
    id: "2",
    clusterFarmerId: "cluster-2",
    clusterFarmerName: "Blue Ocean Fisheries",
    businessName: "Blue Ocean Fish Market",
    fishType: "Tilapia",
    harvestDate: new Date("2024-03-12"),
    totalAvailableKg: 1500,
    packaging: [
      { weightKg: 2, quantity: 750, pricePerUnit: 2800 },
      { weightKg: 10, quantity: 150, pricePerUnit: 13500 },
    ],
    location: "Lagos Island, Lagos",
    state: "Lagos",
    localGovernment: "Lagos Island",
    pricePerKg: 1400,
    deliveryOptions: ["Pickup from warehouse", "Delivery nationwide"],
    visibleOnMarketplace: true,
    status: "approved",
    clusterFarmerContact: "08098765432",
    warehouseLocation: "45 Market Street, Lagos",
    logisticsAvailable: true,
    createdAt: new Date("2024-03-08"),
    updatedAt: new Date("2024-03-08"),
  },
];

export default function SavedListingsPage() {
  const router = useRouter();
  const [savedListings, setSavedListings] = useState<MarketplaceListing[]>(mockSavedListings);
  const [loading, setLoading] = useState(false);

  const handleRemove = (listingId: string) => {
    setSavedListings((prev) => prev.filter((l) => l.id !== listingId));
    toast.success("Removed from saved listings");
  };

  const handleAddToCart = (listing: MarketplaceListing) => {
    toast.success(`${listing.fishType} added to cart!`);
    // TODO: Implement cart functionality
  };

  if (loading) {
    return <LoadingState message="Loading saved listings..." size="lg" />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-xl bg-pink-50 p-3">
            <Heart size={28} className="text-pink-600" />
          </div>
          <div>
            <h1 className="font-ubuntu text-3xl font-bold text-gray-900">Saved Listings</h1>
            <p className="font-roboto-slab mt-1 text-gray-600">
              {savedListings.length} {savedListings.length === 1 ? "listing" : "listings"} saved for
              later
            </p>
          </div>
        </div>
      </motion.div>

      {/* Listings Grid */}
      {savedListings.length > 0 ? (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {savedListings.map((listing) => (
            <motion.div key={listing.id} variants={FADE_IN_VARIANT} className="group relative">
              <MarketplaceCard
                listing={listing}
                onClick={() => router.push(`/marketplace/${listing.id}`)}
                onAddToCart={handleAddToCart}
              />

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(listing.id);
                }}
                className="text-error-red absolute top-4 right-4 rounded-full border border-gray-200 bg-(--white)/90 p-2 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                aria-label="Remove from saved"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved listings"
          description="Save listings from the marketplace to view them here later"
          actionLabel="Browse Marketplace"
          actionHref="/marketplace"
          size="lg"
        />
      )}
    </div>
  );
}
