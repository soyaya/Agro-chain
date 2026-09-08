"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { authService } from "~/lib/services/auth.service";
import { clusterService } from "~/lib/services/cluster.service";
import { platformService } from "~/lib/services/platform.service";
import { DynamicInput } from "~/components/dynamic-input";
import { LocationPicker, type LocationValue } from "~/components/shared/LocationPicker";

type ClusterForm = {
  fullName: string;
  phoneNumber: string;
  email: string;
  clusterName: string;
  state: string;
  localGovernment: string;
  ward: string;
};

export default function ClusterProfilePage() {
  const [form, setForm] = useState<ClusterForm>({
    fullName: "",
    phoneNumber: "",
    email: "",
    clusterName: "",
    state: "",
    localGovernment: "",
    ward: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeStates, setActiveStates] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    platformService
      .getActiveStates()
      .then((res) => {
        if (mounted) setActiveStates(res.data.activeStates);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await authService.getMe();
        const user = response.data.user;
        if (!mounted) return;
        setForm({
          fullName: user.full_name ?? "",
          phoneNumber: user.phone_number ?? "",
          email: user.email ?? "",
          clusterName: user.business_name ?? user.farm_name ?? "",
          state: user.location_state ?? "",
          localGovernment: user.location_lga ?? "",
          ward: user.location_ward ?? "",
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await clusterService.updateProfile({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        businessName: form.clusterName,
        state: form.state,
        localGovernment: form.localGovernment,
        ward: form.ward,
      });
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-(--text-colour)">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Cluster Profile</h1>
          <p className="font-roboto-slab text-(--text-colour)">Manage your cluster account details</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="rounded-xl border border-(--border-gray) px-4 py-2 text-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="rounded-xl bg-(--theme-green-dark) px-4 py-2 text-sm text-white">{saving ? "Saving..." : "Save"}</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="rounded-xl border border-(--border-gray) px-4 py-2 text-sm">Edit</button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) md:grid-cols-2">
        {(
          [
            ["Full Name", "fullName"],
            ["Phone Number", "phoneNumber"],
            ["Email", "email"],
            ["Cluster Name", "clusterName"],
          ] as const
        ).map(([label, key]) => (
          <label key={key} className="text-sm text-(--text-colour)">
            <span className="mb-1 block font-medium text-(--heading-colour)">{label}</span>
            <input
              value={form[key]}
              disabled={!editing}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full rounded-lg border border-(--border-input) px-3 py-2 disabled:bg-gray-50"
            />
          </label>
        ))}

        {editing ? (
          <div className="md:col-span-2">
            <p className="font-roboto-slab mb-2 text-xs text-(--text-colour)">
              Your ward determines which farmers' listings you're the first to see and approve — set
              it precisely.
            </p>
            <LocationPicker
              value={{ state: form.state, lga: form.localGovernment, ward: form.ward }}
              onChange={(next: LocationValue) =>
                setForm((prev) => ({
                  ...prev,
                  state: next.state,
                  localGovernment: next.lga,
                  ward: next.ward,
                }))
              }
              activeStates={activeStates}
            />
          </div>
        ) : (
          <>
            <DynamicInput label="State" value={form.state} disabled />
            <DynamicInput label="Local Government" value={form.localGovernment} disabled />
            <DynamicInput label="Ward / Community" value={form.ward} disabled />
          </>
        )}
      </div>
    </div>
  );
}
