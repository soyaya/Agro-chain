"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Phone,
  MapPin,
  Search,
  Package,
  Fish,
  TrendingUp,
  X,
  Mail,
  Building2,
  Calendar,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { clusterService, type BackendClusterFarmer } from "~/lib/services/cluster.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

function FarmerDetailModal({
  farmer,
  onClose,
}: {
  farmer: BackendClusterFarmer;
  onClose: () => void;
}) {
  const initials = farmer.farmerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-(--white) p-(--space-xl) shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="text-text-colour hover:bg-pink-bg absolute top-4 right-4 rounded-full p-2 transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mb-(--space-xl) flex flex-col items-center gap-(--space-md) text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
            {initials}
          </div>
          <div>
            <h2 className="font-ubuntu text-heading-colour text-2xl font-bold">
              {farmer.farmerName}
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-0.5 text-xs font-medium text-green-700">
              <Fish size={12} />
              {farmer.fishType} Farmer
            </span>
          </div>
        </div>

        <div className="bg-gray-bg mb-(--space-xl) grid grid-cols-3 gap-(--gap-base) rounded-2xl p-(--space-lg)">
          <div className="text-center">
            <p className="font-ubuntu text-heading-colour text-2xl font-bold">
              {farmer.totalListings}
            </p>
            <p className="font-roboto-slab text-text-colour text-xs">Total Listings</p>
          </div>
          <div className="text-center">
            <p className="font-ubuntu text-2xl font-bold text-green-600">
              {farmer.totalApprovedListings}
            </p>
            <p className="font-roboto-slab text-text-colour text-xs">Approved</p>
          </div>
          <div className="text-center">
            <p className="font-ubuntu text-2xl font-bold text-yellow-600">
              {farmer.totalPendingListings}
            </p>
            <p className="font-roboto-slab text-text-colour text-xs">Pending</p>
          </div>
        </div>

        <div className="flex flex-col gap-(--space-md)">
          {[
            { icon: <Building2 size={16} />, label: "Farm Name", value: farmer.farmName ?? "—" },
            { icon: <MapPin size={16} />, label: "Location", value: farmer.location },
            { icon: <Phone size={16} />, label: "Phone", value: farmer.phoneNumber },
            { icon: <Mail size={16} />, label: "Email", value: farmer.emailAddress ?? "—" },
            {
              icon: <Package size={16} />,
              label: "Capacity",
              value: farmer.capacity != null ? `${Number(farmer.capacity).toLocaleString()} kg` : "—",
            },
            {
              icon: <TrendingUp size={16} />,
              label: "Experience",
              value: farmer.experience != null ? `${farmer.experience} years` : "—",
            },
            {
              icon: <Calendar size={16} />,
              label: "Member Since",
              value: new Date(farmer.memberSince).toLocaleDateString("en-NG", {
                month: "long",
                year: "numeric",
              }),
            },
            {
              icon: <Clock size={16} />,
              label: "Last Active",
              value: new Date(farmer.lastActive).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-(--space-md)">
              <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
              <div>
                <p className="font-roboto-slab text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  {label}
                </p>
                <p className="font-roboto-slab text-heading-colour text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ClusterFarmersPage() {
  const router = useRouter();
  const [farmers, setFarmers] = useState<BackendClusterFarmer[]>([]);
  const [summary, setSummary] = useState({ totalFarmers: 0, totalFarmersCapacity: 0, locationCovering: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<BackendClusterFarmer | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await clusterService.getFarmers();
        if (mounted) {
          setFarmers(res.data.farmers ?? []);
          setSummary(res.data.summary);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load farmers");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const filtered = farmers.filter(
    (f) =>
      f.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.farmName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.fishType.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <LoadingState message="Loading farmers..." size="lg" />;

  if (error) {
    return (
      <EmptyState
        icon={Users}
        title="Unable to load farmers"
        description={error}
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
          <h1 className="font-ubuntu text-heading-colour mb-2 text-3xl font-bold">My Farmers</h1>
          <p className="font-roboto-slab text-text-colour">
            View and manage the farmers registered under your cluster
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, farm, location, or fish type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-roboto-slab border-input-border h-10 w-full rounded-xl border pr-4 pl-10 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          {
            icon: <Users size={24} className="text-green-600" />,
            bg: "bg-green-50",
            value: summary.totalFarmers,
            label: "Total Farmers",
          },
          {
            icon: <Package size={24} className="text-blue-600" />,
            bg: "bg-blue-50",
            value: `${Number(summary.totalFarmersCapacity).toLocaleString()} kg`,
            label: "Total Capacity",
          },
          {
            icon: <MapPin size={24} className="text-purple-600" />,
            bg: "bg-purple-50",
            value: summary.locationCovering,
            label: "LGAs Covered",
          },
        ].map(({ icon, bg, value, label }) => (
          <motion.div
            key={label}
            variants={FADE_IN_VARIANT}
            className="border-gray-border rounded-2xl border bg-(--white) p-6 shadow-sm"
          >
            <div className={`mb-4 inline-flex rounded-xl p-3 ${bg}`}>{icon}</div>
            <p className="font-ubuntu text-heading-colour text-3xl font-bold">{value}</p>
            <p className="font-roboto-slab text-text-colour text-sm">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Farmer Cards */}
      {farmers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No farmers yet"
          description="Farmers in your area will be assigned to you by admin once they register."
          size="lg"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results"
          description="No farmers match your search. Try a different name or location."
          size="lg"
        />
      ) : (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((farmer) => {
            const initials = farmer.farmerName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <motion.div
                key={farmer.phoneNumber}
                variants={FADE_IN_VARIANT}
                className="border-gray-border flex flex-col gap-4 rounded-3xl border bg-(--white) p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="font-ubuntu flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-ubuntu text-heading-colour truncate text-lg font-bold">
                      {farmer.farmerName}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      <Fish size={11} />
                      {farmer.fishType}
                    </span>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100" />

                <div className="flex flex-col gap-2.5">
                  {farmer.farmName && (
                    <div className="text-text-colour flex items-center gap-2 text-sm">
                      <Building2 size={15} className="shrink-0 text-gray-400" />
                      <span className="truncate">{farmer.farmName}</span>
                    </div>
                  )}
                  <div className="text-text-colour flex items-center gap-2 text-sm">
                    <MapPin size={15} className="shrink-0 text-gray-400" />
                    <span>{farmer.location}</span>
                  </div>
                  <div className="text-text-colour flex items-center gap-2 text-sm">
                    <Phone size={15} className="shrink-0 text-gray-400" />
                    <span>{farmer.phoneNumber}</span>
                  </div>
                  {farmer.capacity != null && (
                    <div className="text-text-colour flex items-center gap-2 text-sm">
                      <Package size={15} className="shrink-0 text-gray-400" />
                      <span>
                        Capacity:{" "}
                        <span className="text-heading-colour font-medium">
                          {Number(farmer.capacity).toLocaleString()} kg
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-bg grid grid-cols-3 gap-2 rounded-xl p-3">
                  <div className="text-center">
                    <p className="font-ubuntu text-heading-colour text-lg font-bold">
                      {farmer.totalListings}
                    </p>
                    <p className="font-roboto-slab text-text-colour text-xs">Listings</p>
                  </div>
                  <div className="text-center">
                    <p className="font-ubuntu text-lg font-bold text-green-600">
                      {farmer.totalApprovedListings}
                    </p>
                    <p className="font-roboto-slab text-text-colour text-xs">Approved</p>
                  </div>
                  <div className="text-center">
                    <p className="font-ubuntu text-lg font-bold text-yellow-600">
                      {farmer.totalPendingListings}
                    </p>
                    <p className="font-roboto-slab text-text-colour text-xs">Pending</p>
                  </div>
                </div>

                <div className={`grid gap-2 ${farmer.id ? "grid-cols-2" : "grid-cols-1"}`}>
                  <button
                    onClick={() => setSelectedFarmer(farmer)}
                    className="font-roboto-slab text-theme-green-dark bg-pink-bg flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition hover:bg-green-50"
                  >
                    Quick View
                  </button>
                  {farmer.id && (
                    <button
                      onClick={() => router.push(`/cluster-dashboard/farmers/${farmer.id}`)}
                      className="font-roboto-slab border-gray-border text-heading-colour hover:bg-gray-bg flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition"
                    >
                      Full Profile
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedFarmer && (
          <FarmerDetailModal farmer={selectedFarmer} onClose={() => setSelectedFarmer(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
