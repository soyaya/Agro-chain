"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileSignature, Receipt, Users, Truck, FileText } from "lucide-react";
import { supplyAdminService, type SupplyAdminContract } from "~/lib/services/supply-admin.service";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";

export default function SupplyAdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<SupplyAdminContract | null>(null);
  const [pendingDemands, setPendingDemands] = useState(0);
  const [teamCounts, setTeamCounts] = useState({ cluster: 0, farmer: 0, rider: 0 });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [contractRes, demandsRes, teamRes] = await Promise.all([
          supplyAdminService.getMyContract().catch(() => null),
          supplyAdminService.getDemands(),
          supplyAdminService.getMyTeam(),
        ]);
        if (!mounted) return;
        setContract(contractRes?.data.contract ?? null);
        setPendingDemands(demandsRes.data.demands.filter((d) => d.status === "assigned").length);
        const team = teamRes.data.team;
        setTeamCounts({
          cluster: team.filter((m) => m.role === "cluster").length,
          farmer: team.filter((m) => m.role === "farmer").length,
          rider: team.filter((m) => m.role === "rider").length,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState message="Loading your dashboard..." size="lg" />;

  const stats = [
    { label: "Demands awaiting your response", value: pendingDemands, icon: Receipt, color: "text-blue-700" },
    { label: "Cluster farmers on your team", value: teamCounts.cluster, icon: Users, color: "text-green-700" },
    { label: "Farmers on your team", value: teamCounts.farmer, icon: FileText, color: "text-teal-700" },
    { label: "Riders on your team", value: teamCounts.rider, icon: Truck, color: "text-orange-700" },
  ];

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div variants={SLIDE_UP_VARIANT} initial="hidden" animate="visible">
        <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Supply Admin Dashboard</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Build out your region and fulfill cross-region demand.
        </p>
      </motion.div>

      {contract && (
        <motion.div
          variants={SLIDE_UP_VARIANT}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50">
            <FileSignature size={22} className="text-(--theme-green-dark)" />
          </div>
          <div>
            <p className="font-roboto-slab text-sm text-(--text-colour)">Your standing contract</p>
            <p className="font-ubuntu text-xl font-bold text-(--heading-colour)">
              ₦{Number(contract.pricePerKg).toLocaleString()}/kg · paid {contract.payoutDelayDays} day
              {contract.payoutDelayDays === 1 ? "" : "s"} after each sale
            </p>
          </div>
        </motion.div>
      )}

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={SLIDE_UP_VARIANT}
              className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
            >
              <Icon className={`mb-4 ${stat.color}`} size={24} />
              <p className="font-ubuntu mb-1 text-3xl font-bold text-(--heading-colour)">{stat.value}</p>
              <p className="font-roboto-slab text-sm text-(--text-colour)">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
