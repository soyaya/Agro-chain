"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, MapPin, Package, Truck, Eye, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ClusterFarmerListing, ListingStatus } from "~/types/index";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { clusterService } from "~/lib/services/cluster.service";

const STATUS_STYLES: Record<ListingStatus, string> = {
  approved: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function ClusterListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<ClusterFarmerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ListingStatus | "all">("all");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await clusterService.getListings();
        if (!mounted) return;
        setListings(
          response.data.listings.map((item) => ({
            id: item.id,
            clusterFarmerId: "self",
            clusterFarmerName: "Cluster",
            businessName: "Cluster Listing",
            fishType: item.fishType,
            harvestDate: new Date(item.harvestDate),
            totalAvailableKg: item.totalFishAvailable,
            packaging: [
              {
                weightKg: item.packaging.weightKg,
                quantity: item.packaging.quantity,
                pricePerUnit: 0,
              },
            ],
            location: item.location,
            state: item.location.split(", ")[1] ?? "",
            localGovernment: item.location.split(", ")[0] ?? "",
            pricePerKg: 0,
            deliveryOptions: ["Pickup"],
            visibleOnMarketplace: item.status === "approved",
            status: item.status,
            createdAt: new Date(item.listedDate),
            updatedAt: new Date(item.listedDate),
          })),
        );
      } catch (error) {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "Failed to load listings");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = filterStatus === "all" ? listings : listings.filter((l) => l.status === filterStatus);

  const counts = {
    all: listings.length,
    pending: listings.filter((l) => l.status === "pending").length,
    approved: listings.filter((l) => l.status === "approved").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
  };

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">My Listings</h1>
          <p className="font-roboto-slab text-(--text-colour)">
            Manage your marketplace listings and track approval status
          </p>
        </div>
        <button
          onClick={() => router.push("/cluster-dashboard/listings/create")}
          className="flex items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) px-(--space-xl) py-(--space-md) font-roboto-slab text-white cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90"
        >
          <Plus size={18} />
          Create Listing
        </button>
      </motion.div>

      {/* Status Filter Tabs */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-(--gap-base) md:grid-cols-4"
      >
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`flex flex-col gap-2 rounded-2xl border p-(--space-lg) cursor-pointer ease-in-out transition-all duration-300 ${
              filterStatus === status
                ? "border-(--theme-green-dark) bg-green-50"
                : "border-(--border-gray) bg-(--white) hover:bg-(--bg-pink)"
            }`}
          >
            <span className="font-ubuntu text-2xl font-bold text-(--heading-colour)">{counts[status]}</span>
            <span className="font-roboto-slab text-sm capitalize text-(--text-colour)">{status}</span>
          </button>
        ))}
      </motion.div>

      {loading ? (
        <motion.div variants={FADE_IN_VARIANT} initial="hidden" animate="visible" className="rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap) text-center text-(--text-colour)">
          Loading listings...
        </motion.div>
      ) : errorMessage ? (
        <motion.div variants={FADE_IN_VARIANT} initial="hidden" animate="visible" className="rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap) text-center text-(--error-red)">
          {errorMessage}
        </motion.div>
      ) : filtered.length > 0 ? (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((listing) => (
            <motion.div
              key={listing.id}
              variants={FADE_IN_VARIANT}
              className="flex flex-col gap-4 rounded-3xl border border-(--border-gray) bg-(--white) p-6 shadow-sm cursor-default ease-in-out transition-all duration-300 hover:shadow-md hover:scale-105"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">{listing.fishType}</h3>
                  <p className="font-roboto-slab text-sm text-(--text-colour)">{listing.businessName}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[listing.status]}`}>
                  {listing.status}
                </span>
              </div>

              <div className="h-px w-full bg-gray-100" />

              {/* Details */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-sm text-(--text-colour)">
                  <Package size={15} className="shrink-0 text-gray-400" />
                  <span>{listing.totalAvailableKg.toLocaleString()} kg available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-(--text-colour)">
                  <MapPin size={15} className="shrink-0 text-gray-400" />
                  <span>{listing.localGovernment}, {listing.state}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-(--text-colour)">
                  <Calendar size={15} className="shrink-0 text-gray-400" />
                  <span>Harvest: {listing.harvestDate.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-(--text-colour)">
                  <Truck size={15} className="shrink-0 text-gray-400" />
                  <span>{listing.deliveryOptions.join(", ")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-(--bg-pink) px-4 py-2.5">
                <span className="text-xs font-medium text-(--text-colour)">Marketplace Status</span>
                <span
                  className={`text-xs font-medium ${
                    listing.visibleOnMarketplace ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {listing.visibleOnMarketplace ? "● Live on marketplace" : "○ Not listed"}
                </span>
              </div>

              {/* Action */}
              <button
                onClick={() => router.push(`/cluster-dashboard/listings/${listing.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--border-gray) py-2.5 font-roboto-slab text-sm font-semibold text-(--heading-colour) cursor-pointer ease-in-out transition-all duration-300 hover:bg-(--bg-pink)"
              >
                <Eye size={16} />
                View Details
              </button>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap)"
        >
          <Filter size={48} className="text-(--text-colour)" />
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">No listings found</h3>
            <p className="font-roboto-slab text-(--text-colour)">
              {filterStatus === "all"
                ? "Create your first marketplace listing to get started"
                : `No ${filterStatus} listings at the moment`}
            </p>
          </div>
          {filterStatus === "all" && (
            <button
              onClick={() => router.push("/cluster-dashboard/listings/create")}
              className="flex items-center gap-2 rounded-full bg-(--theme-green-dark) px-(--space-xl) py-(--space-md) font-roboto-slab text-white cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90"
            >
              <Plus size={18} />
              Create Listing
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
