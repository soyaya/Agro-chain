"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Store, ShoppingBag } from "lucide-react";
import { MarketplaceCard } from "~/components/marketplace/MarketplaceCard";
import { MarketplaceFilters } from "~/components/marketplace/MarketplaceFilters";
import type { MarketplaceListing, MarketplaceFilters as Filters } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT, BASE_PRICE_PER_KG_NAIRA } from "~/types/constants";
import { apiFetch, ApiError } from "~/lib/api";
import { buyerService } from "~/lib/services/buyer.service";
import { platformService } from "~/lib/services/platform.service";
import { useCart } from "~/components/marketplace/useCart";
import { CartDrawer } from "~/components/marketplace/CartDrawer";
import { OnboardingOverlay } from "~/components/marketplace/OnboardingOverlay";
import { useAuth } from "~/lib/auth-context";

type MarketplaceResponse = {
  status: string;
  data: {
    listings: MarketplaceListing[];
    pagination?: { total: number; page: number; limit: number; totalPages: number };
  };
};

export default function MarketplacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filters, setFilters] = useState<Filters>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [locationDefaultApplied, setLocationDefaultApplied] = useState(false);
  const [activeStates, setActiveStates] = useState<string[] | undefined>(undefined);
  const [likedListings, setLikedListings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();

  // Buyers see their own location's listings first — once, on load, not
  // re-applied if they've already changed the filter themselves (e.g. to
  // browse a different LGA, which should stick even after this effect
  // re-runs on an unrelated user object change).
  useEffect(() => {
    if (locationDefaultApplied || !user?.locationState) return;
    setFilters((prev) => ({
      ...prev,
      state: prev.state ?? user.locationState,
      localGovernment: prev.localGovernment ?? user.locationLga,
    }));
    setLocationDefaultApplied(true);
  }, [user, locationDefaultApplied]);

  useEffect(() => {
    let mounted = true;
    platformService
      .getActiveStates()
      .then((res) => {
        if (mounted) setActiveStates(res.data.activeStates);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    buyerService
      .getSavedListings()
      .then((res) => {
        if (mounted) setLikedListings(res.data.listings.map((l) => l.id));
      })
      .catch(() => {
        // Not logged in, or request failed — saved listings just stays empty.
      });
    return () => {
      mounted = false;
    };
  }, []);

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
          pricePerKg: listing.pricePerKg ?? BASE_PRICE_PER_KG_NAIRA,
          packaging: listing.packaging?.map((pkg) => ({
            ...pkg,
            pricePerUnit: pkg.pricePerUnit ?? pkg.weightKg * BASE_PRICE_PER_KG_NAIRA,
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
  }, []);

  const handleToggleLike = async (listing: MarketplaceListing) => {
    const isLiked = likedListings.includes(listing.id);
    try {
      if (isLiked) {
        await buyerService.unsaveListing(listing.id);
        setLikedListings((prev) => prev.filter((id) => id !== listing.id));
      } else {
        await buyerService.saveListing(listing.id);
        setLikedListings((prev) => [...prev, listing.id]);
        toast.success("Added to saved listings!");
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        toast.error("Log in to save listings.");
        return;
      }
      toast.error(error instanceof Error ? error.message : "Failed to update saved listings");
    }
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
    if (filters.localGovernment && listing.localGovernment !== filters.localGovernment) return false;
    if (filters.ward && listing.ward !== filters.ward) return false;
    if (filters.minPrice && listing.pricePerKg < filters.minPrice) return false;
    if (filters.maxPrice && listing.pricePerKg > filters.maxPrice) return false;
    if (filters.minQuantity && listing.totalAvailableKg < filters.minQuantity) return false;
    return true;
  });

  // Buyers see their own ward first, then the rest of their LGA, then
  // everything else — a proximity tiebreak ahead of whatever sort they pick,
  // so "around me" stays the default browsing order without hiding anything.
  const proximityRank = (listing: MarketplaceListing): number => {
    if (user?.locationWard && listing.ward === user.locationWard) return 0;
    if (user?.locationLga && listing.localGovernment === user.locationLga) return 1;
    return 2;
  };

  // Apply sorting
  const sortedListings = [...filteredListings].sort((a, b) => {
    const proximityDiff = proximityRank(a) - proximityRank(b);
    if (proximityDiff !== 0) return proximityDiff;

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
    <div className="min-h-screen bg-(--gray-bg)">
      <OnboardingOverlay />
      <div className="container-max-width px-(--section-px) py-(--section-py) sm:px-(--section-px-sm) sm:py-(--section-py-sm) lg:px-(--section-px-lg) lg:py-(--section-py-lg)">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER_VARIANT}
          className="flex flex-col gap-(--section-gap)"
        >
          {/* Header */}
          <motion.div variants={FADE_IN_VARIANT}>
            <div className="flex items-center gap-(--gap-base)">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--theme-green-dark)">
                <Store size={32} className="text-white" />
              </div>
              <div>
                <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour) lg:text-4xl">
                  Fish Marketplace
                </h1>
                <p className="mt-1 text-(--text-colour)">
                  Browse fresh fish supplies from verified cluster farmers
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative flex items-center gap-2 rounded-full border border-(--border-gray) bg-(--white) px-4 py-2 text-sm font-medium text-(--heading-colour) shadow-sm transition hover:bg-(--gray-bg)"
                  aria-label="Open cart"
                >
                  <ShoppingBag size={18} />
                  Cart
                  {cart.totalItems > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-(--theme-green-dark) text-xs font-semibold text-white">
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
            <div className="flex flex-col gap-2 rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg)">
              <span className="text-2xl font-bold text-(--heading-colour)">
                {sortedListings.length}
              </span>
              <span className="text-sm text-(--text-colour)">Available Listings</span>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg)">
              <span className="text-2xl font-bold text-(--heading-colour)">
                {new Set(sortedListings.map((l) => l.fishType)).size}
              </span>
              <span className="text-sm text-(--text-colour)">Fish Types</span>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg)">
              <span className="text-2xl font-bold text-(--heading-colour)">
                {new Set(sortedListings.map((l) => l.state)).size}
              </span>
              <span className="text-sm text-(--text-colour)">States</span>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg)">
              <span className="text-2xl font-bold text-(--heading-colour)">
                {sortedListings.reduce((sum, l) => sum + Number(l.totalAvailableKg), 0).toLocaleString()}
                kg
              </span>
              <span className="text-sm text-(--text-colour)">Total Available</span>
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
                activeStates={activeStates}
              />
            </div>

            {/* Listings Grid */}
            <div className="lg:col-span-3">
              {(filters.state || filters.localGovernment || filters.ward) && (
                <div className="mb-(--gap-base) flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-(--border-gray) bg-(--white) px-(--space-lg) py-(--space-md)">
                  <p className="text-sm text-(--text-colour)">
                    Showing listings in{" "}
                    <span className="font-medium text-(--heading-colour)">
                      {[filters.ward, filters.localGovernment, filters.state].filter(Boolean).join(", ")}
                    </span>
                  </p>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        state: undefined,
                        localGovernment: undefined,
                        ward: undefined,
                      }))
                    }
                    className="text-sm font-medium text-(--theme-green-dark) transition hover:opacity-80"
                  >
                    Show all locations
                  </button>
                </div>
              )}
              {loading ? (
                <motion.div
                  variants={FADE_IN_VARIANT}
                  className="flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap)"
                >
                  <ShoppingBag size={48} className="text-(--text-colour)" />
                  <p className="text-(--text-colour)">Loading marketplace listings...</p>
                </motion.div>
              ) : errorMessage ? (
                <motion.div
                  variants={FADE_IN_VARIANT}
                  className="flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap)"
                >
                  <ShoppingBag size={48} className="text-(--text-colour)" />
                  <p className="text-(--error-red)">{errorMessage}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-full border border-(--border-gray) px-(--space-xl) py-(--space-md) text-(--heading-colour) transition hover:bg-(--gray-bg)"
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
                  className="flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap)"
                >
                  <ShoppingBag size={48} className="text-(--text-colour)" />
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                      No listings found
                    </h3>
                    <p className="text-(--text-colour)">
                      Try adjusting your filters to see more results
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="rounded-full bg-(--theme-green-dark) px-(--space-xl) py-(--space-md) text-white transition hover:opacity-90"
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
