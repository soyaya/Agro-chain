"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { farmerService } from "~/lib/services/farmer.service";
import { authService, type BackendUser } from "~/lib/services/auth.service";
import { platformService } from "~/lib/services/platform.service";
import { uploadFile } from "~/lib/upload";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";
import { FileUploadField } from "~/components/profile/FileUploadField";
import { LocationPicker, type LocationValue } from "~/components/shared/LocationPicker";
import { LoadingState } from "~/components/ui/LoadingState";
import { FADE_IN_VARIANT, FISH_TYPE_OPTIONS } from "~/types/constants";

// === Types

type ProfileForm = {
  fullName: string;
  phoneNumber: string;
  email: string;
  farmName: string;
  farmAddress: string;
  state: string;
  localGovernment: string;
  ward: string;
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
};

type DocFiles = {
  proofOfAddress: File | null;
  businessLicense: File | null;
  taxClearance: File | null;
};

type DocUrls = {
  proofOfAddress: string;
  businessLicense: string;
  taxClearance: string;
};

// BVN verification document and CAC registration upload were dropped —
// BVN is already confirmed through the existing wallet/BVN verification
// flow, and the CAC number is verified automatically instead of requiring
// a manual certificate upload.
const DOC_FIELDS: { key: keyof DocFiles; label: string }[] = [
  { key: "proofOfAddress", label: "Proof of Address" },
  { key: "businessLicense", label: "CAC Certificate" },
  { key: "taxClearance", label: "Tax Clearance Certificate" },
];

// === Page

