"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, MapPin, FileSignature } from "lucide-react";
import { toast } from "sonner";
import { authService, type BackendUser } from "~/lib/services/auth.service";
import { supplyAdminService, type SupplyAdminContract } from "~/lib/services/supply-admin.service";
import { platformService } from "~/lib/services/platform.service";
import { DynamicInput } from "~/components/dynamic-input";
import { LocationPicker, type LocationValue } from "~/components/shared/LocationPicker";
import { LoadingState } from "~/components/ui/LoadingState";
import { SLIDE_UP_VARIANT } from "~/types/constants";

type LocationForm = {
  locationState: string;
  locationLga: string;
  locationWard: string;
  subCommunity: string;
  latitude?: number;
  longitude?: number;
  locationAddress: string;
};

export default function SupplyAdminProfilePage() {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [contract, setContract] = useState<SupplyAdminContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeStates, setActiveStates] = useState<string[] | undefined>(undefined);
  const [form, setForm] = useState<LocationForm>({
    locationState: "",
    locationLga: "",
    locationWard: "",
    subCommunity: "",
    locationAddress: "",
  });

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
        const [meRes, contractRes] = await Promise.all([
          authService.getMe(),
          supplyAdminService.getMyContract().catch(() => null),
        ]);
        if (!mounted) return;
        setUser(meRes.data.user);
        setContract(contractRes?.data.contract ?? null);
        setForm({
          locationState: meRes.data.user.location_state ?? "",
          locationLga: meRes.data.user.location_lga ?? "",
          locationWard: meRes.data.user.location_ward ?? "",
          subCommunity: meRes.data.user.location_sub_community ?? "",
          locationAddress: meRes.data.user.location_address ?? "",
        });
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

  const save = async () => {
    setSaving(true);
    try {
      await supplyAdminService.updateProfile({
        fullName: user?.full_name,
        locationState: form.locationState,
        locationLga: form.locationLga,
        locationWard: form.locationWard,
        locationSubCommunity: form.subCommunity,
        latitude: form.latitude,
        longitude: form.longitude,
        locationAddress: form.locationAddress,
      });
      setUser((prev) =>
        prev
          ? {
              ...prev,
              location_state: form.locationState,
              location_lga: form.locationLga,
              location_ward: form.locationWard,
              location_sub_community: form.subCommunity,
              location_address: form.locationAddress,
            }
          : prev,
      );
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

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
      <motion.div
        variants={SLIDE_UP_VARIANT}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Profile</h1>
          <p className="font-roboto-slab text-(--text-colour)">Your Supply Admin account details.</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="rounded-xl border border-(--border-gray) px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-(--theme-green-dark) px-4 py-2 text-sm text-white"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="rounded-xl border border-(--border-gray) px-4 py-2 text-sm">
            Edit
          </button>
        )}
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

        {editing ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DynamicInput
              label="Address"
              value={form.locationAddress}
              onChange={(e) => setForm((prev) => ({ ...prev, locationAddress: e.target.value }))}
            />
            <div className="sm:col-span-2">
              <LocationPicker
                value={{
                  state: form.locationState,
                  lga: form.locationLga,
                  ward: form.locationWard,
                  subCommunity: form.subCommunity,
                }}
                onChange={(next: LocationValue) =>
                  setForm((prev) => ({
                    ...prev,
                    locationState: next.state,
                    locationLga: next.lga,
                    locationWard: next.ward,
                    subCommunity: next.subCommunity,
                    latitude: next.latitude,
                    longitude: next.longitude,
                  }))
                }
                activeStates={activeStates}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="font-roboto-slab text-xs text-gray-400">Phone Number</p>
              <p className="font-roboto-slab text-(--heading-colour)">{user.phone_number}</p>
            </div>
            <div>
              <p className="font-roboto-slab text-xs text-gray-400">Region</p>
              <p className="font-roboto-slab flex items-center gap-1 text-(--heading-colour)">
                <MapPin size={14} className="text-gray-400" />
                {[user.location_sub_community, user.location_ward, user.location_lga, user.location_state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        )}
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
