"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, MapPin, FileSignature } from "lucide-react";
import { authService, type BackendUser } from "~/lib/services/auth.service";
import { supplyAdminService, type SupplyAdminContract } from "~/lib/services/supply-admin.service";
import { LoadingState } from "~/components/ui/LoadingState";
import { SLIDE_UP_VARIANT } from "~/types/constants";

export default function SupplyAdminProfilePage() {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [contract, setContract] = useState<SupplyAdminContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [meRes, contractRes] = await Promise.all([
          authService.getMe(),
          supplyAdminService.getMyContract().catch(() => null),
        ]);
        if (!mounted) return;
        setUser(meRes.data.user);
        setContract(contractRes?.data.contract ?? null);
      } catch (error) {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState message="Loading your profile..." size="lg" />;

  if (errorMessage || !user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {errorMessage ?? "Failed to load profile."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div variants={SLIDE_UP_VARIANT} initial="hidden" animate="visible">
        <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Profile</h1>
        <p className="font-roboto-slab text-(--text-colour)">Your Supply Admin account details.</p>
      </motion.div>

      <motion.div
        variants={SLIDE_UP_VARIANT}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <User size={24} className="text-(--theme-green-dark)" />
          </div>
          <div>
            <p className="font-ubuntu text-lg font-bold text-(--heading-colour)">{user.full_name}</p>
            <p className="font-roboto-slab text-sm text-(--text-colour)">{user.email}</p>
          </div>
        </div>
        <div className="h-px w-full bg-gray-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="font-roboto-slab text-xs text-gray-400">Phone Number</p>
            <p className="font-roboto-slab text-(--heading-colour)">{user.phone_number}</p>
          </div>
          <div>
            <p className="font-roboto-slab text-xs text-gray-400">Region</p>
            <p className="font-roboto-slab flex items-center gap-1 text-(--heading-colour)">
              <MapPin size={14} className="text-gray-400" />
              {user.location_lga}, {user.location_state}
            </p>
          </div>
        </div>
      </motion.div>

      {contract && (
        <motion.div
          variants={SLIDE_UP_VARIANT}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4 rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
        >
          <h2 className="font-ubuntu flex items-center gap-2 text-lg font-semibold text-(--heading-colour)">
            <FileSignature size={20} />
            Standing Supply Contract
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="font-roboto-slab text-xs text-gray-400">Price</p>
              <p className="font-ubuntu font-bold text-(--heading-colour)">
                ₦{Number(contract.pricePerKg).toLocaleString()}/kg
              </p>
            </div>
            <div>
              <p className="font-roboto-slab text-xs text-gray-400">Payout Delay</p>
              <p className="font-ubuntu font-bold text-(--heading-colour)">
                {contract.payoutDelayDays} day{contract.payoutDelayDays === 1 ? "" : "s"}
              </p>
            </div>
            <div>
              <p className="font-roboto-slab text-xs text-gray-400">Status</p>
              <p className="font-ubuntu font-bold text-(--heading-colour) capitalize">{contract.status}</p>
            </div>
          </div>
          <p className="font-roboto-slab text-xs text-gray-400">
            Negotiated with admin — contact admin to renegotiate terms.
          </p>
        </motion.div>
      )}
    </div>
  );
}
