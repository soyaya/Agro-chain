"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Flag, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { adminService, type AdminListing } from "~/lib/services/admin.service";
import { FADE_IN_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

// === Status styles

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  sold: "bg-blue-50 text-blue-700 border-blue-200",
  flagged: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-gray-50 text-gray-500 border-gray-200",
  draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
  archived: "bg-gray-50 text-gray-500 border-gray-200",
  deleted: "bg-red-50 text-red-400 border-red-100",
};

type StatusFilter = "all" | "active" | "sold" | "flagged" | "expired";

// === Page

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await adminService.getListings();
        if (mounted) setListings(response.data.listings ?? []);
      } catch (error) {
        if (mounted)
          setErrorMessage(error instanceof Error ? error.message : "Failed to load listings");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFlag = async (id: string) => {
    setActionLoading(id);
    try {
      await adminService.flagListing(id);
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "flagged" } : l)));
      toast.success("Listing flagged.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to flag listing");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (id: string) => {
    setActionLoading(id);
    try {
      await adminService.removeListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Listing removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove listing");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = listings.filter((l) => {
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    const matchSearch =
      !search ||
      l.fishType.toLowerCase().includes(search.toLowerCase()) ||
      l.clusterFarmerName.toLowerCase().includes(search.toLowerCase()) ||
      l.locationState.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    sold: listings.filter((l) => l.status === "sold").length,
    flagged: listings.filter((l) => l.status === "flagged").length,
    expired: listings.filter((l) => l.status === "expired").length,
  };

  if (loading) return <LoadingState message="Loading listings..." size="lg" />;

  if (errorMessage) {
    return (
      <EmptyState
        icon={FileText}
        title="Unable to load listings"
        description={errorMessage}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
        size="lg"
      />
    );
  }

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
          <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">
            Listing Oversight
          </h1>
          <p className="font-roboto-slab text-(--text-colour)">
            Monitor and moderate all marketplace listings.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search fish type, farmer, state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="font-roboto-slab h-10 w-full rounded-xl border border-(--border-input) pr-4 pl-9 text-sm transition outline-none focus:border-(--border-gray)"
          />
        </div>
      </motion.div>

      {/* Status filter tabs */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-(--gap-base) sm:grid-cols-5"
      >
        {(["all", "active", "sold", "flagged", "expired"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`flex flex-col gap-1 rounded-2xl border p-(--space-md) transition-all duration-200 ${
              filterStatus === status
                ? "border-(--theme-green-dark) bg-green-50"
                : "border-(--border-gray) bg-(--white) hover:bg-(--bg-pink)"
            }`}
          >
            <span className="font-ubuntu text-xl font-bold text-(--heading-colour)">
              {counts[status]}
            </span>
            <span className="font-roboto-slab text-xs text-(--text-colour) capitalize">
              {status}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Table */}
      {filtered.length > 0 ? (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="overflow-hidden rounded-2xl border border-(--border-gray) bg-(--white) shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-(--border-gray) bg-(--bg-pink)">
                <tr>
                  {[
                    "Fish Type",
                    "Qty / Kg",
                    "Price/kg",
                    "Cluster Farmer",
                    "Location",
                    "Status",
                    "Approved",
                    "Listed",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="font-roboto-slab px-4 py-3 text-left text-xs font-semibold text-(--text-colour)"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-gray)">
                {filtered.map((listing) => (
                  <motion.tr
                    key={listing.id}
                    variants={FADE_IN_VARIANT}
                    className="transition hover:bg-(--bg-pink)"
                  >
                    <td className="font-roboto-slab px-4 py-3 text-sm font-medium text-(--heading-colour) capitalize">
                      {listing.fishType}
                    </td>
                    <td className="font-roboto-slab px-4 py-3 text-sm text-(--text-colour)">
                      {listing.quantityAvailable} fish
                      <br />
                      <span className="text-xs text-gray-400">{listing.totalAvailableKg} kg</span>
                    </td>
                    <td className="font-roboto-slab px-4 py-3 text-sm text-(--text-colour)">
                      ₦{Number(listing.pricePerKg).toLocaleString()}
                    </td>
                    <td className="font-roboto-slab px-4 py-3 text-sm text-(--text-colour)">
                      {listing.clusterFarmerName}
                    </td>
                    <td className="font-roboto-slab px-4 py-3 text-sm text-(--text-colour)">
                      {listing.locationLga}, {listing.locationState}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-roboto-slab rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[listing.status] ?? STATUS_STYLES.draft}`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-roboto-slab text-xs font-medium ${listing.clusterApproved ? "text-green-600" : "text-yellow-600"}`}
                      >
                        {listing.clusterApproved ? "Yes" : "Pending"}
                      </span>
                    </td>
                    <td className="font-roboto-slab px-4 py-3 text-xs text-gray-400">
                      {new Date(listing.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {listing.status !== "flagged" && (
                          <button
                            onClick={() => handleFlag(listing.id)}
                            disabled={actionLoading === listing.id}
                            className="font-roboto-slab flex items-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 px-2.5 py-1.5 text-xs font-medium text-yellow-700 transition hover:bg-yellow-100 disabled:opacity-50"
                          >
                            <Flag size={12} />
                            Flag
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(listing.id)}
                          disabled={actionLoading === listing.id}
                          className="font-roboto-slab flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No listings found"
          description={
            search
              ? "No listings match your search."
              : `No ${filterStatus === "all" ? "" : filterStatus} listings.`
          }
          size="lg"
        />
      )}
    </div>
  );
}
