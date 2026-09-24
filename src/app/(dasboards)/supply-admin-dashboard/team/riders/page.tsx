"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Truck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supplyAdminService } from "~/lib/services/supply-admin.service";
import type { PendingRider, ApprovedRider } from "~/lib/services/cluster.service";
import { DynamicInput } from "~/components/dynamic-input";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

export default function SupplyAdminRidersPage() {
  const [pending, setPending] = useState<PendingRider[]>([]);
  const [approved, setApproved] = useState<ApprovedRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", locationLga: "" });

  const load = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        supplyAdminService.getPendingRiders(),
        supplyAdminService.getApprovedRiders(),
      ]);
      setPending(pendingRes.data.riders);
      setApproved(approvedRes.data.riders);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load riders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleInvite = async () => {
    if (!form.fullName || !form.phone || !form.email || !form.locationLga) {
      toast.error("Fill in all fields to invite a rider.");
      return;
    }
    setInviting(true);
    try {
      await supplyAdminService.inviteRider(form);
      toast.success("Rider invited — they'll get an email with a temporary password.");
      setForm({ fullName: "", phone: "", email: "", locationLga: "" });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to invite rider");
    } finally {
      setInviting(false);
    }
  };

  const handleReview = async (riderId: string, status: "approved" | "rejected") => {
    setActionLoading(riderId);
    try {
      await supplyAdminService.reviewRider(riderId, status);
      setPending((prev) => prev.filter((r) => r.id !== riderId));
      toast.success(status === "approved" ? "Rider approved." : "Rider rejected.");
      if (status === "approved") await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to review rider");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingState message="Loading riders..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">Riders</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Invite delivery riders for your region and approve them yourself — there's no cluster
          farmer to do it for you until you've built one out.
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
          Invite a Rider
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
          {inviting ? "Inviting..." : "Invite Rider"}
        </button>
      </motion.div>

      <div>
        <h2 className="font-ubuntu mb-4 text-xl font-semibold text-(--heading-colour)">Pending Approval</h2>
        {pending.length > 0 ? (
          <motion.div
            variants={STAGGER_CONTAINER_VARIANT}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2 lg:grid-cols-3"
          >
            {pending.map((rider) => (
              <motion.div
                key={rider.id}
                variants={FADE_IN_VARIANT}
                className="flex flex-col gap-(--gap-base) rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg) shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                    <Truck size={22} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-ubuntu font-semibold text-(--heading-colour)">{rider.full_name}</p>
                    <p className="font-roboto-slab text-sm text-(--text-colour)">{rider.location_lga}</p>
                  </div>
                </div>
                <div className="font-roboto-slab flex flex-col gap-1 text-sm text-(--text-colour)">
                  <p>{rider.phone_number}</p>
                  {rider.email && <p>{rider.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-(--gap-base)">
                  <button
                    onClick={() => handleReview(rider.id, "rejected")}
                    disabled={actionLoading === rider.id}
                    className="font-roboto-slab flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleReview(rider.id, "approved")}
                    disabled={actionLoading === rider.id}
                    className="font-roboto-slab flex h-10 items-center justify-center gap-2 rounded-xl bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState icon={Truck} title="No riders pending review" description="Invited riders awaiting approval appear here." size="md" />
        )}
      </div>

      <div>
        <h2 className="font-ubuntu mb-4 text-xl font-semibold text-(--heading-colour)">Approved Riders</h2>
        {approved.length > 0 ? (
          <div className="flex flex-col gap-3">
            {approved.map((rider) => (
              <div
                key={rider.id}
                className="flex items-center justify-between rounded-2xl border border-(--border-gray) bg-(--white) p-4 shadow-sm"
              >
                <p className="font-roboto-slab font-medium text-(--heading-colour)">{rider.full_name}</p>
                <p className="font-roboto-slab text-sm text-(--text-colour)">{rider.phone_number}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Truck} title="No approved riders yet" description="Approved riders in your region appear here." size="md" />
        )}
      </div>
    </div>
  );
}
