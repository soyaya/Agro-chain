"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { authService } from "~/lib/services/auth.service";
import { clusterService } from "~/lib/services/cluster.service";

type ClusterForm = {
  fullName: string;
  phoneNumber: string;
  email: string;
  clusterName: string;
  location: string;
};

export default function ClusterProfilePage() {
  const [form, setForm] = useState<ClusterForm>({
    fullName: "",
    phoneNumber: "",
    email: "",
    clusterName: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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
          location: [
            user.location_address,
            user.location_lga,
            user.location_state,
          ]
            .filter(Boolean)
            .join(", "),
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load profile",
        );
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
        clusterName: form.clusterName,
        location: form.location,
      });
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-text-colour">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-ubuntu text-heading-colour text-3xl font-bold">
            Cluster Profile
          </h1>
          <p className="font-roboto-slab text-text-colour">
            Manage your cluster account details
          </p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="border-gray-border rounded-xl border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="bg-theme-green-dark rounded-xl px-4 py-2 text-sm text-white"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="border-gray-border rounded-xl border px-4 py-2 text-sm"
          >
            Edit
          </button>
        )}
      </motion.div>

      <div className="border-input-border grid grid-cols-1 gap-4 rounded-2xl border bg-(--white) p-(--space-xl) md:grid-cols-2">
        {(
          [
            ["Full Name", "fullName"],
            ["Phone Number", "phoneNumber"],
            ["Email", "email"],
            ["Cluster Name", "clusterName"],
            ["Location", "location"],
          ] as const
        ).map(([label, key]) => {
          const isNa = form[key] === "N/A" || form[key] === "";
          const locked =
            key === "fullName" ||
            key === "phoneNumber" ||
            key === "email" ||
            (key === "location" && !isNa);
          return (
            <label key={key} className="text-text-colour text-sm">
              <span className="text-heading-colour mb-1 block font-medium">
                {label}
              </span>
              <input
                value={form[key]}
                disabled={locked || !editing}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="border-input-border disabled:bg-gray-bg w-full rounded-lg border px-3 py-2"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
