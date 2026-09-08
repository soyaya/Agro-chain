"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MarketplaceCard } from "~/components/marketplace/MarketplaceCard";
import type { MarketplaceListing } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { EmptyState } from "~/components/ui/EmptyState";
import { LoadingState } from "~/components/ui/LoadingState";
import { buyerService } from "~/lib/services/buyer.service";
import { useCart } from "~/components/marketplace/useCart";

export default function SavedListingsPage() {
  const router = useRouter();
  const cart = useCart();
  const [savedListings, setSavedListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await buyerService.getSavedListings();
        if (mounted) setSavedListings(res.data.listings);
      } catch (error) {
        if (mounted) toast.error(error instanceof Error ? error.message : "Failed to load saved listings");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRemove = async (listingId: string) => {
    const previous = savedListings;
    setSavedListings((prev) => prev.filter((l) => l.id !== listingId));
    try {
      await buyerService.unsaveListing(listingId);
      toast.success("Removed from saved listings");
    } catch (error) {
      setSavedListings(previous);
      toast.error(error instanceof Error ? error.message : "Failed to remove listing");
    }
  };

  const handleAddToCart = (listing: MarketplaceListing) => {
    const defaultPkg = listing.packaging?.[0];
    if (!defaultPkg) {
      toast.error("No packages available for this listing");
      return;
    }
    cart.addToCart(listing, defaultPkg, { variant: "Table Size", processed: false });
    toast.success(`${listing.fishType} added to cart!`);
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
                  void handleRemove(listing.id);
                }}
                className="absolute top-4 right-4 rounded-full border border-gray-200 bg-(--white)/90 p-2 text-(--error-red) opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
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
