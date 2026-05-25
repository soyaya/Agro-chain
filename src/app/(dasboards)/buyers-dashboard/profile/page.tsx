"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { authService } from "~/lib/services/auth.service";
import { buyerService } from "~/lib/services/buyer.service";
import { useAuth } from "~/lib/auth-context";

type BuyerForm = {
  fullName: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  deliveryAddress: string;
  state: string;
  localGovernment: string;
  businessType: string;
};

export default function BuyerProfilePage() {
  const { updateUser } = useAuth();
  const [form, setForm] = useState<BuyerForm>({
    fullName: "",
    companyName: "",
    phoneNumber: "",
    email: "",
    deliveryAddress: "",
    state: "",
    localGovernment: "",
    businessType: "",
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
          companyName: user.business_name ?? "",
          phoneNumber: user.phone_number ?? "",
          email: user.email ?? "",
          deliveryAddress: user.location_address ?? "",
          state: user.location_state ?? "",
          localGovernment: user.location_lga ?? "",
          businessType: user.business_type ?? "",
        });
        updateUser({
          id: user.id,
          fullName: user.full_name,
          phoneNumber: user.phone_number,
          email: user.email,
          role: (user.role === "cluster" || user.role === "pending" ? "farmer" : user.role) as "farmer" | "buyer" | "admin",
          isClusterFarmer: user.is_cluster_farmer || user.role === "cluster",
          profileComplete: user.profile_completed,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at),
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
      await buyerService.updateProfile({
        fullName: form.fullName,
        businessName: form.companyName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        businessAddress: form.deliveryAddress,
        state: form.state,
        localGovernment: form.localGovernment,
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
          <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Buyer Profile</h1>
          <p className="font-roboto-slab text-(--text-colour)">Manage your business details</p>
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
            ["Company Name", "companyName"],
            ["Phone Number", "phoneNumber"],
            ["Email", "email"],
            ["Delivery Address", "deliveryAddress"],
            ["State", "state"],
            ["Local Government", "localGovernment"],
            ["Business Type", "businessType"],
          ] as const
        ).map(([label, key]) => {
          const isNa = form[key] === "N/A" || form[key] === "";
          const locked = key === "fullName" || key === "phoneNumber" || key === "email" ||
            ((key === "state" || key === "localGovernment") && !isNa);
          return (
            <label key={key} className="text-sm text-(--text-colour)">
              <span className="mb-1 block font-medium text-(--heading-colour)">{label}</span>
              <input
                value={form[key]}
                disabled={locked || !editing}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full rounded-lg border border-(--border-input) px-3 py-2 disabled:bg-gray-50"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
