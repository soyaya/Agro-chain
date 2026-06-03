"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Flag, Trash2, Search, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { adminService, type AdminListing } from "~/lib/services/admin.service";
import { FADE_IN_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  sold: "bg-blue-50 text-blue-700 border-blue-200",
  flagged: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-gray-50 text-gray-500 border-gray-200",
  draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
  archived: "bg-gray-50 text-gray-500 border-gray-200",
  deleted: "bg-red-50 text-red-400 border-red-100",
};

type StatusFilter = "all" | "pending" | "active" | "sold" | "flagged" | "expired";

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("pending");
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

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await adminService.approveListing(id);
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "active", clusterApproved: true } : l)),
      );
      toast.success("Listing approved and now live on the marketplace.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve listing");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await adminService.rejectListing(id);
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "flagged" } : l)));
      toast.success("Listing rejected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject listing");
    } finally {
      setActionLoading(null);
    }
  };

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

  const counts: Record<StatusFilter, number> = {
    all: listings.length,
    pending: listings.filter((l) => l.status === "pending").length,
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
          <h1 className="font-ubuntu text-heading-colour mb-2 text-3xl font-bold">
            Listing Oversight
          </h1>
          <p className="font-roboto-slab text-text-colour">
            Review pending listings and moderate the marketplace.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search fish type, farmer, state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="font-roboto-slab focus:border-gray-border border-input-border h-10 w-full rounded-xl border pr-4 pl-9 text-sm transition outline-none"
          />
        </div>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-(--gap-base) sm:grid-cols-6"
      >
        {(["all", "pending", "active", "sold", "flagged", "expired"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`flex flex-col gap-1 rounded-2xl border p-(--space-md) transition-all duration-200 ${
              filterStatus === status
                ? "border-theme-green-dark bg-green-50"
                : "border-gray-border hover:bg-pink-bg bg-(--white)"
            }`}
          >
            <span className="font-ubuntu text-heading-colour text-xl font-bold">
              {counts[status]}
            </span>
            <span className="font-roboto-slab text-text-colour text-xs capitalize">{status}</span>
          </button>
        ))}
      </motion.div>

      {/* Table */}
      {filtered.length > 0 ? (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="border-gray-border overflow-hidden rounded-2xl border bg-(--white) shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-gray-border bg-pink-bg border-b">
                <tr>
                  {[
                    "Fish Type",
                    "Qty / Kg",
                    "Price/kg",
                    "Farmer",
                    "Location",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="font-roboto-slab text-text-colour px-4 py-3 text-left text-xs font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border-gray divide-y">
                {filtered.map((listing) => (
                  <motion.tr
                    key={listing.id}
                    variants={FADE_IN_VARIANT}
                    className="hover:bg-pink-bg transition"
                  >
                    <td className="font-roboto-slab text-heading-colour px-4 py-3 text-sm font-medium capitalize">
                      {listing.fishType}
                    </td>
                    <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm">
                      {listing.quantityAvailable} fish
                      <br />
                      <span className="text-xs text-gray-400">{listing.totalAvailableKg} kg</span>
                    </td>
                    <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm">
                      ₦{Number(listing.pricePerKg).toLocaleString()}
                    </td>
                    <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm">
                      {listing.clusterFarmerName}
                    </td>
                    <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm">
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
                      <div className="flex items-center gap-2">
                        {listing.status === "pending" && (
                          <>
                            <button
                              onClick={() => void handleApprove(listing.id)}
                              disabled={actionLoading === listing.id}
                              className="font-roboto-slab flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                            >
                              <CheckCircle size={12} />
                              Approve
                            </button>
                            <button
                              onClick={() => void handleReject(listing.id)}
                              disabled={actionLoading === listing.id}
                              className="font-roboto-slab flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              <XCircle size={12} />
                              Reject
                            </button>
                          </>
                        )}
                        {listing.status === "active" && (
                          <button
                            onClick={() => void handleFlag(listing.id)}
                            disabled={actionLoading === listing.id}
                            className="font-roboto-slab flex items-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 px-2.5 py-1.5 text-xs font-medium text-yellow-700 transition hover:bg-yellow-100 disabled:opacity-50"
                          >
                            <Flag size={12} />
                            Flag
                          </button>
                        )}
                        <button
                          onClick={() => void handleRemove(listing.id)}
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
              : filterStatus === "pending"
                ? "No listings awaiting approval."
                : `No ${filterStatus === "all" ? "" : filterStatus} listings.`
          }
          size="lg"
        />
      )}
    </div>
  );
}
