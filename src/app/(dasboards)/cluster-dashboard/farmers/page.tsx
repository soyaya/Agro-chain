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
  CheckCircle2,
} from "lucide-react";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { clusterService, type BackendClusterFarmer } from "~/lib/services/cluster.service";

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
        className="relative w-full max-w-lg overflow-y-auto rounded-3xl bg-(--white) p-(--space-xl) shadow-xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-(--text-colour) transition hover:bg-(--bg-pink)"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Avatar + name */}
        <div className="mb-(--space-xl) flex flex-col items-center gap-(--space-md) text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
            {initials}
          </div>
          <div>
            <h2 className="font-ubuntu text-2xl font-bold text-(--heading-colour)">{farmer.farmerName}</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-0.5 text-xs font-medium text-green-700">
              <Fish size={12} />
              {farmer.fishType} Farmer
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-(--space-xl) grid grid-cols-3 gap-(--gap-base) rounded-2xl bg-(--gray-bg) p-(--space-lg)">
          <div className="text-center">
            <p className="font-ubuntu text-2xl font-bold text-(--heading-colour)">{farmer.totalListings}</p>
            <p className="font-roboto-slab text-xs text-(--text-colour)">Total Listings</p>
          </div>
          <div className="text-center">
            <p className="font-ubuntu text-2xl font-bold text-green-600">{farmer.totalApprovedListings}</p>
            <p className="font-roboto-slab text-xs text-(--text-colour)">Approved</p>
          </div>
          <div className="text-center">
            <p className="font-ubuntu text-2xl font-bold text-yellow-600">{farmer.totalPendingListings}</p>
            <p className="font-roboto-slab text-xs text-(--text-colour)">Pending</p>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-(--space-md)">
          {[
            { icon: <Building2 size={16} />, label: "Farm Name", value: farmer.farmName ?? "—" },
            { icon: <MapPin size={16} />, label: "Location", value: farmer.location },
            { icon: <Phone size={16} />, label: "Phone", value: farmer.phoneNumber },
            { icon: <Mail size={16} />, label: "Email", value: farmer.emailAddress },
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
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-(--space-md)">
              <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
              <div>
                <p className="font-roboto-slab text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                <p className="font-roboto-slab text-sm text-(--heading-colour)">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ClusterFarmersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<BackendClusterFarmer | null>(null);
  const [farmers, setFarmers] = useState<BackendClusterFarmer[]>([]);
  const [summary, setSummary] = useState({
    totalFarmers: 0,
    totalFarmersCapacity: 0,
    locationCovering: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await clusterService.getFarmers();
        if (mounted) {
          setFarmers(response.data.farmers);
          setSummary(response.data.summary);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load farmers");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = farmers.filter(
    (f) =>
      f.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.farmName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.fishType.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
          <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">My Farmers</h1>
          <p className="font-roboto-slab text-(--text-colour)">
            View and manage the farmers registered in your region
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, farm, location, or fish type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-roboto-slab h-10 w-full rounded-xl border border-(--border-input) pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
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
          { icon: <Users size={24} className="text-green-600" />, bg: "bg-green-50", value: summary.totalFarmers, label: "Total Farmers" },
          { icon: <Package size={24} className="text-blue-600" />, bg: "bg-blue-50", value: `${Number(summary.totalFarmersCapacity).toLocaleString()} kg`, label: "Total Capacity" },
          { icon: <MapPin size={24} className="text-purple-600" />, bg: "bg-purple-50", value: summary.locationCovering, label: "Locations Covered" },
        ].map(({ icon, bg, value, label }) => (
          <motion.div
            key={label}
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
          >
            <div className={`mb-4 inline-flex rounded-xl p-3 ${bg}`}>{icon}</div>
            <p className="font-ubuntu text-3xl font-bold text-(--heading-colour)">{value}</p>
            <p className="font-roboto-slab text-sm text-(--text-colour)">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Farmer Cards */}
      {loading ? (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap) text-center"
        >
          <p className="text-(--text-colour)">Loading farmers...</p>
        </motion.div>
      ) : errorMessage ? (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap) text-center"
        >
          <p className="text-(--error-red)">{errorMessage}</p>
        </motion.div>
      ) : filtered.length > 0 ? (
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
                key={farmer.emailAddress}
                variants={FADE_IN_VARIANT}
                className="flex flex-col gap-4 rounded-3xl border border-(--border-gray) bg-(--white) p-6 shadow-sm transition hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 font-ubuntu text-lg font-bold text-green-700">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-ubuntu truncate text-lg font-bold text-(--heading-colour)">{farmer.farmerName}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      <Fish size={11} />
                      {farmer.fishType}
                    </span>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100" />

                {/* Details */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-sm text-(--text-colour)">
                    <Building2 size={15} className="shrink-0 text-gray-400" />
                    <span className="truncate">{farmer.farmName ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-(--text-colour)">
                    <MapPin size={15} className="shrink-0 text-gray-400" />
                    <span>{farmer.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-(--text-colour)">
                    <Phone size={15} className="shrink-0 text-gray-400" />
                    <span>{farmer.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-(--text-colour)">
                    <Package size={15} className="shrink-0 text-gray-400" />
                    <span>
                      Capacity:{" "}
                      <span className="font-medium text-(--heading-colour)">
                        {farmer.capacity != null ? `${Number(farmer.capacity).toLocaleString()} kg` : "—"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-(--gray-bg) p-3">
                  <div className="text-center">
                    <p className="font-ubuntu text-lg font-bold text-(--heading-colour)">{farmer.totalListings}</p>
                    <p className="font-roboto-slab text-xs text-(--text-colour)">Listings</p>
                  </div>
                  <div className="text-center">
                    <p className="font-ubuntu text-lg font-bold text-green-600">{farmer.totalApprovedListings}</p>
                    <p className="font-roboto-slab text-xs text-(--text-colour)">Approved</p>
                  </div>
                  <div className="text-center">
                    <p className="font-ubuntu text-lg font-bold text-yellow-600">{farmer.totalPendingListings}</p>
                    <p className="font-roboto-slab text-xs text-(--text-colour)">Pending</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFarmer(farmer)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--bg-pink) py-2.5 font-roboto-slab text-sm font-semibold text-(--theme-green-dark) transition hover:bg-green-50"
                >
                  <CheckCircle2 size={16} />
                  View Full Profile
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--section-gap) text-center"
        >
          <Users size={48} className="text-gray-300" />
          <div>
            <h3 className="font-ubuntu text-xl font-bold text-(--heading-colour)">No farmers found</h3>
            <p className="font-roboto-slab mt-1 text-(--text-colour)">
              {farmers.length === 0
                ? "No farmers have registered in your region yet"
                : "Try adjusting your search terms"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedFarmer && (
          <FarmerDetailModal farmer={selectedFarmer} onClose={() => setSelectedFarmer(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
