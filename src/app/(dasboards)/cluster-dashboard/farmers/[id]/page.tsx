"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Fish,
  TrendingUp,
  Building2,
  MapPinned,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { clusterService, type BackendFarmerDetail } from "~/lib/services/cluster.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

type ListingStatus = "approved" | "pending" | "rejected";

const STATUS_CONFIG: Record<ListingStatus, { icon: React.ReactNode; className: string; label: string }> = {
  approved: {
    icon: <CheckCircle2 size={14} />,
    className: "bg-green-50 text-green-700 border-green-200",
    label: "Approved",
  },
  pending: {
    icon: <AlertCircle size={14} />,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    label: "Pending",
  },
  rejected: {
    icon: <XCircle size={14} />,
    className: "bg-red-50 text-red-700 border-red-200",
    label: "Rejected",
  },
};

function statusConfig(status: string) {
  return STATUS_CONFIG[status as ListingStatus] ?? STATUS_CONFIG.pending;
}

export default function FarmerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [farmer, setFarmer] = useState<BackendFarmerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await clusterService.getFarmerById(id);
        if (mounted) setFarmer(res.data.farmer);
      } catch (err) {
        if (mounted)
          setError(err instanceof Error ? err.message : "Failed to load farmer profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <LoadingState message="Loading farmer profile..." size="lg" />;

  if (error || !farmer) {
    return (
      <EmptyState
        icon={User}
        title="Unable to load profile"
        description={error ?? "Farmer profile could not be found."}
        actionLabel="Back to Farmers"
        actionHref="/cluster-dashboard/farmers"
        size="lg"
      />
    );
  }

  const initials = farmer.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(farmer.memberSince);

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Back button + header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-(--gap-base)"
      >
        <button
          onClick={() => router.back()}
          className="font-roboto-slab text-text-colour hover:text-heading-colour flex w-fit items-center gap-2 text-sm transition"
        >
          <ArrowLeft size={18} />
          Back to Farmers
        </button>
        <div>
          <h1 className="font-ubuntu text-heading-colour text-3xl font-bold">Farmer Profile</h1>
          <p className="font-roboto-slab text-text-colour">
            Full profile details for this cluster farmer
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-(--gap-lg) lg:grid-cols-3"
      >
        {/* Left — avatar + quick stats */}
        <motion.div
          variants={FADE_IN_VARIANT}
          className="border-input-border flex flex-col items-center gap-(--space-lg) rounded-2xl border bg-(--white) p-(--space-xl) text-center shadow-sm"
        >
          <div className="font-ubuntu flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
            {initials}
          </div>
          <div>
            <h2 className="font-ubuntu text-heading-colour text-2xl font-bold">{farmer.fullName}</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-0.5 text-xs font-medium text-green-700">
              <Fish size={12} />
              Fish Farmer
            </span>
          </div>

          <div className="bg-gray-bg w-full rounded-2xl p-(--space-lg)">
            <div className="grid grid-cols-2 gap-(--gap-base)">
              {[
                { label: "Total Listings", value: farmer.stats.totalListings, color: "text-heading-colour" },
                { label: "Approved", value: farmer.stats.approvedListings, color: "text-green-600" },
                { label: "Pending", value: farmer.stats.pendingListings, color: "text-yellow-600" },
                { label: "Supply (kg)", value: farmer.stats.totalSupplyKg, color: "text-blue-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`font-ubuntu text-2xl font-bold ${color}`}>{value}</p>
                  <p className="font-roboto-slab text-text-colour text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full space-y-2 text-left">
            <div className="text-text-colour flex items-center gap-2 text-sm">
              <Calendar size={15} className="shrink-0 text-gray-400" />
              <span>
                Member since{" "}
                {memberSince.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right — details */}
        <motion.div
          variants={FADE_IN_VARIANT}
          className="flex flex-col gap-(--gap-lg) lg:col-span-2"
        >
          {/* Personal & Farm Info */}
          <div className="border-input-border rounded-2xl border bg-(--white) p-(--space-xl) shadow-sm">
            <h3 className="font-ubuntu text-heading-colour mb-(--space-lg) text-lg font-semibold">
              Farm & Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-(--space-lg) sm:grid-cols-2">
              {[
                { icon: <User size={16} />, label: "Full Name", value: farmer.fullName },
                { icon: <Phone size={16} />, label: "Phone", value: farmer.phoneNumber },
                { icon: <Mail size={16} />, label: "Email", value: farmer.email ?? "—" },
                { icon: <Building2 size={16} />, label: "Farm Name", value: farmer.farmName ?? "—" },
                { icon: <MapPinned size={16} />, label: "State", value: farmer.state },
                { icon: <MapPin size={16} />, label: "Local Government", value: farmer.localGovernment },
                {
                  icon: <Package size={16} />,
                  label: "Farming Capacity",
                  value: farmer.farmingCapacityKg != null
                    ? `${farmer.farmingCapacityKg.toLocaleString()} kg`
                    : "—",
                },
                {
                  icon: <TrendingUp size={16} />,
                  label: "Experience",
                  value: farmer.yearsOfExperience != null
                    ? `${farmer.yearsOfExperience} years`
                    : "—",
                },
                {
                  icon: <Clock size={16} />,
                  label: "Verification",
                  value: farmer.verificationStatus.charAt(0).toUpperCase() + farmer.verificationStatus.slice(1),
                },
              ].map(({ icon, label, value }) => (
                <div key={label}>
                  <p className="font-roboto-slab mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    {icon}
                    {label}
                  </p>
                  <p className="font-roboto-slab text-heading-colour text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Listings */}
          <div className="border-input-border rounded-2xl border bg-(--white) p-(--space-xl) shadow-sm">
            <h3 className="font-ubuntu text-heading-colour mb-(--space-lg) text-lg font-semibold">
              Recent Listings
            </h3>
            {farmer.recentListings.length > 0 ? (
              <div className="flex flex-col gap-(--space-md)">
                {farmer.recentListings.map((listing) => {
                  const cfg = statusConfig(listing.status);
                  return (
                    <div
                      key={listing.id}
                      className="border-gray-border flex items-center justify-between rounded-xl border p-(--space-md)"
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="font-roboto-slab text-heading-colour text-sm font-medium capitalize">
                          {listing.fishType} — {listing.totalAvailableKg.toLocaleString()} kg
                        </p>
                        <p className="font-roboto-slab text-text-colour text-xs">
                          {new Date(listing.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-roboto-slab text-text-colour text-sm">No listings yet.</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