export default function FarmerProfilePage() {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [applyingCluster, setApplyingCluster] = useState(false);
  const [wantsCluster, setWantsCluster] = useState(false);
  const [cacVerifying, setCacVerifying] = useState(false);
  const [cacVerified, setCacVerified] = useState(false);
  const [activeStates, setActiveStates] = useState<string[] | undefined>(undefined);

  // Open/close state for each FileUploadField accordion
  const [openDoc, setOpenDoc] = useState<keyof DocFiles | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    phoneNumber: "",
    email: "",
    farmName: "",
    farmAddress: "",
    state: "",
    localGovernment: "",
    ward: "",
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
  });

  // Files held in state — not uploaded yet
  const [docFiles, setDocFiles] = useState<DocFiles>({
    proofOfAddress: null,
    businessLicense: null,
    taxClearance: null,
  });

  // Already-uploaded URLs from a previous application
  const [existingDocUrls, setExistingDocUrls] = useState<Partial<DocUrls>>({});

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

  // Load user
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await authService.getMe();
        const u = res.data.user;
        if (!mounted) return;
        setUser(u);
        setForm({
          fullName: u.full_name ?? "",
          phoneNumber: u.phone_number ?? "",
          email: u.email ?? "",
          farmName: u.farm_name ?? "",
          farmAddress: u.location_address ?? "",
          state: u.location_state ?? "",
          localGovernment: u.location_lga ?? "",
          ward: u.location_ward ?? "",
          fishType: u.fish_type_preference ?? "",
          farmingCapacityKg: Number(u.farming_capacity_kg ?? 0),
          yearsOfExperience: Number(u.years_of_experience ?? 0),
        });
        setClusterForm({
          businessName: u.business_name ?? "",
          cacNumber: u.cac_number ?? "",
          warehouseLocation: u.warehouse_location ?? "",
          distributionCapacity: Number(u.distribution_capacity ?? 0),
          logisticsAvailable: Boolean(u.logistics_available),
        });
        setCacVerified(Boolean(u.cac_verified));
        setExistingDocUrls({
          proofOfAddress: u.proof_of_address_url ?? undefined,
          businessLicense: u.business_license_url ?? undefined,
          taxClearance: u.tax_clearance_url ?? undefined,
        });
        // Pre-expand cluster section if already applied
        if (u.is_cluster_farmer) setWantsCluster(true);
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

  // === Save profile
  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await farmerService.updateProfile({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        farmName: form.farmName,
        farmAddress: form.farmAddress,
        state: form.state,
        localGovernment: form.localGovernment,
        ward: form.ward,
        fishType: form.fishType,
        farmingCapacityKg: form.farmingCapacityKg,
        yearsOfExperience: form.yearsOfExperience,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // === Verify CAC number (replaces the manual certificate upload)
  const verifyCacNumber = async () => {
    if (clusterForm.cacNumber.trim().length < 3) {
      toast.error("Enter a CAC number first.");
      return;
    }
    setCacVerifying(true);
    try {
      const res = await farmerService.verifyCac(clusterForm.cacNumber.trim());
      setCacVerified(res.data.verified);
      if (res.data.verified) {
        toast.success("CAC number verified.");
      } else {
        toast.error(`CAC verification did not pass (status: ${res.data.autorampStatus}).`);
      }
    } catch (error) {
      setCacVerified(false);
      toast.error(error instanceof Error ? error.message : "CAC verification failed.");
    } finally {
      setCacVerifying(false);
    }
  };

  // === Submit cluster application
  // Uploads any new files first, then sends all URLs + text fields as JSON
  const submitClusterApplication = async () => {
    setApplyingCluster(true);
    try {
      // Upload any new files — skip if already have a URL for that doc
      const uploadDoc = async (key: keyof DocFiles): Promise<string | undefined> => {
        const file = docFiles[key];
        if (file) return uploadFile(file);
        return existingDocUrls[key as keyof DocUrls];
      };

      const [poaUrl, licUrl, taxUrl] = await Promise.all([
        uploadDoc("proofOfAddress"),
        uploadDoc("businessLicense"),
        uploadDoc("taxClearance"),
      ]);

      await farmerService.applyForCluster({
        businessName: clusterForm.businessName,
        cacNumber: clusterForm.cacNumber,
        warehouseLocation: clusterForm.warehouseLocation,
        distributionCapacity: clusterForm.distributionCapacity,
        logisticsAvailable: clusterForm.logisticsAvailable,
        proofOfAddress: poaUrl,
        businessLicense: licUrl,
        taxClearance: taxUrl,
      });

      toast.success("Application submitted. Admin will review shortly.");
      // Refresh user to show updated status
      const res = await authService.getMe();
      setUser(res.data.user);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit application");
    } finally {
      setApplyingCluster(false);
    }
  };

  // === Derived state
  const hasApplied = user?.is_cluster_farmer ?? false;
  const isApproved = user?.cluster_approved ?? false;

  const allDocsPresent = DOC_FIELDS.every(
    ({ key }) => docFiles[key] !== null || !!existingDocUrls[key as keyof DocUrls],
  );

  const clusterFormComplete =
    clusterForm.businessName.trim().length >= 2 &&
    clusterForm.cacNumber.trim().length >= 3 &&
    clusterForm.warehouseLocation.trim().length >= 3 &&
    clusterForm.distributionCapacity > 0;

  const canSubmitCluster = allDocsPresent && clusterFormComplete;

  if (loading) return <LoadingState message="Loading profile..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">My Profile</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Manage your farmer profile and cluster application
        </p>
      </motion.div>

      {/* === Profile Section */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-ubuntu text-xl font-semibold text-(--heading-colour)">
            Profile Information
          </h2>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="font-roboto-slab rounded-xl border border-(--border-gray) px-4 py-2 text-sm text-(--text-colour) transition hover:bg-(--bg-pink)"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="font-roboto-slab rounded-xl bg-(--theme-green-dark) px-4 py-2 text-sm text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {savingProfile ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="font-roboto-slab rounded-xl border border-(--border-gray) px-4 py-2 text-sm text-(--text-colour) transition hover:bg-(--bg-pink)"
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(
            [
              ["Full Name", "fullName"],
              ["Phone Number", "phoneNumber"],
              ["Email", "email"],
              ["Farm Name", "farmName"],
              ["Farm Address", "farmAddress"],
            ] as [string, keyof ProfileForm][]
          ).map(([label, key]) => (
            <DynamicInput
              key={key}
              label={label}
              fieldType={key === "email" ? "email" : key === "phoneNumber" ? "tel" : "text"}
              value={String(form[key])}
              disabled={!isEditing}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          ))}

          {/* Fish Type select */}
          <div className="flex flex-col gap-1.5">
            <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
              Fish Type
            </label>
            {isEditing ? (
              <SelectInput
                label=""
                value={form.fishType}
                onValueChange={(v) => setForm((prev) => ({ ...prev, fishType: v }))}
                options={FISH_TYPE_OPTIONS}
              />
            ) : (
              <input
                value={form.fishType}
                disabled
                className="font-roboto-slab w-full rounded-lg border border-(--border-input) px-3 py-2 text-sm disabled:bg-gray-50"
              />
            )}
          </div>

          <DynamicInput
            label="Farming Capacity (kg)"
            value={String(form.farmingCapacityKg)}
            disabled={!isEditing}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, farmingCapacityKg: Number(e.target.value || 0) }))
            }
          />

          <DynamicInput
            label="Years of Experience"
            value={String(form.yearsOfExperience)}
            disabled={!isEditing}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, yearsOfExperience: Number(e.target.value || 0) }))
            }
          />

          {isEditing ? (
            <div className="md:col-span-2">
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
      </motion.div>

      {/* === Cluster Farmer Application Section */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        {/* Trigger checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="wantsCluster"
            checked={wantsCluster}
            onChange={(e) => setWantsCluster(e.target.checked)}
            disabled={hasApplied}
            className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-(--theme-green-dark) focus:ring-2 focus:ring-(--theme-green-dark) disabled:cursor-default"
          />
          <div>
            <label
              htmlFor="wantsCluster"
              className={`font-ubuntu block text-lg font-semibold text-(--heading-colour) ${!hasApplied ? "cursor-pointer" : ""}`}
            >
              Apply to become a Cluster Farmer
            </label>
            <p className="font-roboto-slab mt-0.5 text-sm text-(--text-colour)">
              Cluster farmers aggregate supply from multiple farmers and sell on the marketplace
              under their name.
            </p>
          </div>
        </div>

        {/* Status banner — shown when already applied */}
        <AnimatePresence>
          {hasApplied && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className={`mt-4 flex items-center gap-3 rounded-xl p-4 ${
                  isApproved
                    ? "border border-green-200 bg-green-50"
                    : "border border-yellow-200 bg-yellow-50"
                }`}
              >
                {isApproved ? (
                  <CheckCircle size={20} className="shrink-0 text-green-600" />
                ) : (
                  <Clock size={20} className="shrink-0 text-yellow-600" />
                )}
                <p
                  className={`font-roboto-slab text-sm font-medium ${isApproved ? "text-green-800" : "text-yellow-800"}`}
                >
                  {isApproved
                    ? "Approved — you are a Cluster Farmer. Log out and back in to access your cluster dashboard."
                    : "Application under review. Admin will approve or reject shortly."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Application form — shown when checkbox is checked */}
        <AnimatePresence>
          {wantsCluster && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-6 flex flex-col gap-(--gap-lg)">
                {/* Text fields */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DynamicInput
                    label="Business Name"
                    value={clusterForm.businessName}
                    onChange={(e) =>
                      setClusterForm((p) => ({ ...p, businessName: e.target.value }))
                    }
                    placeholder="Your registered business name"
                    required
                  />
                  <div className="flex flex-col gap-2">
                    <DynamicInput
                      label="CAC Number"
                      value={clusterForm.cacNumber}
                      onChange={(e) => {
                        setClusterForm((p) => ({ ...p, cacNumber: e.target.value }));
                        setCacVerified(false);
                      }}
                      placeholder="CAC registration number"
                      required
                    />
                    <div className="flex items-center gap-2">
                      <SubmitSecondaryButton
                        type="button"
                        onClick={verifyCacNumber}
                        disabled={cacVerifying || cacVerified || clusterForm.cacNumber.trim().length < 3}
                        className="h-9 rounded-full px-4 text-xs"
                      >
                        {cacVerifying ? "Verifying..." : cacVerified ? "Verified" : "Verify CAC"}
                      </SubmitSecondaryButton>
                      {cacVerified && (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle size={14} /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <DynamicInput
                    label="Warehouse Location"
                    value={clusterForm.warehouseLocation}
                    onChange={(e) =>
                      setClusterForm((p) => ({ ...p, warehouseLocation: e.target.value }))
                    }
                    placeholder="Address of your warehouse"
                    required
                  />
                  <DynamicInput
                    label="Distribution Capacity (kg)"
                    value={String(clusterForm.distributionCapacity)}
                    onChange={(e) =>
                      setClusterForm((p) => ({
                        ...p,
                        distributionCapacity: Number(e.target.value || 0),
                      }))
                    }
                    placeholder="Max kg you can distribute"
                    required
                  />
                </div>

                {/* Logistics checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="logisticsAvailable"
                    checked={clusterForm.logisticsAvailable}
                    onChange={(e) =>
                      setClusterForm((p) => ({ ...p, logisticsAvailable: e.target.checked }))
                    }
                    className="h-5 w-5 cursor-pointer rounded border-gray-300 text-(--theme-green-dark) focus:ring-2 focus:ring-(--theme-green-dark)"
                  />
                  <label
                    htmlFor="logisticsAvailable"
                    className="font-roboto-slab cursor-pointer text-sm font-medium text-(--heading-colour)"
                  >
                    I have logistics / transportation available for distribution
                  </label>
                </div>

                {/* Document uploads */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-ubuntu text-base font-semibold text-(--heading-colour)">
                      Required Documents
                    </h3>
                    <span className="font-roboto-slab text-xs text-gray-400">
                      (
                      {
                        DOC_FIELDS.filter(
                          ({ key }) =>
                            docFiles[key] !== null || !!existingDocUrls[key as keyof DocUrls],
                        ).length
                      }
                      /{DOC_FIELDS.length} uploaded)
                    </span>
                  </div>

                  {DOC_FIELDS.map(({ key, label }) => {
                    const hasExisting = !!existingDocUrls[key as keyof DocUrls];
                    const hasNew = docFiles[key] !== null;
                    return (
                      <div key={key}>
                        {/* Show existing URL badge if already uploaded and no new file selected */}
                        {hasExisting && !hasNew && (
                          <div className="mb-1 flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-600" />
                            <span className="font-roboto-slab text-xs text-green-700">
                              Previously uploaded — upload a new file to replace
                            </span>
                          </div>
                        )}
                        <FileUploadField
                          label={label}
                          required={!hasExisting}
                          isOpen={openDoc === key}
                          onToggle={() => setOpenDoc((prev) => (prev === key ? null : key))}
                          onFileChange={(file) => setDocFiles((prev) => ({ ...prev, [key]: file }))}
                          onUploadComplete={(file) =>
                            setDocFiles((prev) => ({ ...prev, [key]: file }))
                          }
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Validation hint */}
                {!canSubmitCluster && (
                  <div className="flex items-center gap-2 rounded-xl bg-yellow-50 p-3">
                    <AlertCircle size={16} className="shrink-0 text-yellow-600" />
                    <p className="font-roboto-slab text-xs text-yellow-800">
                      {!clusterFormComplete
                        ? "Fill in all business fields above."
                        : "Upload all 5 required documents to submit."}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <div className="max-w-sm">
                  {canSubmitCluster ? (
                    <SubmitPrimaryButton
                      loading={applyingCluster}
                      onClick={submitClusterApplication}
                      type="button"
                    >
                      {hasApplied ? "Update Application" : "Submit Application"}
                    </SubmitPrimaryButton>
                  ) : (
                    <SubmitSecondaryButton disabled type="button">
                      {hasApplied ? "Update Application" : "Submit Application"}
                    </SubmitSecondaryButton>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
