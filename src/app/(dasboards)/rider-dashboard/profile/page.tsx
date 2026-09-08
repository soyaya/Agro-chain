"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { authService } from "~/lib/services/auth.service";
import { riderService } from "~/lib/services/rider.service";

type RiderForm = {
  fullName: string;
  phoneNumber: string;
  email: string;
  locationState: string;
  locationLga: string;
  locationAddress: string;
};

export default function RiderProfilePage() {
  const [form, setForm] = useState<RiderForm>({
    fullName: "",
    phoneNumber: "",
    email: "",
    locationState: "",
    locationLga: "",
    locationAddress: "",
  });
  const [riderApproved, setRiderApproved] = useState(false);
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
          locationState: user.location_state ?? "",
          locationLga: user.location_lga ?? "",
          locationAddress: user.location_address ?? "",
        });
        setRiderApproved(!!user.rider_approved);
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
      await riderService.updateProfile({
        fullName: form.fullName,
        locationState: form.locationState,
        locationLga: form.locationLga,
        locationAddress: form.locationAddress,
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
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Rider Profile</h1>
          <p className="font-roboto-slab text-(--text-colour)">Manage your delivery account details</p>
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

      <div
        className={`flex items-center gap-3 rounded-2xl border p-(--space-lg) ${
          riderApproved ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"
        }`}
      >
        <Clock size={20} className={riderApproved ? "text-green-600" : "text-yellow-600"} />
        <p className={`font-roboto-slab text-sm ${riderApproved ? "text-green-800" : "text-yellow-800"}`}>
          {riderApproved
            ? "Your rider account is approved. You can be assigned deliveries."
            : "Your rider account is awaiting approval from a cluster farmer in your area."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) md:grid-cols-2">
        {(
          [
            ["Full Name", "fullName"],
            ["Phone Number", "phoneNumber"],
            ["Email", "email"],
            ["State", "locationState"],
            ["Local Government", "locationLga"],
            ["Address", "locationAddress"],
          ] as const
        ).map(([label, key]) => (
          <label key={key} className="text-sm text-(--text-colour)">
            <span className="mb-1 block font-medium text-(--heading-colour)">{label}</span>
            <input
              value={form[key]}
              disabled={!editing || key === "phoneNumber" || key === "email"}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full rounded-lg border border-(--border-input) px-3 py-2 disabled:bg-gray-50"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
