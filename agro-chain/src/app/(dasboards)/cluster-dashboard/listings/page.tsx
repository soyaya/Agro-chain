"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, MapPin, Package, Truck, Eye, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ClusterFarmerListing, ListingStatus } from "~/types/index";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";

// Mock data - TODO: Replace with actual API call
const mockListings: ClusterFarmerListing[] = [
  {
    id: "cl-1",
    clusterFarmerId: "cluster-1",
    clusterFarmerName: "Emeka Okonkwo",
    businessName: "Okonkwo Fish Distributors Ltd",
    originalFarmerListingId: "farmer-listing-1",
    fishType: "Catfish",
    harvestDate: new Date("2026-03-10"),
    totalAvailableKg: 8000,
    packaging: [
      { weightKg: 1, quantity: 4000, pricePerUnit: 1800 },
      { weightKg: 5, quantity: 800, pricePerUnit: 8500 },
    ],
    location: "Km 5, Sagamu-Ore Expressway",
    state: "Ogun",
    localGovernment: "Ijebu Ode",
    pricePerKg: 1800,
    deliveryOptions: ["Pickup", "Local Delivery"],
    visibleOnMarketplace: true,
    status: "approved",
    createdAt: new Date("2026-03-05"),
    updatedAt: new Date("2026-03-06"),
  },
  {
    id: "cl-2",
    clusterFarmerId: "cluster-1",
    clusterFarmerName: "Emeka Okonkwo",
    businessName: "Okonkwo Fish Distributors Ltd",
    fishType: "Tilapia",
    harvestDate: new Date("2026-03-20"),
    totalAvailableKg: 5000,
    packaging: [
      { weightKg: 2, quantity: 1500, pricePerUnit: 3200 },
    ],
    location: "Km 5, Sagamu-Ore Expressway",
    state: "Ogun",
    localGovernment: "Ijebu Ode",
    pricePerKg: 1600,
    deliveryOptions: ["Pickup", "Local Delivery", "Interstate Delivery"],
    visibleOnMarketplace: false,
    status: "pending",
    createdAt: new Date("2026-03-12"),
    updatedAt: new Date("2026-03-12"),
  },
  {
    id: "cl-3",
    clusterFarmerId: "cluster-1",
    clusterFarmerName: "Emeka Okonkwo",
    businessName: "Okonkwo Fish Distributors Ltd",
    fishType: "Mackerel",
    harvestDate: new Date("2026-02-28"),
    totalAvailableKg: 3000,
    packaging: [
      { weightKg: 3, quantity: 600, pricePerUnit: 4500 },
    ],
    location: "Km 5, Sagamu-Ore Expressway",
    state: "Ogun",
    localGovernment: "Ijebu Ode",
    pricePerKg: 1500,
    deliveryOptions: ["Pickup"],
    visibleOnMarketplace: false,
    status: "rejected",
    createdAt: new Date("2026-02-25"),
    updatedAt: new Date("2026-02-26"),
  },
];

const STATUS_STYLES: Record<ListingStatus, string> = {
  approved: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function ClusterListingsPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<ListingStatus | "all">("all");

  const filtered = filterStatus === "all" ? mockListings : mockListings.filter((l) => l.status === filterStatus);

  const counts = {
    all: mockListings.length,
    pending: mockListings.filter((l) => l.status === "pending").length,
    approved: mockListings.filter((l) => l.status === "approved").length,
    rejected: mockListings.filter((l) => l.status === "rejected").length,
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

      {/* Listings Grid */}
      {filtered.length > 0 ? (
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

              {/* Price + Marketplace badge */}
              <div className="flex items-center justify-between rounded-xl bg-(--bg-pink) px-4 py-2.5">
                <span className="font-ubuntu text-lg font-bold text-(--theme-green-dark)">
                  ₦{listing.pricePerKg.toLocaleString()}/kg
                </span>
                <span className={`text-xs font-medium ${listing.visibleOnMarketplace ? "text-green-600" : "text-gray-400"}`}>
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
