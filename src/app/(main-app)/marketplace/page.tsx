"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Store, ShoppingBag, ArrowLeft } from "lucide-react";
import { MarketplaceCard } from "~/components/marketplace/MarketplaceCard";
import { MarketplaceFilters } from "~/components/marketplace/MarketplaceFilters";
import type { MarketplaceListing, MarketplaceFilters as Filters } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { apiFetch } from "~/lib/api";
import { useCart } from "~/components/marketplace/useCart";
import { CartDrawer } from "~/components/marketplace/CartDrawer";
import { usePlatformSettings } from "~/context/PlatformSettingsContext";
import type { FishType } from "~/types/constants";

type MarketplaceResponse = {
  status: string;
  data: {
    listings: MarketplaceListing[];
    pagination?: { total: number; page: number; limit: number; totalPages: number };
  };
};

export default function MarketplacePage() {
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filters, setFilters] = useState<Filters>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [likedListings, setLikedListings] = useState<string[]>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("liked_listings") : null;
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();
  const { pricePerKg } = usePlatformSettings();


  useEffect(() => {
    let mounted = true;

    const loadListings = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await apiFetch<MarketplaceResponse>("/marketplace");
        const payload = response.data?.listings ?? [];

        const normalized = payload.map((listing) => ({
          ...listing,
          totalAvailableKg: Number(listing.totalAvailableKg),
          pricePerKg:
            Number(listing.pricePerKg) ||
            (pricePerKg[listing.fishType as FishType] ?? pricePerKg.catfish),
          packaging: listing.packaging?.map((pkg) => ({
            ...pkg,
            weightKg: Number(pkg.weightKg),
            pricePerUnit:
              Number(pkg.pricePerUnit) ||
              Number(pkg.weightKg) *
                (pricePerKg[listing.fishType as FishType] ?? pricePerKg.catfish),
          })),
        }));

        if (mounted) {
          setListings(normalized);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load listings";
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
  }, [pricePerKg]);

  const handleToggleLike = (listing: MarketplaceListing) => {
    setLikedListings((prev) => {
      const isLiked = prev.includes(listing.id);
      const newLikes = isLiked ? prev.filter((id) => id !== listing.id) : [...prev, listing.id];
      localStorage.setItem("liked_listings", JSON.stringify(newLikes));
      if (!isLiked) {
        toast.success("Added to liked listings!");
      }
      return newLikes;
    });
  };

  const handleAddToCart = (listing: MarketplaceListing) => {
    const defaultPkg = listing.packaging?.[0];
    if (!defaultPkg) {
      toast.error("No packages available for this listing");
      return;
    }
    cart.addToCart(listing, defaultPkg, { variant: "Table Size", processed: false });
    setCartOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  // Apply filters
  const filteredListings = listings.filter((listing) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        listing.fishType.toLowerCase().includes(searchLower) ||
        listing.businessName.toLowerCase().includes(searchLower) ||
        listing.clusterFarmerName.toLowerCase().includes(searchLower) ||
        listing.state.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }
    if (filters.fishType && listing.fishType !== filters.fishType) return false;
    if (filters.state && listing.state !== filters.state) return false;
    if (filters.minPrice && listing.pricePerKg < filters.minPrice) return false;
    if (filters.maxPrice && listing.pricePerKg > filters.maxPrice) return false;
    if (filters.minQuantity && listing.totalAvailableKg < filters.minQuantity) return false;
    return true;
  });

  // Apply sorting
  const sortedListings = [...filteredListings].sort((a, b) => {
    const order = filters.sortOrder === "asc" ? 1 : -1;

    switch (filters.sortBy) {
      case "price":
        return (a.pricePerKg - b.pricePerKg) * order;
      case "quantity":
        return (a.totalAvailableKg - b.totalAvailableKg) * order;
      case "date":
      default:
        return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * order;
    }
  });

  return (
    <div className="bg-gray-bg min-h-screen">
      <div className="container-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER_VARIANT}
          className="flex flex-col gap-(--section-gap)"
        >
          {/* Header */}
          <motion.div variants={FADE_IN_VARIANT}>
            <button
              onClick={() => router.back()}
              className="text-text-colour hover:text-heading-colour mb-4 flex items-center gap-2 text-sm transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div className="flex items-center gap-(--gap-base)">
              <Store size={28} className="text-green-700" />
              <div>
                <h1 className="font-ubuntu text-heading-colour text-3xl font-bold lg:text-4xl">
                  Fish Marketplace
                </h1>
                <p className="text-text-colour mt-1">
                  Browse fresh fish supplies from verified cluster farmers
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setCartOpen(true)}
                  className="border-gray-border text-heading-colour hover:bg-gray-bg relative flex items-center gap-2 rounded-full border bg-(--white) px-4 py-2 text-sm font-medium shadow-sm transition"
                  aria-label="Open cart"
                >
                  <ShoppingBag size={18} />
                  Cart
                  {cart.totalItems > 0 && (
                    <span className="bg-theme-green-dark absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-white">
                      {cart.totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="grid grid-cols-2 gap-(--gap-base) md:grid-cols-4"
          >
            <div className="border-gray-border flex flex-col gap-2 rounded-2xl border bg-(--white) p-(--space-lg)">
              <span className="text-heading-colour text-2xl font-bold">
                {sortedListings.length}
              </span>
              <span className="text-text-colour text-sm">Available Listings</span>
            </div>

            <div className="border-gray-border flex flex-col gap-2 rounded-2xl border bg-(--white) p-(--space-lg)">
              <span className="text-heading-colour text-2xl font-bold">
                {new Set(sortedListings.map((l) => l.fishType)).size}
              </span>
              <span className="text-text-colour text-sm">Fish Types</span>
            </div>

            <div className="border-gray-border flex flex-col gap-2 rounded-2xl border bg-(--white) p-(--space-lg)">
              <span className="text-heading-colour text-2xl font-bold">
                {new Set(sortedListings.map((l) => l.state)).size}
              </span>
              <span className="text-text-colour text-sm">States</span>
            </div>

            <div className="border-gray-border flex flex-col gap-2 rounded-2xl border bg-(--white) p-(--space-lg)">
              <span className="text-heading-colour text-2xl font-bold">
                {sortedListings.reduce((sum, l) => sum + l.totalAvailableKg, 0).toLocaleString()}
                kg
              </span>
              <span className="text-text-colour text-sm">Total Available</span>
            </div>
          </motion.div>

          {/* Content */}
          <div className="grid grid-cols-1 gap-(--gap-lg) lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <MarketplaceFilters
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>

            {/* Listings Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <motion.div
                  variants={FADE_IN_VARIANT}
                  className="border-gray-border flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border bg-(--white) p-(--section-gap)"
                >
                  <ShoppingBag size={48} className="text-text-colour" />
                  <p className="text-text-colour">Loading marketplace listings...</p>
                </motion.div>
              ) : errorMessage ? (
                <motion.div
                  variants={FADE_IN_VARIANT}
                  className="border-gray-border flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border bg-(--white) p-(--section-gap)"
                >
                  <ShoppingBag size={48} className="text-text-colour" />
                  <p className="text-error-red">{errorMessage}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="border-gray-border text-heading-colour hover:bg-gray-bg rounded-full border px-(--space-xl) py-(--space-md) transition"
                  >
                    Retry
                  </button>
                </motion.div>
              ) : sortedListings.length > 0 ? (
                <motion.div
                  variants={STAGGER_CONTAINER_VARIANT}
                  className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2 xl:grid-cols-3"
                >
                  {sortedListings.map((listing) => (
                    <MarketplaceCard
                      key={listing.id}
                      listing={listing}
                      isLiked={likedListings.includes(listing.id)}
                      onToggleLike={handleToggleLike}
                      onClick={() => router.push(`/marketplace/${listing.id}`)}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  variants={FADE_IN_VARIANT}
                  className="border-gray-border flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border bg-(--white) p-(--section-gap)"
                >
                  <ShoppingBag size={48} className="text-text-colour" />
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h3 className="font-ubuntu text-heading-colour text-xl font-bold">
                      No listings found
                    </h3>
                    <p className="text-text-colour">
                      Try adjusting your filters to see more results
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="bg-theme-green-dark rounded-full px-(--space-xl) py-(--space-md) text-white transition hover:opacity-90"
                  >
                    Reset Filters
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <CartDrawer
        isOpen={cartOpen}
        items={cart.items}
        subtotal={cart.subtotal}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={cart.updateQuantity}
      />
    </div>
  );
}
