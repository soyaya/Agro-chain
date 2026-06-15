"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { apiFetch } from "~/lib/api";
import { LoadingState } from "~/components/ui/LoadingState";
import Link from "next/link";

interface MyListing {
  id: string;
  fishType: string;
  harvestDate: string;
  listedDate: string;
  totalFishAvailable: number;
  totalAvailableKg: number;
  packaging: { weightKg: number; quantity: number; pricePerUnit: number };
  status: "approved" | "pending" | "rejected";
  isApproved: boolean;
  createdAt: string;
}

interface ListingSummary {
  totalListings: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  totalSupply: number;
}

const STATUS_CONFIG = {
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-green-tint text-theme-green-dark border-gray-border",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

export default function ClusterMyListingsPage() {
  const [listings, setListings] = useState<MyListing[]>([]);
  const [summary, setSummary] = useState<ListingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiFetch<{
          status: string;
          data: { summary: ListingSummary; listings: MyListing[] };
        }>("/farmers/listings/get");
        if (mounted) {
          setListings(res.data.listings ?? []);
          setSummary(res.data.summary ?? null);
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load listings",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return <LoadingState message="Loading your listings..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div
        variants={SLIDE_UP_VARIANT}
        initial="hidden"
        animate="visible"
      >
        <h1 className="font-ubuntu text-heading-colour text-3xl font-bold">
          My Listings
        </h1>
        <p className="font-roboto-slab text-text-colour">
          Fish listings you created on the platform.
        </p>
      </motion.div>

      {/* Summary strip */}
      {summary && (
        <motion.div
          variants={SLIDE_UP_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { label: "Total", value: summary.totalListings },
            { label: "Approved", value: summary.approved },
            { label: "Pending", value: summary.pendingApproval },
            { label: "Rejected", value: summary.rejected },
          ].map((s) => (
            <div
              key={s.label}
              className="border-gray-border rounded-2xl border bg-(--white) p-4 shadow-sm"
            >
              <p className="font-ubuntu text-heading-colour text-2xl font-bold">
                {s.value}
              </p>
              <p className="font-roboto-slab text-text-colour text-xs">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {listings.length === 0 ? (
        <motion.div
          variants={SLIDE_UP_VARIANT}
          initial="hidden"
          animate="visible"
          className="border-gray-border flex flex-col items-center gap-3 rounded-2xl border bg-(--white) p-12 text-center shadow-sm"
        >
          <Package size={40} className="text-muted-text" />
          <p className="font-ubuntu text-heading-colour font-semibold">
            No listings yet
          </p>
          <p className="font-roboto-slab text-text-colour text-sm">
            Create your first listing to appear on the marketplace.
          </p>
          <Link
            href="/cluster-dashboard/listings/create"
            className="bg-theme-green-dark mt-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Create Listing
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {listings.map((listing) => {
            const cfg = STATUS_CONFIG[listing.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={listing.id}
                variants={SLIDE_UP_VARIANT}
                className="border-gray-border flex flex-col gap-4 rounded-2xl border bg-(--white) p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-ubuntu text-heading-colour text-base font-semibold capitalize">
                    {listing.fishType}
                  </h3>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
                  >
                    <StatusIcon size={12} />
                    {cfg.label}
                  </span>
                </div>

                <div className="text-text-colour flex flex-col gap-1.5 text-sm">
                  <div className="font-roboto-slab flex items-center gap-2">
                    <Package size={14} className="text-muted-text shrink-0" />
                    <span>
                      {listing.totalFishAvailable.toLocaleString()} fish ·{" "}
                      {listing.totalAvailableKg.toLocaleString()} kg total
                    </span>
                  </div>
                  <div className="font-roboto-slab flex items-center gap-2">
                    <Calendar size={14} className="text-muted-text shrink-0" />
                    <span>
                      Harvest:{" "}
                      {new Date(listing.harvestDate).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>

                <p className="font-roboto-slab text-muted-text mt-auto text-xs">
                  Listed{" "}
                  {new Date(listing.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
