"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supplyAdminService, type SupplyAdminTeamMember } from "~/lib/services/supply-admin.service";
import { DynamicInput } from "~/components/dynamic-input";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

export default function SupplyAdminFarmersPage() {
  const [team, setTeam] = useState<SupplyAdminTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", locationLga: "" });

  const load = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await supplyAdminService.getMyTeam();
      setTeam(res.data.team);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load your team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleInvite = async () => {
    if (!form.fullName || !form.phone || !form.email || !form.locationLga) {
      toast.error("Fill in all fields to invite a farmer.");
      return;
    }
    setInviting(true);
    try {
      await supplyAdminService.inviteFarmer(form);
      toast.success("Farmer invited — they'll get an email with a temporary password.");
      setForm({ fullName: "", phone: "", email: "", locationLga: "" });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to invite farmer");
    } finally {
      setInviting(false);
    }
  };

  const farmers = team.filter((m) => m.role === "farmer");

  if (loading) return <LoadingState message="Loading farmers..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">Farmers</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Directly invite farmers in your region. Once you have a cluster farmer, they can also just
          self-register and their listings will be reviewed normally.
        </p>
      </motion.div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
      )}

      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
      >
        <h2 className="font-ubuntu flex items-center gap-2 text-lg font-semibold text-(--heading-colour)">
          <UserPlus size={20} />
          Invite a Farmer
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DynamicInput
            label="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <DynamicInput
            fieldType="tel"
            label="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <DynamicInput
            fieldType="email"
            label="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <DynamicInput
            label="LGA"
            value={form.locationLga}
            onChange={(e) => setForm({ ...form, locationLga: e.target.value })}
          />
        </div>
        <button
          onClick={handleInvite}
          disabled={inviting}
          className="font-roboto-slab flex h-12 w-full items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 sm:w-fit sm:px-8"
        >
          {inviting ? "Inviting..." : "Invite Farmer"}
        </button>
      </motion.div>

      {farmers.length > 0 ? (
        <motion.div variants={STAGGER_CONTAINER_VARIANT} initial="hidden" animate="visible" className="flex flex-col gap-3">
          {farmers.map((member) => (
            <motion.div
              key={member.id}
              variants={FADE_IN_VARIANT}
              className="flex items-center justify-between rounded-2xl border border-(--border-gray) bg-(--white) p-4 shadow-sm"
            >
              <div>
                <p className="font-roboto-slab font-medium text-(--heading-colour)">{member.full_name}</p>
                <p className="font-roboto-slab text-xs text-(--text-colour)">{member.location_lga}</p>
              </div>
              <p className="font-roboto-slab text-sm text-(--text-colour)">{member.phone_number}</p>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No farmers invited yet"
          description="Farmers you invite directly will appear here."
          size="lg"
        />
      )}
    </div>
  );
}
