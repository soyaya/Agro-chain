"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { ListingCard } from "~/components/listings/ListingCard";
import type { FarmerSupplyListing, ListingStatus } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { farmerService } from "~/lib/services/farmer.service";

export default function FarmerListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<FarmerSupplyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ListingStatus | "all">("all");

  useEffect(() => {
    let mounted = true;

    const loadListings = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await farmerService.getListings();
        if (!mounted) return;

        setListings(
          response.data.listings.map((item) => ({
            id: item.id,
            farmerId: "self",
            farmerName: "My Listing",
            fishType: item.fishType,
            harvestDate: new Date(item.harvestDate),
            totalAvailableKg: item.totalAvailableKg,
            packaging: [
              {
                weightKg: item.packaging.weightKg,
                quantity: item.packaging.quantity,
                pricePerUnit: 0,
              },
            ],
            status: item.status,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.createdAt),
          })),
        );
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error instanceof Error ? error.message : "Failed to load listings");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadListings();

    return () => {
      mounted = false;
    };
  }, []);

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

          {loading ? (
            <motion.div
              variants={FADE_IN_VARIANT}
              className="flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap)"
            >
              <p className="text-(--text-colour)">Loading listings...</p>
            </motion.div>
          ) : errorMessage ? (
            <motion.div
              variants={FADE_IN_VARIANT}
              className="flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap)"
            >
              <p className="text-(--error-red)">{errorMessage}</p>
            </motion.div>
          ) : filteredListings.length > 0 ? (
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
