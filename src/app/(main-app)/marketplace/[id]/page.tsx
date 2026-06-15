"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Truck,
  Package,
  Calendar,
  Building,
  ShoppingCart,
  Plus,
  Minus,
  Heart,
} from "lucide-react";
import type { MarketplaceListing, PackagingOption } from "~/types";
import {
  FADE_IN_VARIANT,
  SLIDE_UP_VARIANT,
  PROCESSED_FISH_TYPES,
  FISH_TYPE_LABELS,
  type FishType,
  type ProcessedFishType,
} from "~/types/constants";
import { apiFetch } from "~/lib/api";
import { useCart } from "~/components/marketplace/useCart";
import { usePlatformSettings } from "~/context/PlatformSettingsContext";
import { buyerService } from "~/lib/services/buyer.service";
import { useAuth } from "~/lib/auth-context";

type MarketplaceDetailResponse =
  | MarketplaceListing
  | { listing?: MarketplaceListing; data?: MarketplaceListing };

function extractListing(
  response: MarketplaceDetailResponse,
): MarketplaceListing | null {
  if ("id" in response) return response as MarketplaceListing;
  const r = response as {
    listing?: MarketplaceListing;
    data?: MarketplaceListing;
  };
  return r.listing ?? r.data ?? null;
}

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<string>("");
  const [isProcessed, setIsProcessed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cart = useCart();
  const { pricePerKg } = usePlatformSettings();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [savingListing, setSavingListing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadListing = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await apiFetch<MarketplaceDetailResponse>(
          `/marketplace/${listingId}`,
        );
        const payload = extractListing(response);

        if (payload && mounted) {
          const fishPricePerKg =
            pricePerKg[payload.fishType as FishType] ?? pricePerKg.table_size;
          setIsProcessed(
            PROCESSED_FISH_TYPES.includes(
              payload.fishType as ProcessedFishType,
            ),
          );
          setListing({
            ...payload,
            totalAvailableKg: Number(payload.totalAvailableKg),
            pricePerKg: Number(payload.pricePerKg) || fishPricePerKg,
            packaging: payload.packaging?.map((pkg) => ({
              ...pkg,
              weightKg: Number(pkg.weightKg),
              pricePerUnit:
                Number(pkg.pricePerUnit) ||
                Number(pkg.weightKg) * fishPricePerKg,
            })),
          });
          setSelectedDelivery(payload.deliveryOptions?.[0] ?? "");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load listing";
        if (mounted) {
          setErrorMessage(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (listingId) {
      loadListing();
    }

    return () => {
      mounted = false;
    };
  }, [listingId, pricePerKg]);

  const addToCart = (pkg: PackagingOption) => {
    if (!listing) return;
    cart.addToCart(listing, pkg, {
      variant: listing.fishType as FishType,
      processed: isProcessed,
    });
  };

  const handleSave = async () => {
    if (!listing) return;
    if (user?.role !== "buyer") {
      toast.info("Please log in as a buyer to save listings.");
      return;
    }
    setSavingListing(true);
    try {
      if (saved) {
        await buyerService.unsaveListing(listing.id);
        setSaved(false);
        toast.success("Removed from saved listings.");
      } else {
        await buyerService.saveListing(listing.id);
        setSaved(true);
        toast.success("Saved to your listings!");
      }
    } catch {
      toast.error("Could not update saved listings.");
    } finally {
      setSavingListing(false);
    }
  };

  const totalAmount = cart.subtotal;
  const totalWeight = cart.items.reduce(
    (sum, item) => sum + item.weightKg * item.quantity,
    0,
  );

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error("Please add items to cart");
      return;
    }
    router.push("/marketplace/checkout");
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-bg flex min-h-screen items-center justify-center">
        <p className="text-text-colour">Loading listing...</p>
      </div>
    );
  }

  if (errorMessage || !listing) {
    return (
      <div className="bg-gray-bg flex min-h-screen items-center justify-center">
        <p className="text-error-red">{errorMessage ?? "Listing not found"}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-bg min-h-screen">
      <div className="container-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-(--section-py-lg)">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="flex flex-col gap-(--section-gap)"
        >
          {/* Back Button */}
          <motion.button
            variants={FADE_IN_VARIANT}
            onClick={() => router.back()}
            className="text-text-colour hover:text-heading-colour flex w-fit items-center gap-2 transition"
          >
            <ArrowLeft size={20} />
            Back to Marketplace
          </motion.button>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-(--gap-lg) lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                variants={SLIDE_UP_VARIANT}
                className="flex flex-col gap-(--gap-lg) rounded-3xl bg-(--white) p-(--space-xl) shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col gap-(--gap-base)">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="font-ubuntu text-heading-colour text-3xl font-bold">
                      {listing.fishType}
                    </h1>
                    <button
                      onClick={handleSave}
                      disabled={savingListing}
                      aria-label={saved ? "Remove from saved" : "Save listing"}
                      className={`shrink-0 rounded-full border p-2.5 transition disabled:opacity-50 ${
                        saved
                          ? "border-red-200 bg-red-50 text-red-500"
                          : "border-gray-border text-text-colour hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      }`}
                    >
                      <Heart size={20} fill={saved ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="flex items-center gap-(--gap-base)">
                    <Building size={20} className="text-text-colour" />
                    <span className="font-roboto-slab text-text-colour text-lg">
                      {listing.businessName}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2">
                  <div className="flex items-center gap-(--gap-base)">
                    <Package size={20} className="text-text-colour" />
                    <div className="flex flex-col">
                      <span className="text-text-colour text-sm">
                        Available
                      </span>
                      <span className="font-roboto-slab text-heading-colour font-medium">
                        {listing.totalAvailableKg}kg
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-(--gap-base)">
                    <Calendar size={20} className="text-text-colour" />
                    <div className="flex flex-col">
                      <span className="text-text-colour text-sm">
                        Harvest Date
                      </span>
                      <span className="font-roboto-slab text-heading-colour font-medium">
                        {formatDate(listing.harvestDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-(--gap-base)">
                    <MapPin size={20} className="text-text-colour" />
                    <div className="flex flex-col">
                      <span className="text-text-colour text-sm">Location</span>
                      <span className="font-roboto-slab text-heading-colour font-medium">
                        {listing.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-(--gap-base)">
                    <Phone size={20} className="text-text-colour" />
                    <div className="flex flex-col">
                      <span className="text-text-colour text-sm">Contact</span>
                      <span className="font-roboto-slab text-heading-colour font-medium">
                        {listing.clusterFarmerContact}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Packaging Options */}
                <div className="flex flex-col gap-(--gap-base)">
                  <h3 className="font-ubuntu text-heading-colour text-xl font-bold">
                    Available Packages
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="border-gray-border flex items-center gap-2 rounded-2xl border p-(--space-md)">
                      <span className="text-text-colour text-sm">Type</span>
                      <span className="bg-theme-green-dark/10 text-theme-green-dark font-ubuntu rounded-full px-3 py-1 text-sm font-semibold capitalize">
                        {FISH_TYPE_LABELS[listing.fishType as FishType] ??
                          listing.fishType.replace("_", " ")}
                      </span>
                    </div>
                    <div className="border-gray-border flex items-center gap-2 rounded-2xl border p-(--space-md)">
                      <span className="text-text-colour text-sm">Category</span>
                      <span className="font-ubuntu bg-green-tint text-theme-green-dark rounded-full px-3 py-1 text-sm font-semibold">
                        {isProcessed ? "Processed" : "Live"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2">
                    {listing.packaging.map((pkg, index) => {
                      const cartItemIndex = cart.items.findIndex(
                        (item) =>
                          item.listingId === listing.id &&
                          item.weightKg === pkg.weightKg,
                      );
                      const cartItem =
                        cartItemIndex >= 0 ? cart.items[cartItemIndex] : null;

                      return (
                        <div
                          key={index}
                          className="border-gray-border flex flex-col gap-(--space-md) rounded-2xl border p-(--space-lg)"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-ubuntu text-heading-colour text-lg font-bold">
                              {pkg.weightKg}kg Package
                            </span>
                            <span className="font-ubuntu text-theme-green-dark text-lg font-bold">
                              ₦{(pkg.pricePerUnit ?? 0).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-text-colour text-sm">
                            {pkg.quantity} units available
                          </p>

                          {cartItem ? (
                            <div className="border-gray-border flex items-center justify-between rounded-full border p-1">
                              <button
                                onClick={() =>
                                  cart.updateQuantity(
                                    cartItemIndex,
                                    cartItem.quantity - 1,
                                  )
                                }
                                className="bg-gray-bg hover:bg-border-gray flex h-8 w-8 items-center justify-center rounded-full transition"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="font-roboto-slab font-medium">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  cart.updateQuantity(
                                    cartItemIndex,
                                    cartItem.quantity + 1,
                                  )
                                }
                                className="bg-gray-bg hover:bg-border-gray flex h-8 w-8 items-center justify-center rounded-full transition"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(pkg)}
                              className="bg-theme-green-dark flex h-10 items-center justify-center gap-2 rounded-full text-sm font-medium text-white transition hover:opacity-90"
                            >
                              <ShoppingCart size={16} />
                              Add to Cart
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="flex flex-col gap-(--gap-base)">
                  <h3 className="font-ubuntu text-heading-colour text-xl font-bold">
                    Delivery Options
                  </h3>
                  <div className="flex flex-col gap-(--space-md)">
                    {(listing.deliveryOptions ?? []).map((option, index) => (
                      <label
                        key={index}
                        className="border-gray-border hover:bg-gray-bg flex items-center gap-(--gap-base) rounded-2xl border p-(--space-lg) transition"
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={option}
                          checked={selectedDelivery === option}
                          onChange={(e) => setSelectedDelivery(e.target.value)}
                          className="h-5 w-5"
                        />
                        <div className="flex items-center gap-2">
                          <Truck size={18} className="text-text-colour" />
                          <span className="font-roboto-slab text-text-colour">
                            {option}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                variants={SLIDE_UP_VARIANT}
                className="sticky top-4 flex flex-col gap-(--gap-base) rounded-3xl bg-(--white) p-(--space-xl) shadow-sm"
              >
                <h3 className="font-ubuntu text-heading-colour text-xl font-bold">
                  Order Summary
                </h3>

                {cart.items.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-(--space-md)">
                      {cart.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-text-colour">
                            {item.weightKg}kg × {item.quantity} ({item.variant})
                          </span>
                          <span className="text-heading-colour font-medium">
                            ₦
                            {(
                              item.pricePerUnit * item.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-gray-border border-t pt-(--space-md)">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-colour">Total Weight:</span>
                        <span className="text-heading-colour font-medium">
                          {totalWeight}kg
                        </span>
                      </div>
                    </div>

                    <div className="border-gray-border border-t pt-(--space-md)">
                      <div className="flex justify-between">
                        <span className="font-ubuntu text-heading-colour text-lg font-bold">
                          Total:
                        </span>
                        <span className="font-ubuntu text-theme-green-dark text-lg font-bold">
                          ₦{totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="bg-theme-green-dark flex h-12 items-center justify-center gap-2 rounded-full text-white transition hover:opacity-90"
                    >
                      <ShoppingCart size={18} />
                      Proceed to Checkout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-(--gap-base) py-(--space-xl) text-center">
                    <ShoppingCart size={48} className="text-text-colour" />
                    <p className="text-text-colour text-sm">
                      Your cart is empty. Add packages to get started.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
