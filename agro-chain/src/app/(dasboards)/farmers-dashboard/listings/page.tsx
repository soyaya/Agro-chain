"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { ListingCard } from "~/components/listings/ListingCard";
import type { FarmerSupplyListing, ListingStatus } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";

// Mock data - replace with actual API call
const mockListings: FarmerSupplyListing[] = [
  {
    id: "1",
    farmerId: "farmer-1",
    farmerName: "John Doe",
    fishType: "Catfish",
    harvestDate: new Date("2024-03-15"),
    totalAvailableKg: 2000,
    packaging: [
      { weightKg: 1, quantity: 1000, pricePerUnit: 1500 },
      { weightKg: 5, quantity: 200, pricePerUnit: 7000 },
    ],
    status: "pending",
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
  {
    id: "2",
    farmerId: "farmer-1",
    farmerName: "John Doe",
    fishType: "Tilapia",
    harvestDate: new Date("2024-03-01"),
    totalAvailableKg: 1500,
    packaging: [{ weightKg: 2, quantity: 750, pricePerUnit: 2800 }],
    status: "approved",
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-02-28"),
  },
  {
    id: "3",
    farmerId: "farmer-1",
    farmerName: "John Doe",
    fishType: "Catfish",
    harvestDate: new Date("2024-02-20"),
    totalAvailableKg: 1200,
    packaging: [{ weightKg: 3, quantity: 400, pricePerUnit: 4200 }],
    status: "rejected",
    rejectionReason: "Harvest date too old. Please submit fresh stock.",
    createdAt: new Date("2024-02-18"),
    updatedAt: new Date("2024-02-19"),
  },
];

export default function FarmerListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<FarmerSupplyListing[]>(mockListings);
  const [filterStatus, setFilterStatus] = useState<ListingStatus | "all">("all");

  const filteredListings =
    filterStatus === "all" ? listings : listings.filter((l) => l.status === filterStatus);

  const statusCounts = {
    all: listings.length,
    pending: listings.filter((l) => l.status === "pending").length,
    approved: listings.filter((l) => l.status === "approved").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-(--gray-bg)">
      <div className="container-max-width px-(--section-px) py-(--section-py) sm:px-(--section-px-sm) sm:py-(--section-py-sm) lg:px-(--section-px-lg) lg:py-(--section-py-lg)">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER_VARIANT}
          className="flex flex-col gap-(--section-gap)"
        >
          {/* Header */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="flex flex-col gap-(--gap-base) md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour) lg:text-4xl">
                My Listings
              </h1>
              <p className="mt-2 text-(--text-colour)">
                Manage your supply listings and track approval status
              </p>
            </div>

            <button
              onClick={() => router.push("/farmers-dashboard/listings/create")}
              className="flex items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) px-(--space-xl) py-(--space-md) text-white transition hover:opacity-90"
            >
              <Plus size={18} />
              Create Listing
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="grid grid-cols-2 gap-(--gap-base) md:grid-cols-4"
          >
            {(["all", "pending", "approved", "rejected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex flex-col gap-2 rounded-2xl border p-(--space-lg) transition ${
                  filterStatus === status
                    ? "border-(--theme-green-dark) bg-green-50"
                    : "border-(--border-gray) bg-(--white) hover:bg-(--gray-bg)"
                }`}
              >
                <span className="text-2xl font-bold text-(--heading-colour)">
                  {statusCounts[status]}
                </span>
                <span className="text-sm text-(--text-colour) capitalize">{status}</span>
              </button>
            ))}
          </motion.div>

          {/* Listings Grid */}
          {filteredListings.length > 0 ? (
            <motion.div
              variants={STAGGER_CONTAINER_VARIANT}
              className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => router.push(`/farmers-dashboard/listings/${listing.id}`)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={FADE_IN_VARIANT}
              className="flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap)"
            >
              <Filter size={48} className="text-(--text-colour)" />
              <div className="flex flex-col items-center gap-2 text-center">
                <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                  No listings found
                </h3>
                <p className="text-(--text-colour)">
                  {filterStatus === "all"
                    ? "Create your first supply listing to get started"
                    : `No ${filterStatus} listings at the moment`}
                </p>
              </div>
              {filterStatus === "all" && (
                <button
                  onClick={() => router.push("/farmers-dashboard/listings/create")}
                  className="flex items-center gap-2 rounded-full bg-(--theme-green-dark) px-(--space-xl) py-(--space-md) text-white transition hover:opacity-90"
                >
                  <Plus size={18} />
                  Create Listing
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
