"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Phone, Package, Building, ShoppingCart, Plus, Minus, Wheat } from "lucide-react";
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { feedService, type FeedListing } from "~/lib/services/feed.service";
import { useCart } from "~/components/marketplace/useCart";

export default function FeedListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const feedListingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [listing, setListing] = useState<FeedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cart = useCart();

  useEffect(() => {
    let mounted = true;

    const loadListing = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await feedService.getFeedListingById(feedListingId as string);
        if (mounted) setListing(response.data.listing);
      } catch (error) {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "Failed to load listing");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (feedListingId) loadListing();

    return () => {
      mounted = false;
    };
  }, [feedListingId]);

  const cartItemIndex = cart.items.findIndex(
    (item) => item.itemType === "feed" && item.feedListingId === feedListingId,
  );
  const cartItem = cartItemIndex >= 0 ? cart.items[cartItemIndex] : null;

  const handleAddToCart = () => {
    if (!listing) return;
    cart.addFeedToCart(listing, 1);
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error("Please add items to cart");
      return;
    }
    router.push("/marketplace/checkout");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--gray-bg)">
        <p className="text-(--text-colour)">Loading listing...</p>
      </div>
    );
  }

  if (errorMessage || !listing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--gray-bg)">
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
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
          className="flex flex-col gap-(--section-gap)"
        >
          <motion.button
            variants={FADE_IN_VARIANT}
            onClick={() => router.push("/marketplace?type=feed")}
            className="flex w-fit items-center gap-2 text-(--text-colour) transition hover:text-(--heading-colour)"
          >
            <ArrowLeft size={20} />
            Back to Feed Hub
          </motion.button>

          <div className="grid grid-cols-1 gap-(--gap-lg) lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2">
              <motion.div
                variants={SLIDE_UP_VARIANT}
                className="flex flex-col gap-(--gap-lg) rounded-3xl bg-(--white) p-(--space-xl) shadow-sm"
              >
                <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-(--gray-bg) sm:h-80">
                  {listing.imageUrl ? (
                    <Image
                      src={listing.imageUrl}
                      alt={listing.brandName}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Wheat size={56} className="text-(--text-colour) opacity-30" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-(--gap-base)">
                  <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">{listing.brandName}</h1>
                  <div className="flex items-center gap-(--gap-base)">
                    <Building size={20} className="text-(--text-colour)" />
                    <span className="font-roboto-slab text-lg text-(--text-colour)">
                      {listing.businessName ?? listing.clusterFarmerName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2">
                  <div className="flex items-center gap-(--gap-base)">
                    <Package size={20} className="text-(--text-colour)" />
                    <div className="flex flex-col">
                      <span className="text-sm text-(--text-colour)">Category</span>
                      <span className="font-roboto-slab font-medium text-(--heading-colour)">
                        {listing.categoryLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-(--gap-base)">
                    <Package size={20} className="text-(--text-colour)" />
                    <div className="flex flex-col">
                      <span className="text-sm text-(--text-colour)">Pellet size</span>
                      <span className="font-roboto-slab font-medium text-(--heading-colour)">
                        {listing.pelletSizeMm != null
                          ? `${listing.pelletSizeMm}mm`
                          : `${listing.minPelletSizeMm}–${listing.maxPelletSizeMm}mm (range)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-(--gap-base)">
                    <Wheat size={20} className="text-(--text-colour)" />
                    <div className="flex flex-col">
                      <span className="text-sm text-(--text-colour)">Pellet form</span>
                      <span className="font-roboto-slab font-medium text-(--heading-colour) capitalize">
                        {listing.pelletForm}
                        {listing.proteinPercent != null ? ` · ${listing.proteinPercent}% protein` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-(--gap-base)">
                    <MapPin size={20} className="text-(--text-colour)" />
                    <div className="flex flex-col">
                      <span className="text-sm text-(--text-colour)">Location</span>
                      <span className="font-roboto-slab font-medium text-(--heading-colour)">{listing.location}</span>
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

                {listing.description && (
                  <p className="text-(--text-colour)">{listing.description}</p>
                )}

                <div className="flex flex-col gap-(--space-md) rounded-2xl border border-(--border-gray) p-(--space-lg)">
                  <div className="flex items-center justify-between">
                    <span className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                      {listing.bagWeightKg}kg bag
                    </span>
                    <span className="font-ubuntu text-lg font-bold text-(--theme-green-dark)">
                      ₦{listing.pricePerBag.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-(--text-colour)">{listing.quantityAvailable} bags available</p>

                  {cartItem ? (
                    <div className="flex items-center justify-between rounded-full border border-(--border-gray) p-1">
                      <button
                        onClick={() => cart.updateQuantity(cartItemIndex, cartItem.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-(--gray-bg) transition hover:bg-(--border-gray)"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-roboto-slab font-medium">{cartItem.quantity}</span>
                      <button
                        onClick={() => cart.updateQuantity(cartItemIndex, cartItem.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-(--gray-bg) transition hover:bg-(--border-gray)"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="flex h-10 items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <motion.div
                variants={SLIDE_UP_VARIANT}
                className="sticky top-4 flex flex-col gap-(--gap-base) rounded-3xl bg-(--white) p-(--space-xl) shadow-sm"
              >
                <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">Order Summary</h3>

                {cart.items.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-(--space-md)">
                      {cart.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-(--text-colour)">
                            {item.itemType === "feed" ? item.brandName : item.fishType} × {item.quantity}
                          </span>
                          <span className="font-medium text-(--heading-colour)">
                            ₦{(item.pricePerUnit * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-(--border-gray) pt-(--space-md)">
                      <div className="flex justify-between">
                        <span className="font-ubuntu text-lg font-bold text-(--heading-colour)">Total:</span>
                        <span className="font-ubuntu text-lg font-bold text-(--theme-green-dark)">
                          ₦{cart.subtotal.toLocaleString()}
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
                    <p className="text-sm text-(--text-colour)">Your cart is empty. Add a bag to get started.</p>
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
