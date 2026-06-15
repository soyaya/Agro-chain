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

export default function SavedListingsPage() {
  const router = useRouter();
  const [savedListings, setSavedListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await buyerService.getSavedListings();
        if (mounted) {
          setSavedListings((res.data.listings ?? []) as MarketplaceListing[]);
        }
      } catch {
        if (mounted) setSavedListings([]);
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
    setSavedListings((prev) => prev.filter((l) => l.id !== listingId));
    try {
      await buyerService.unsaveListing(listingId);
      toast.success("Removed from saved listings");
    } catch {
      toast.error("Failed to remove listing");
    }
  };

  const handleAddToCart = (listing: MarketplaceListing) => {
    router.push(`/marketplace/${listing.id}`);
  };

  if (loading)
    return <LoadingState message="Loading saved listings..." size="lg" />;

  return (
    <div className="flex flex-col gap-8">
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
            <h1 className="font-ubuntu text-heading-colour text-3xl font-bold">
              Saved Listings
            </h1>
            <p className="font-roboto-slab text-text-colour mt-1">
              {savedListings.length}{" "}
              {savedListings.length === 1 ? "listing" : "listings"} saved for
              later
            </p>
          </div>
        </div>
      </motion.div>

      {savedListings.length > 0 ? (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {savedListings.map((listing) => (
            <motion.div
              key={listing.id}
              variants={FADE_IN_VARIANT}
              className="group relative"
            >
              <MarketplaceCard
                listing={listing}
                onClick={() => router.push(`/marketplace/${listing.id}`)}
                onAddToCart={handleAddToCart}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void handleRemove(listing.id);
                }}
                className="text-error-red border-gray-border absolute top-4 right-4 rounded-full border bg-(--white)/90 p-2 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
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
