"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

// Mock data - replace with actual API call
const mockListing: MarketplaceListing = {
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
    { weightKg: 10, quantity: 100, pricePerUnit: 13500 },
  ],
  location: "Kaduna North, Kaduna",
  state: "Kaduna",
  localGovernment: "Kaduna North",
  pricePerKg: 1500,
  deliveryOptions: ["Pickup from warehouse", "Delivery within state", "Express delivery"],
  visibleOnMarketplace: true,
  status: "approved",
  clusterFarmerContact: "08012345678",
  warehouseLocation: "123 Farm Road, Kaduna",
  logisticsAvailable: true,
  createdAt: new Date("2024-03-10"),
  updatedAt: new Date("2024-03-10"),
};

interface CartItem {
  packaging: PackagingOption;
  quantity: number;
}

export default function ListingDetailPage() {
  const router = useRouter();
  const [listing] = useState<MarketplaceListing>(mockListing);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<string>(listing.deliveryOptions[0]);

  const addToCart = (pkg: PackagingOption) => {
    const existingItem = cart.find((item) => item.packaging.weightKg === pkg.weightKg);

    if (existingItem) {
      if (existingItem.quantity >= pkg.quantity) {
        toast.error("Maximum quantity reached for this package");
        return;
      }
      setCart(
        cart.map((item) =>
          item.packaging.weightKg === pkg.weightKg
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { packaging: pkg, quantity: 1 }]);
    }
    toast.success("Added to cart");
  };

  const updateQuantity = (pkg: PackagingOption, delta: number) => {
    const existingItem = cart.find((item) => item.packaging.weightKg === pkg.weightKg);
    if (!existingItem) return;

    const newQuantity = existingItem.quantity + delta;

    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.packaging.weightKg !== pkg.weightKg));
      return;
    }

    if (newQuantity > pkg.quantity) {
      toast.error("Maximum quantity reached");
      return;
    }

    setCart(
      cart.map((item) =>
        item.packaging.weightKg === pkg.weightKg ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.packaging.pricePerUnit * item.quantity,
    0,
  );

  const totalWeight = cart.reduce((sum, item) => sum + item.packaging.weightKg * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Please add items to cart");
      return;
    }
    toast.success("Proceeding to checkout...");
    // TODO: Navigate to checkout page
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
                    {listing.packaging.map((pkg, index) => {
                      const cartItem = cart.find(
                        (item) => item.packaging.weightKg === pkg.weightKg,
                      );

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
                                onClick={() => updateQuantity(pkg, -1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-(--gray-bg) transition hover:bg-(--border-gray)"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="font-roboto-slab font-medium">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(pkg, 1)}
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
                    {listing.deliveryOptions.map((option, index) => (
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

                {cart.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-(--space-md)">
                      {cart.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-(--text-colour)">
                            {item.packaging.weightKg}kg × {item.quantity}
                          </span>
                          <span className="font-medium text-(--heading-colour)">
                            ₦{(item.packaging.pricePerUnit * item.quantity).toLocaleString()}
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
