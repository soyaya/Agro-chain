"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { farmerService } from "~/lib/services/farmer.service";
import { authService } from "~/lib/services/auth.service";

type ProfileForm = {
  fullName: string;
  phoneNumber: string;
  email: string;
  farmName: string;
  farmAddress: string;
  state: string;
  localGovernment: string;
  fishType: string;
  farmingCapacityKg: number;
  yearsOfExperience: number;
};

type ClusterForm = {
  businessName: string;
  cacNumber: string;
  warehouseLocation: string;
  distributionCapacity: number;
  logisticsAvailable: boolean;
  bvnVerification: boolean;
  proofOfAddress: boolean;
  cacRegistration: boolean;
  businessLicense: boolean;
  taxClearance: boolean;
};

export default function FarmerProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    phoneNumber: "",
    email: "",
    farmName: "",
    farmAddress: "",
    state: "",
    localGovernment: "",
    fishType: "",
    farmingCapacityKg: 0,
    yearsOfExperience: 0,
  });
  const [clusterForm, setClusterForm] = useState<ClusterForm>({
    businessName: "",
    cacNumber: "",
    warehouseLocation: "",
    distributionCapacity: 0,
    logisticsAvailable: false,
    bvnVerification: false,
    proofOfAddress: false,
    cacRegistration: false,
    businessLicense: false,
    taxClearance: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
          farmName: user.farm_name ?? "",
          farmAddress: user.location_address ?? "",
          state: user.location_state ?? "",
          localGovernment: user.location_lga ?? "",
          fishType: user.fish_type_preference ?? "",
          farmingCapacityKg: Number(user.farming_capacity_kg ?? 0),
          yearsOfExperience: Number(user.years_of_experience ?? 0),
        });
        setClusterForm((prev) => ({
          ...prev,
          businessName: user.business_name ?? "",
          cacNumber: user.cac_number ?? "",
          warehouseLocation: user.warehouse_location ?? "",
          distributionCapacity: Number(user.distribution_capacity ?? 0),
          logisticsAvailable: Boolean(user.logistics_available),
          bvnVerification: Boolean(user.bvn_doc_url),
          proofOfAddress: Boolean(user.proof_of_address_url),
          cacRegistration: Boolean(user.cac_registration_url),
          businessLicense: Boolean(user.business_license_url),
          taxClearance: Boolean(user.tax_clearance_url),
        }));
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

  const profileRows = useMemo(
    () => [
      ["Full Name", "fullName" as const],
      ["Phone Number", "phoneNumber" as const],
      ["Email", "email" as const],
      ["Farm Name", "farmName" as const],
      ["Farm Address", "farmAddress" as const],
      ["State", "state" as const],
      ["Local Government", "localGovernment" as const],
      ["Fish Type", "fishType" as const],
      ["Farming Capacity (kg)", "farmingCapacityKg" as const],
      ["Years Of Experience", "yearsOfExperience" as const],
    ],
    [],
  );

  const saveProfile = async () => {
    setSaving(true);
    try {
      await farmerService.updateProfile({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        farmName: form.farmName,
        farmAddress: form.farmAddress,
        state: form.state,
        localGovernment: form.localGovernment,
        fishType: form.fishType,
        farmingCapacityKg: Number(form.farmingCapacityKg),
        yearsOfExperience: Number(form.yearsOfExperience),
      });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const submitClusterApplication = async () => {
    setApplying(true);
    try {
      await farmerService.applyForCluster({
        businessName: clusterForm.businessName,
        cacNumber: clusterForm.cacNumber,
        warehouseLocation: clusterForm.warehouseLocation,
        distributionCapacity: Number(clusterForm.distributionCapacity),
        logisticsAvailable: clusterForm.logisticsAvailable,
        bvnVerification: clusterForm.bvnVerification,
        proofOfAddress: clusterForm.proofOfAddress,
        cacRegistration: clusterForm.cacRegistration,
        businessLicense: clusterForm.businessLicense,
        taxClearance: clusterForm.taxClearance,
      });
      toast.success("Cluster farmer application submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="text-(--text-colour)">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">My Profile</h1>
        <p className="font-roboto-slab text-(--text-colour)">Manage your farmer profile</p>
      </motion.div>

      <div className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl)">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-ubuntu text-xl font-semibold text-(--heading-colour)">Profile Information</h2>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-(--border-gray) px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="rounded-xl bg-(--theme-green-dark) px-4 py-2 text-sm text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-xl border border-(--border-gray) px-4 py-2 text-sm"
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {profileRows.map(([label, key]) => (
            <label key={key} className="text-sm text-(--text-colour)">
              <span className="mb-1 block font-medium text-(--heading-colour)">{label}</span>
              <input
                type={key === "email" ? "email" : key.includes("Capacity") || key.includes("years") ? "number" : "text"}
                value={String(form[key])}
                disabled={!isEditing}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    [key]: key === "farmingCapacityKg" || key === "yearsOfExperience"
                      ? Number(e.target.value || 0)
                      : e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--border-input) px-3 py-2 disabled:bg-gray-50"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl)">
        <h2 className="font-ubuntu mb-4 text-xl font-semibold text-(--heading-colour)">
          Cluster Farmer Application
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input placeholder="Business Name" value={clusterForm.businessName} onChange={(e) => setClusterForm((p) => ({ ...p, businessName: e.target.value }))} className="rounded-lg border border-(--border-input) px-3 py-2" />
          <input placeholder="CAC Number" value={clusterForm.cacNumber} onChange={(e) => setClusterForm((p) => ({ ...p, cacNumber: e.target.value }))} className="rounded-lg border border-(--border-input) px-3 py-2" />
          <input placeholder="Warehouse Location" value={clusterForm.warehouseLocation} onChange={(e) => setClusterForm((p) => ({ ...p, warehouseLocation: e.target.value }))} className="rounded-lg border border-(--border-input) px-3 py-2" />
          <input type="number" placeholder="Distribution Capacity" value={clusterForm.distributionCapacity} onChange={(e) => setClusterForm((p) => ({ ...p, distributionCapacity: Number(e.target.value || 0) }))} className="rounded-lg border border-(--border-input) px-3 py-2" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(
            [
              ["logisticsAvailable", "Logistics Available"],
              ["bvnVerification", "BVN Verification Document"],
              ["proofOfAddress", "Proof Of Address"],
              ["cacRegistration", "CAC Registration"],
              ["businessLicense", "Business License"],
              ["taxClearance", "Tax Clearance"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-(--text-colour)">
              <input
                type="checkbox"
                checked={clusterForm[key]}
                onChange={(e) => setClusterForm((p) => ({ ...p, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>

        <button
          onClick={submitClusterApplication}
          disabled={applying}
          className="mt-5 rounded-xl bg-(--theme-green-dark) px-5 py-2 text-white"
        >
          {applying ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
