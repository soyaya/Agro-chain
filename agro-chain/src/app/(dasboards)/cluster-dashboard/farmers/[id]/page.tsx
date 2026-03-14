"use client";

import { use } from "react";
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
import type { FarmerProfile, ListingStatus } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";

type FarmerWithStats = FarmerProfile & {
  totalListings: number;
  approvedListings: number;
  pendingListings: number;
  rejectedListings: number;
  lastActive: Date;
  memberSince: Date;
  recentListings: RecentListing[];
};

type RecentListing = {
  id: string;
  fishType: string;
  totalAvailableKg: number;
  status: ListingStatus;
  createdAt: Date;
};

// Mock data — replace with API call using params.id
const mockFarmerData: Record<string, FarmerWithStats> = {
  "farmer-1": {
    id: "farmer-1",
    userId: "user-1",
    fullName: "Adebayo Johnson",
    farmName: "Sunrise Fisheries",
    farmAddress: "12 Fishpond Road, Epe",
    state: "Lagos",
    localGovernment: "Epe",
    phoneNumber: "08012345678",
    email: "adebayo.johnson@example.com",
    occupation: "Farmer",
    fishType: "Catfish",
    farmingCapacityKg: 5000,
    yearsOfExperience: 7,
    isClusterFarmer: false,
    profileImage: undefined,
    totalListings: 12,
    approvedListings: 9,
    pendingListings: 2,
    rejectedListings: 1,
    lastActive: new Date("2026-03-10"),
    memberSince: new Date("2024-06-01"),
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2026-03-10"),
    recentListings: [
      { id: "l-1", fishType: "Catfish", totalAvailableKg: 2000, status: "approved", createdAt: new Date("2026-03-05") },
      { id: "l-2", fishType: "Catfish", totalAvailableKg: 1500, status: "pending", createdAt: new Date("2026-03-10") },
      { id: "l-3", fishType: "Catfish", totalAvailableKg: 1000, status: "rejected", createdAt: new Date("2026-02-20") },
    ],
  },
};

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

export default function FarmerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // TODO: Replace with actual API call using `id`
  const farmer = mockFarmerData[id] ?? mockFarmerData["farmer-1"];

  const initials = farmer.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
          className="flex w-fit items-center gap-2 font-roboto-slab text-sm text-(--text-colour) transition hover:text-(--heading-colour)"
        >
          <ArrowLeft size={18} />
          Back to Farmers
        </button>
        <div>
          <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Farmer Profile</h1>
          <p className="font-roboto-slab text-(--text-colour)">Full profile details for this cluster farmer</p>
        </div>
      </motion.div>

      {/* Profile card */}
      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-(--gap-lg) lg:grid-cols-3"
      >
        {/* Left — avatar + quick stats */}
        <motion.div
          variants={FADE_IN_VARIANT}
          className="flex flex-col items-center gap-(--space-lg) rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 font-ubuntu text-3xl font-bold text-green-700">
            {initials}
          </div>
          <div>
            <h2 className="font-ubuntu text-2xl font-bold text-(--heading-colour)">{farmer.fullName}</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-0.5 text-xs font-medium text-green-700">
              <Fish size={12} />
              {farmer.fishType} Farmer
            </span>
          </div>

          <div className="w-full rounded-2xl bg-(--gray-bg) p-(--space-lg)">
            <div className="grid grid-cols-2 gap-(--gap-base)">
              {[
                { label: "Total Listings", value: farmer.totalListings, color: "text-(--heading-colour)" },
                { label: "Approved", value: farmer.approvedListings, color: "text-green-600" },
                { label: "Pending", value: farmer.pendingListings, color: "text-yellow-600" },
                { label: "Rejected", value: farmer.rejectedListings, color: "text-red-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`font-ubuntu text-2xl font-bold ${color}`}>{value}</p>
                  <p className="font-roboto-slab text-xs text-(--text-colour)">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm text-(--text-colour)">
              <Calendar size={15} className="shrink-0 text-gray-400" />
              <span>Member since {farmer.memberSince.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-(--text-colour)">
              <Clock size={15} className="shrink-0 text-gray-400" />
              <span>Last active {farmer.lastActive.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>
        </motion.div>

        {/* Right — details */}
        <motion.div
          variants={FADE_IN_VARIANT}
          className="flex flex-col gap-(--gap-lg) lg:col-span-2"
        >
          {/* Personal & Farm Info */}
          <div className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm">
            <h3 className="font-ubuntu mb-(--space-lg) text-lg font-semibold text-(--heading-colour)">
              Farm & Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-(--space-lg) sm:grid-cols-2">
              {[
                { icon: <User size={16} />, label: "Full Name", value: farmer.fullName },
                { icon: <Phone size={16} />, label: "Phone", value: farmer.phoneNumber },
                { icon: <Mail size={16} />, label: "Email", value: farmer.email },
                { icon: <Building2 size={16} />, label: "Farm Name", value: farmer.farmName },
                { icon: <MapPin size={16} />, label: "Farm Address", value: farmer.farmAddress, full: true },
                { icon: <MapPinned size={16} />, label: "State", value: farmer.state },
                { icon: <MapPinned size={16} />, label: "Local Government", value: farmer.localGovernment },
                { icon: <Fish size={16} />, label: "Fish Type", value: farmer.fishType },
                { icon: <Package size={16} />, label: "Farming Capacity", value: `${farmer.farmingCapacityKg.toLocaleString()} kg` },
                { icon: <TrendingUp size={16} />, label: "Experience", value: `${farmer.yearsOfExperience} years` },
              ].map(({ icon, label, value, full }) => (
                <div key={label} className={full ? "sm:col-span-2" : ""}>
                  <p className="font-roboto-slab mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {icon}
                    {label}
                  </p>
                  <p className="font-roboto-slab text-sm text-(--heading-colour)">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Listings */}
          <div className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm">
            <h3 className="font-ubuntu mb-(--space-lg) text-lg font-semibold text-(--heading-colour)">
              Recent Listings
            </h3>
            {farmer.recentListings.length > 0 ? (
              <div className="flex flex-col gap-(--space-md)">
                {farmer.recentListings.map((listing) => {
                  const config = STATUS_CONFIG[listing.status];
                  return (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between rounded-xl border border-(--border-gray) p-(--space-md)"
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                          {listing.fishType} — {listing.totalAvailableKg.toLocaleString()} kg
                        </p>
                        <p className="font-roboto-slab text-xs text-(--text-colour)">
                          {listing.createdAt.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
                        {config.icon}
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-roboto-slab text-sm text-(--text-colour)">No listings yet.</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
