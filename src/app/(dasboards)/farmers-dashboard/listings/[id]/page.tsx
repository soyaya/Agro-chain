"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT, STATUS_COLORS } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";
import { farmerService, type FarmerListingDetail, type FarmerListingOrder } from "~/lib/services/farmer.service";

export default function FarmerListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [listing, setListing] = useState<FarmerListingDetail | null>(null);
  const [orders, setOrders] = useState<FarmerListingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await farmerService.getListing(listingId);
        if (mounted) {
          setListing(res.data.listing);
          setOrders(res.data.orders);
        }
      } catch (error) {
        if (mounted) toast.error(error instanceof Error ? error.message : "Failed to load listing");
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "Failed to load listing");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [listingId]);

  if (loading) return <LoadingState message="Loading listing..." size="lg" />;

  if (errorMessage || !listing) {
    return (
      <EmptyState
        icon={Package}
        title="Unable to load listing"
        description={errorMessage ?? "Listing not found."}
        actionLabel="Back to Listings"
        actionHref="/farmers-dashboard/listings"
        size="lg"
      />
    );
  }

  const soldPercent =
    listing.quantityAvailable + listing.quantitySold > 0
      ? Math.round((listing.quantitySold / (listing.quantityAvailable + listing.quantitySold)) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push("/farmers-dashboard/listings")}
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Listings
          </button>
          <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour) capitalize">
            {listing.fishType.replace(/_/g, " ")}
          </h1>
        </div>
        <span className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${STATUS_COLORS[listing.status]}`}>
          {listing.status}
        </span>
      </motion.div>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Orders from this listing — the real relational view */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 flex items-center gap-2 text-xl font-bold text-(--heading-colour)">
              <ShoppingBag size={20} />
              Orders From This Listing
            </h2>
            {orders.length === 0 ? (
              <p className="font-roboto-slab text-sm text-(--text-colour)">
                No orders have been placed against this listing yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-roboto-slab font-semibold text-(--heading-colour)">
                        {order.orderNumber} • {order.buyerName}
                      </p>
                      <p className="font-roboto-slab text-sm text-(--text-colour) capitalize">
                        {order.quantity} unit(s) • {order.fulfillmentMethod} •{" "}
                        {order.fulfillmentStage.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-roboto-slab font-bold text-(--heading-colour)">
                        ₦{Number(order.grandTotal).toLocaleString()}
                      </p>
                      <p className="font-roboto-slab text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-(--heading-colour)">Listing Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Price</p>
                <p className="font-roboto-slab font-medium text-(--heading-colour)">
                  ₦{Number(listing.pricePerKg).toLocaleString()} per unit
                </p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Available</p>
                <p className="font-roboto-slab font-medium text-(--heading-colour)">
                  {listing.quantityAvailable.toLocaleString()} units
                </p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Sold</p>
                <p className="font-roboto-slab font-medium text-(--heading-colour)">
                  {listing.quantitySold.toLocaleString()} units ({soldPercent}%)
                </p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Harvest Date</p>
                <p className="font-roboto-slab font-medium text-(--heading-colour)">
                  {new Date(listing.harvestDate).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </motion.div>

          {listing.status === "rejected" && listing.rejectionReason && (
            <motion.div
              variants={FADE_IN_VARIANT}
              className="rounded-2xl bg-red-50 p-6"
            >
              <p className="text-sm text-(--error-red)">
                <span className="font-medium">Rejection reason: </span>
                {listing.rejectionReason}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
