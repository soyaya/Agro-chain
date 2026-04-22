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
} from "lucide-react";
import type { MarketplaceListing, PackagingOption } from "~/types";
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT, BASE_PRICE_PER_KG_NAIRA, FISH_VARIANTS } from "~/types/constants";
import { apiFetch } from "~/lib/api";
import { useCart } from "~/components/marketplace/useCart";

type MarketplaceDetailResponse =
  | MarketplaceListing
  | { listing?: MarketplaceListing; data?: MarketplaceListing };

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState(FISH_VARIANTS[0]);
  const [processed, setProcessed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cart = useCart();

  useEffect(() => {
    let mounted = true;

    const loadListing = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await apiFetch<MarketplaceDetailResponse>(`/marketplace/${listingId}`);
        const payload =
          "id" in (response as MarketplaceListing)
            ? (response as MarketplaceListing)
            : response.listing ?? response.data ?? null;

        if (payload && mounted) {
          setListing({
            ...payload,
            pricePerKg: payload.pricePerKg ?? BASE_PRICE_PER_KG_NAIRA,
            packaging: payload.packaging?.map((pkg) => ({
              ...pkg,
              pricePerUnit: pkg.pricePerUnit ?? pkg.weightKg * BASE_PRICE_PER_KG_NAIRA,
            })),
          });
          setSelectedDelivery(payload.deliveryOptions?.[0] ?? "");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load listing";
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
  }, [listingId]);

  const addToCart = (pkg: PackagingOption) => {
    if (!listing) return;
    cart.addToCart(listing, pkg, { variant: selectedVariant, processed });
  };

  const totalAmount = cart.subtotal;
  const totalWeight = cart.items.reduce((sum, item) => sum + item.weightKg * item.quantity, 0);

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
      <div className="min-h-screen bg-(--gray-bg) flex items-center justify-center">
        <p className="text-(--text-colour)">Loading listing...</p>
      </div>
    );
  }

  if (errorMessage || !listing) {
    return (
      <div className="min-h-screen bg-(--gray-bg) flex items-center justify-center">
        <p className="text-(--error-red)">{errorMessage ?? "Listing not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--gray-bg)">
      <div className="container-max-width px-(--section-px) py-(--section-py) sm:px-(--section-px-sm) sm:py-(--section-py-sm) lg:px-(--section-px-lg) lg:py-(--section-py-lg)">
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
            className="flex w-fit items-center gap-2 text-(--text-colour) transition hover:text-(--heading-colour)"
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
                  <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">
                    {listing.fishType}
                  </h1>
                  <div className="flex items-center gap-(--gap-base)">
                    <Building size={20} className="text-(--text-colour)" />
                    <span className="font-roboto-slab text-lg text-(--text-colour)">
                      {listing.businessName}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2">
                  <div className="flex items-center gap-(--gap-base)">
                    <Package size={20} className="text-(--text-colour)" />
                    <div className="flex flex-col">
                      <span className="text-sm text-(--text-colour)">Available</span>
                      <span className="font-roboto-slab font-medium text-(--heading-colour)">
                        {listing.totalAvailableKg}kg
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-(--gap-base)">
                    <Calendar size={20} className="text-(--text-colour)" />
                    <div className="flex flex-col">
                      <span className="text-sm text-(--text-colour)">Harvest Date</span>
                      <span className="font-roboto-slab font-medium text-(--heading-colour)">
                        {formatDate(listing.harvestDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-(--gap-base)">
                    <MapPin size={20} className="text-(--text-colour)" />
                    <div className="flex flex-col">
                      <span className="text-sm text-(--text-colour)">Location</span>
                      <span className="font-roboto-slab font-medium text-(--heading-colour)">
                        {listing.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-(--gap-base)">
                    <Phone size={20} className="text-(--text-colour)" />
                    <div className="flex flex-col">
                      <span className="text-sm text-(--text-colour)">Contact</span>
                      <span className="font-roboto-slab font-medium text-(--heading-colour)">
                        {listing.clusterFarmerContact}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Packaging Options */}
                <div className="flex flex-col gap-(--gap-base)">
                  <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                    Available Packages
                  </h3>
                  <div className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2">
                    <div className="flex flex-col gap-2 rounded-2xl border border-(--border-gray) p-(--space-md)">
                      <span className="text-sm font-medium text-(--heading-colour)">
                        Choose Fish Type
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {FISH_VARIANTS.map((variant) => (
                          <button
                            key={variant}
                            onClick={() => setSelectedVariant(variant)}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                              selectedVariant === variant
                                ? "bg-(--theme-green-dark) text-white"
                                : "border border-(--border-gray) text-(--text-colour) hover:bg-(--gray-bg)"
                            }`}
                          >
                            {variant}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded-2xl border border-(--border-gray) p-(--space-md)">
                      <span className="text-sm font-medium text-(--heading-colour)">
                        Processing Preference
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setProcessed(false)}
                          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${
                            !processed
                              ? "bg-(--theme-green-dark) text-white"
                              : "border border-(--border-gray) text-(--text-colour) hover:bg-(--gray-bg)"
                          }`}
                        >
                          Unprocessed
                        </button>
                        <button
                          onClick={() => setProcessed(true)}
                          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${
                            processed
                              ? "bg-(--theme-green-dark) text-white"
                              : "border border-(--border-gray) text-(--text-colour) hover:bg-(--gray-bg)"
                          }`}
                        >
                          Processed
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2">
                    {listing.packaging.map((pkg, index) => {
                      const cartItemIndex = cart.items.findIndex(
                        (item) =>
                          item.weightKg === pkg.weightKg &&
                          item.variant === selectedVariant &&
                          item.processed === processed,
                      );
                      const cartItem = cartItemIndex >= 0 ? cart.items[cartItemIndex] : null;

                      return (
                        <div
                          key={index}
                          className="flex flex-col gap-(--space-md) rounded-2xl border border-(--border-gray) p-(--space-lg)"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                              {pkg.weightKg}kg Package
                            </span>
                            <span className="font-ubuntu text-lg font-bold text-(--theme-green-dark)">
                              ₦{pkg.pricePerUnit.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-(--text-colour)">
                            {pkg.quantity} units available
                          </p>

                          {cartItem ? (
                            <div className="flex items-center justify-between rounded-full border border-(--border-gray) p-1">
                              <button
                                onClick={() => cart.updateQuantity(cartItemIndex, cartItem.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-(--gray-bg) transition hover:bg-(--border-gray)"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="font-roboto-slab font-medium">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => cart.updateQuantity(cartItemIndex, cartItem.quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-(--gray-bg) transition hover:bg-(--border-gray)"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(pkg)}
                              className="flex h-10 items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90"
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
                  <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                    Delivery Options
                  </h3>
                  <div className="flex flex-col gap-(--space-md)">
                    {(listing.deliveryOptions ?? []).map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-(--gap-base) rounded-2xl border border-(--border-gray) p-(--space-lg) transition hover:bg-(--gray-bg)"
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
                          <Truck size={18} className="text-(--text-colour)" />
                          <span className="font-roboto-slab text-(--text-colour)">{option}</span>
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
                <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                  Order Summary
                </h3>

                {cart.items.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-(--space-md)">
                      {cart.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-(--text-colour)">
                            {item.weightKg}kg × {item.quantity} ({item.variant})
                          </span>
                          <span className="font-medium text-(--heading-colour)">
                            ₦{(item.pricePerUnit * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-(--border-gray) pt-(--space-md)">
                      <div className="flex justify-between text-sm">
                        <span className="text-(--text-colour)">Total Weight:</span>
                        <span className="font-medium text-(--heading-colour)">{totalWeight}kg</span>
                      </div>
                    </div>

                    <div className="border-t border-(--border-gray) pt-(--space-md)">
                      <div className="flex justify-between">
                        <span className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                          Total:
                        </span>
                        <span className="font-ubuntu text-lg font-bold text-(--theme-green-dark)">
                          ₦{totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="flex h-12 items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) text-white transition hover:opacity-90"
                    >
                      <ShoppingCart size={18} />
                      Proceed to Checkout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-(--gap-base) py-(--space-xl) text-center">
                    <ShoppingCart size={48} className="text-(--text-colour)" />
                    <p className="text-sm text-(--text-colour)">
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
