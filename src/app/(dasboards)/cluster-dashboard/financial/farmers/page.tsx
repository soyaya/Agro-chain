"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Phone, MapPin, Search, TrendingUp, Package } from "lucide-react";
import { toast } from "sonner";
import { clusterService, type BackendClusterFarmer } from "~/lib/services/cluster.service";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

export default function ClusterFarmersFinancialPage() {
  const [farmers, setFarmers] = useState<BackendClusterFarmer[]>([]);
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await clusterService.getFarmers();
        if (mounted) {
          setFarmers(res.data.farmers ?? []);
          setTotalFarmers(res.data.summary.totalFarmers ?? 0);
          setTotalCapacity(res.data.summary.totalFarmersCapacity ?? 0);
        }
      } catch {
        toast.error("Failed to load farmer data");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const filtered = farmers.filter((f) =>
    search
      ? f.farmerName.toLowerCase().includes(search.toLowerCase()) ||
        f.fishType.toLowerCase().includes(search.toLowerCase()) ||
        f.location.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const stats = [
    { label: "Total Farmers", value: totalFarmers.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Capacity", value: `${totalCapacity.toLocaleString()} kg`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    {
      label: "Active Listings",
      value: farmers.reduce((s, f) => s + f.totalApprovedListings, 0).toString(),
      icon: Package, color: "text-purple-600", bg: "bg-purple-50",
    },
    {
      label: "Pending Listings",
      value: farmers.reduce((s, f) => s + f.totalPendingListings, 0).toString(),
      icon: Package, color: "text-yellow-600", bg: "bg-yellow-50",
    },
  ];

  if (loading) return <LoadingState message="Loading farmer data..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-heading-colour">Farmer Finances</h1>
        <p className="font-roboto-slab text-text-colour">
          Overview of farmers under your cluster — listings, capacity, and activity
        </p>
      </motion.div>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-(--gap-lg) lg:grid-cols-4"
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              variants={SLIDE_UP_VARIANT}
              className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <div className={`mb-(--space-md) inline-flex rounded-xl p-(--space-md) ${s.bg}`}>
                <Icon size={22} className={s.color} />
              </div>
              <p className="font-ubuntu mb-1 text-2xl font-bold text-heading-colour">{s.value}</p>
              <p className="font-roboto-slab text-sm text-text-colour">{s.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm"
      >
        <div className="mb-(--space-lg) flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-ubuntu text-xl font-semibold text-heading-colour">All Farmers</h2>
          <div className="relative">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search farmers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="font-roboto-slab rounded-xl border border-input-border py-(--space-sm) pr-(--space-lg) pl-9 text-sm text-heading-colour placeholder-gray-400 focus:ring-2 focus:ring-theme-green-dark focus:outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "No farmers match your search" : "No farmers yet"}
            description={search ? "Try a different name or location" : "Farmers assigned to your cluster will appear here"}
            size="md"
          />
        ) : (
          <div className="flex flex-col gap-(--space-md)">
            {filtered.map((farmer, i) => (
              <motion.div
                key={`${farmer.farmerName}-${i}`}
                variants={SLIDE_UP_VARIANT}
                className="rounded-xl border border-input-border p-(--space-lg) transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="font-ubuntu text-base font-semibold text-heading-colour">
                        {farmer.farmerName}
                      </p>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        {farmer.fishType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="shrink-0 text-gray-400" />
                        <p className="font-roboto-slab text-sm text-text-colour">{farmer.location}</p>
                      </div>
                      {farmer.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone size={13} className="shrink-0 text-gray-400" />
                          <p className="font-roboto-slab text-sm text-text-colour">{farmer.phoneNumber}</p>
                        </div>
                      )}
                      {farmer.capacity != null && (
                        <div className="flex items-center gap-1">
                          <TrendingUp size={13} className="shrink-0 text-gray-400" />
                          <p className="font-roboto-slab text-sm text-text-colour">
                            {farmer.capacity.toLocaleString()} kg capacity
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 text-center">
                    <div>
                      <p className="font-ubuntu text-lg font-bold text-green-600">{farmer.totalApprovedListings}</p>
                      <p className="font-roboto-slab text-xs text-gray-500">Approved</p>
                    </div>
                    <div>
                      <p className="font-ubuntu text-lg font-bold text-yellow-600">{farmer.totalPendingListings}</p>
                      <p className="font-roboto-slab text-xs text-gray-500">Pending</p>
                    </div>
                    <div>
                      <p className="font-ubuntu text-lg font-bold text-heading-colour">{farmer.totalListings}</p>
                      <p className="font-roboto-slab text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
