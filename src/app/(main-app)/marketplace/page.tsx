"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Store, ShoppingBag, ArrowLeft, Sparkles } from "lucide-react";
import { MarketplaceCard } from "~/components/marketplace/MarketplaceCard";
import { MarketplaceFilters } from "~/components/marketplace/MarketplaceFilters";
import type {
  MarketplaceListing,
  MarketplaceFilters as Filters,
} from "~/types";
import {
  FADE_IN_VARIANT,
  STAGGER_CONTAINER_VARIANT,
  LIVE_FISH_TYPES,
  PROCESSED_FISH_TYPES,
  LIVE_FISH_TYPE_LABELS,
  PROCESSED_FISH_TYPE_LABELS,
  NIGERIAN_STATES,
  type FishType,
} from "~/types/constants";
import { apiFetch } from "~/lib/api";
import { useCart } from "~/components/marketplace/useCart";
import { CartDrawer } from "~/components/marketplace/CartDrawer";
import { usePlatformSettings } from "~/context/PlatformSettingsContext";
import { buyerService } from "~/lib/services/buyer.service";
import { useAuth } from "~/lib/auth-context";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";

type MarketplaceResponse = {
  status: string;
  data: {
    listings: MarketplaceListing[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};

// ============================================
// Inline Special Demand Form
// ============================================

const demandSchema = z.object({
  processingCategory: z.enum(["live", "processed"], {
    error: "Please select live or processed",
  }),
  fishType: z.string().min(1, "Fish type is required"),
  weightKg: z
    .number({ error: "Weight must be a number" })
    .positive("Weight must be greater than 0")
    .max(10000, "Cannot exceed 10,000 kg"),
  locationState: z.string().min(1, "State is required"),
  locationLga: z.string().min(1, "LGA is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  notes: z.string().max(500).optional(),
});

type DemandFormValues = z.infer<typeof demandSchema>;

function SpecialDemandForm({ onSuccess }: { onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<DemandFormValues>({
    resolver: zodResolver(demandSchema),
    mode: "onChange",
    defaultValues: {
      processingCategory: undefined,
      fishType: "",
      locationState: "",
      locationLga: "",
    },
  });

  const processingCategory = useWatch({ control, name: "processingCategory" });
  const fishType = useWatch({ control, name: "fishType" });
  const locationState = useWatch({ control, name: "locationState" });

  const categoryOptions = [
    { label: "Live Catfish", value: "live" },
    { label: "Processed Catfish", value: "processed" },
  ];

  const fishTypeOptions =
    processingCategory === "live"
      ? LIVE_FISH_TYPES.map((t) => ({
          label: LIVE_FISH_TYPE_LABELS[t],
          value: t,
        }))
      : processingCategory === "processed"
        ? PROCESSED_FISH_TYPES.map((t) => ({
            label: PROCESSED_FISH_TYPE_LABELS[t],
            value: t,
          }))
        : [];

  const stateOptions = NIGERIAN_STATES.map((s) => ({ label: s, value: s }));

  const onSubmit = async (data: DemandFormValues) => {
    if (!user) {
      toast.error("Please log in to place a demand");
      router.push("/login");
      return;
    }
    setSubmitting(true);
    try {
      await buyerService.createDemand({
        fishType: data.fishType,
        weightKg: data.weightKg,
        fishVariant: data.processingCategory,
        locationState: data.locationState,
        locationLga: data.locationLga,
        deliveryAddress: data.deliveryAddress,
        notes: data.notes,
      });
      toast.success(
        "Demand submitted! Admin will assign a cluster farmer shortly.",
      );
      onSuccess();
      router.push("/buyers-dashboard/demands");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit demand",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-(--gap-lg) pt-6"
    >
      {/* Category + Fish Type */}
      <div className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="font-roboto-slab text-heading-colour text-sm font-medium">
            Category <span className="text-red-500">*</span>
          </label>
          <SelectInput
            label=""
            value={processingCategory ?? ""}
            onValueChange={(v) => {
              setValue("processingCategory", v as "live" | "processed", {
                shouldValidate: true,
              });
              setValue("fishType", "", { shouldValidate: false });
            }}
            options={categoryOptions}
            required
          />
          {errors.processingCategory && (
            <p className="font-roboto-slab text-xs text-red-500">
              {errors.processingCategory.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-roboto-slab text-heading-colour text-sm font-medium">
            Fish Type <span className="text-red-500">*</span>
          </label>
          <SelectInput
            label=""
            value={fishType}
            onValueChange={(v) =>
              setValue("fishType", v, { shouldValidate: true })
            }
            options={
              fishTypeOptions.length
                ? fishTypeOptions
                : [{ label: "Select a category first", value: "" }]
            }
            required
          />
          {errors.fishType && (
            <p className="font-roboto-slab text-xs text-red-500">
              {errors.fishType.message}
            </p>
          )}
        </div>
      </div>

      {/* Weight */}
      <div className="flex flex-col gap-1.5">
        <DynamicInput
          label="Weight (kg)"
          placeholder="e.g. 0.5 for half a kg, 2 for 2kg"
          error={errors.weightKg?.message}
          {...register("weightKg", { valueAsNumber: true })}
          required
        />
        <p className="font-roboto-slab text-muted-text text-xs">
          No minimum — request any amount.
        </p>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="font-roboto-slab text-heading-colour text-sm font-medium">
            State <span className="text-red-500">*</span>
          </label>
          <SelectInput
            label=""
            value={locationState}
            onValueChange={(v) =>
              setValue("locationState", v, { shouldValidate: true })
            }
            options={[{ label: "Select state", value: "" }, ...stateOptions]}
            required
          />
          {errors.locationState && (
            <p className="font-roboto-slab text-xs text-red-500">
              {errors.locationState.message}
            </p>
          )}
        </div>
        <DynamicInput
          label="LGA"
          placeholder="e.g. Kaduna South"
          error={errors.locationLga?.message}
          {...register("locationLga")}
          required
        />
      </div>

      {/* Delivery Address */}
      <DynamicInput
        label="Delivery Address"
        placeholder="Full delivery address"
        error={errors.deliveryAddress?.message}
        {...register("deliveryAddress")}
        required
      />

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="font-roboto-slab text-heading-colour text-sm font-medium">
          Additional Notes{" "}
          <span className="text-muted-text font-normal">(optional)</span>
        </label>
        <textarea
          {...register("notes")}
          placeholder="Any specific requirements, preferred delivery time, etc."
          rows={3}
          className="font-roboto-slab focus:border-gray-border text-text-colour border-input-border w-full rounded-2xl border p-(--space-md) text-sm transition outline-none"
        />
        {errors.notes && (
          <p className="font-roboto-slab text-xs text-red-500">
            {errors.notes.message}
          </p>
        )}
      </div>

      <div className="mx-auto w-full max-w-sm">
        {isValid ? (
          <SubmitPrimaryButton loading={submitting} type="submit">
            Submit Demand
          </SubmitPrimaryButton>
        ) : (
          <SubmitSecondaryButton disabled type="button">
            Submit Demand
          </SubmitSecondaryButton>
        )}
      </div>
    </form>
  );
}

// ============================================
// Marketplace Page
// ============================================

export default function MarketplacePage() {
  const router = useRouter();
  const demandSectionRef = useRef<HTMLDivElement>(null);

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filters, setFilters] = useState<Filters>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [likedListings, setLikedListings] = useState<string[]>(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem("liked_listings")
          : null;
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [showDemandForm, setShowDemandForm] = useState(false);
  const cart = useCart();
  const { pricePerKg } = usePlatformSettings();
  const { user } = useAuth();

  // Support ?category= and #special-demand from landing page CTAs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category") as "live" | "processed" | null;
    if (cat === "live" || cat === "processed") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilters((prev) => ({ ...prev, category: cat }));
    }
    if (window.location.hash === "#special-demand") {
      setShowDemandForm(true);
      setTimeout(() => {
        demandSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
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
          totalAvailableKg: Number(listing.totalAvailableKg),
          pricePerKg:
            Number(listing.pricePerKg) ||
            (pricePerKg[listing.fishType as FishType] ?? pricePerKg.table_size),
          packaging: listing.packaging?.map((pkg) => ({
            ...pkg,
            weightKg: Number(pkg.weightKg),
            pricePerUnit:
              Number(pkg.pricePerUnit) ||
              Number(pkg.weightKg) *
                (pricePerKg[listing.fishType as FishType] ??
                  pricePerKg.table_size),
          })),
        }));

        if (mounted) setListings(normalized);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load listings";
        if (mounted) setErrorMessage(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadListings();

    return () => {
      mounted = false;
    };
  }, [pricePerKg]);

  const handleToggleLike = (listing: MarketplaceListing) => {
    const isLiked = likedListings.includes(listing.id);

    setLikedListings((prev) => {
      const newLikes = isLiked
        ? prev.filter((id) => id !== listing.id)
        : [...prev, listing.id];
      localStorage.setItem("liked_listings", JSON.stringify(newLikes));
      return newLikes;
    });

    if (user?.role === "buyer") {
      if (isLiked) {
        buyerService.unsaveListing(listing.id).catch(() => null);
      } else {
        buyerService
          .saveListing(listing.id)
          .then(() => toast.success("Saved to your listings!"))
          .catch(() => null);
      }
    } else if (!isLiked) {
      toast.success("Added to liked listings!");
    }
  };

  const handleAddToCart = (listing: MarketplaceListing) => {
    const defaultPkg = listing.packaging?.[0];
    if (!defaultPkg) {
      toast.error("No packages available for this listing");
      return;
    }
    cart.addToCart(listing, defaultPkg, {
      variant: "table_size",
      processed: false,
    });
    setCartOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({ sortBy: "date", sortOrder: "desc" });
  };

  // Category filter
  const LIVE_SET = new Set<string>(LIVE_FISH_TYPES);
  const PROCESSED_SET = new Set<string>(PROCESSED_FISH_TYPES);

  const filteredListings = listings.filter((listing) => {
    if (filters.category === "live" && !LIVE_SET.has(listing.fishType))
      return false;
    if (
      filters.category === "processed" &&
      !PROCESSED_SET.has(listing.fishType)
    )
      return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        listing.fishType.toLowerCase().includes(q) ||
        listing.businessName.toLowerCase().includes(q) ||
        listing.clusterFarmerName.toLowerCase().includes(q) ||
        listing.state.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.fishType && listing.fishType !== filters.fishType) return false;
    if (filters.state && listing.state !== filters.state) return false;
    if (filters.minPrice && listing.pricePerKg < filters.minPrice) return false;
    if (filters.maxPrice && listing.pricePerKg > filters.maxPrice) return false;
    if (filters.minQuantity && listing.totalAvailableKg < filters.minQuantity)
      return false;
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    const order = filters.sortOrder === "asc" ? 1 : -1;
    switch (filters.sortBy) {
      case "price":
        return (a.pricePerKg - b.pricePerKg) * order;
      case "quantity":
        return (a.totalAvailableKg - b.totalAvailableKg) * order;
      case "date":
      default:
        return (
          (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) *
          order
        );
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
              <Store size={28} className="text-theme-green-dark" />
              <div>
                <h1 className="font-ubuntu text-heading-colour text-3xl font-bold lg:text-4xl">
                  Fish Marketplace
                </h1>
                <p className="text-text-colour mt-1">
                  Browse fresh catfish — live or processed — from verified
                  cluster farmers
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
              <span className="text-text-colour text-sm">
                Available Listings
              </span>
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
                {sortedListings
                  .reduce((sum, l) => sum + l.totalAvailableKg, 0)
                  .toLocaleString()}
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
                  <p className="text-text-colour">
                    Loading marketplace listings...
                  </p>
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
                      Try adjusting your filters or place a special demand
                      below.
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

          {/* Special Demand Section */}
          <motion.div
            variants={FADE_IN_VARIANT}
            ref={demandSectionRef}
            id="special-demand"
          >
            <div className="border-gray-border rounded-3xl border-2 border-dashed bg-(--white) p-(--space-xl) shadow-sm">
              {/* Checkbox toggle row */}
              <label
                htmlFor="special-demand-checkbox"
                className="flex cursor-pointer items-start gap-4"
              >
                <input
                  id="special-demand-checkbox"
                  type="checkbox"
                  checked={showDemandForm}
                  onChange={(e) => setShowDemandForm(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded accent-green-700"
                />
                <div className="flex items-start gap-3">
                  <span className="bg-theme-green-dark/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <Sparkles size={20} className="text-theme-green-dark" />
                  </span>
                  <div>
                    <h3 className="font-ubuntu text-heading-colour text-lg font-bold">
                      I can&apos;t find what I need — place a special demand
                    </h3>
                    <p className="font-roboto-slab text-text-colour text-sm">
                      Submit a custom demand and admin will assign the right
                      cluster farmer to fulfill it.
                    </p>
                  </div>
                </div>
              </label>

              {/* Dropdown form */}
              <AnimatePresence>
                {showDemandForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <SpecialDemandForm
                      onSuccess={() => setShowDemandForm(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
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
