"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Save, X, MapPin, Phone, Mail, Building, Package } from "lucide-react";
import { toast } from "sonner";
import { ProfileAvatar } from "~/components/profile/ProfileAvatar";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import type { BuyerProfile } from "~/types";
import { NIGERIAN_STATES, BUSINESS_TYPES, FADE_IN_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";

// Mock data - replace with actual API call
const mockProfile: BuyerProfile = {
  id: "buyer-1",
  userId: "user-1",
  fullName: "John Smith",
  companyName: "Smith Trading Company",
  phoneNumber: "08012345678",
  email: "john.smith@example.com",
  deliveryAddress: "123 Main Street, Kaduna North",
  state: "Kaduna",
  localGovernment: "Kaduna North",
  businessType: "Wholesale Distributor",
  purchaseVolumeEstimate: 5000,
  profileImage: undefined,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-03-01"),
};

export default function BuyerProfilePage() {
  const [profile, setProfile] = useState<BuyerProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editedProfile, setEditedProfile] = useState<BuyerProfile>(profile);

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProfile(editedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading profile..." size="lg" />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-ubuntu mb-2 text-3xl font-bold text-gray-900">Buyer Profile</h1>
          <p className="font-roboto-slab text-gray-600">
            Manage your business information and preferences
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="font-roboto-slab flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="font-roboto-slab flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="font-roboto-slab flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Avatar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-(--white) p-6">
            <ProfileAvatar
              name={isEditing ? editedProfile.fullName : profile.fullName}
              imageUrl={isEditing ? editedProfile.profileImage : profile.profileImage}
              size="lg"
              editable={isEditing}
              onImageChange={(file) => {
                // TODO: Handle image upload
                toast.success("Profile image updated");
              }}
            />

            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="font-ubuntu mb-4 text-lg font-semibold text-gray-900">Quick Stats</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-roboto-slab text-sm text-gray-600">Total Orders</span>
                  <span className="font-ubuntu font-semibold text-gray-900">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-roboto-slab text-sm text-gray-600">Saved Listings</span>
                  <span className="font-ubuntu font-semibold text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-roboto-slab text-sm text-gray-600">Member Since</span>
                  <span className="font-ubuntu font-semibold text-gray-900">
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-gray-200 bg-(--white) p-8"
              >
                <h2 className="font-ubuntu mb-6 text-xl font-semibold text-gray-900">
                  Business Information
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Mail size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-roboto-slab mb-1 text-sm text-gray-600">Email</p>
                      <p className="font-roboto-slab font-medium text-gray-900">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Phone size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-roboto-slab mb-1 text-sm text-gray-600">Phone</p>
                      <p className="font-roboto-slab font-medium text-gray-900">
                        {profile.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Building size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-roboto-slab mb-1 text-sm text-gray-600">Company Name</p>
                      <p className="font-roboto-slab font-medium text-gray-900">
                        {profile.companyName || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Package size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-roboto-slab mb-1 text-sm text-gray-600">Business Type</p>
                      <p className="font-roboto-slab font-medium text-gray-900">
                        {profile.businessType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:col-span-2">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <MapPin size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-roboto-slab mb-1 text-sm text-gray-600">
                        Delivery Address
                      </p>
                      <p className="font-roboto-slab font-medium text-gray-900">
                        {profile.deliveryAddress}
                      </p>
                      <p className="font-roboto-slab mt-1 text-sm text-gray-600">
                        {profile.localGovernment}, {profile.state}
                      </p>
                    </div>
                  </div>

                  {profile.purchaseVolumeEstimate && (
                    <div className="flex items-start gap-3 md:col-span-2">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <Package size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-roboto-slab mb-1 text-sm text-gray-600">
                          Estimated Monthly Purchase Volume
                        </p>
                        <p className="font-roboto-slab font-medium text-gray-900">
                          {profile.purchaseVolumeEstimate.toLocaleString()} kg
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-gray-200 bg-(--white) p-8"
              >
                <h2 className="font-ubuntu mb-6 text-xl font-semibold text-gray-900">
                  Edit Business Information
                </h2>

                <div className="flex flex-col gap-6">
                  <DynamicInput
                    label="Full Name"
                    value={editedProfile.fullName}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, fullName: e.target.value })
                    }
                    required
                  />

                  <DynamicInput
                    label="Company Name"
                    value={editedProfile.companyName || ""}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, companyName: e.target.value })
                    }
                  />

                  <DynamicInput
                    fieldType="email"
                    label="Email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    required
                  />

                  <DynamicInput
                    fieldType="tel"
                    label="Phone Number"
                    value={editedProfile.phoneNumber}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, phoneNumber: e.target.value })
                    }
                    required
                  />

                  <SelectInput
                    label="Business Type"
                    value={editedProfile.businessType}
                    onValueChange={(value) =>
                      setEditedProfile({ ...editedProfile, businessType: value })
                    }
                    options={BUSINESS_TYPES.map((type) => ({ label: type, value: type }))}
                    required
                  />

                  <DynamicInput
                    label="Delivery Address"
                    value={editedProfile.deliveryAddress}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, deliveryAddress: e.target.value })
                    }
                    required
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <SelectInput
                      label="State"
                      value={editedProfile.state}
                      onValueChange={(value) =>
                        setEditedProfile({ ...editedProfile, state: value })
                      }
                      options={NIGERIAN_STATES.map((state) => ({ label: state, value: state }))}
                      required
                    />

                    <DynamicInput
                      label="Local Government"
                      value={editedProfile.localGovernment}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, localGovernment: e.target.value })
                      }
                      required
                    />
                  </div>

                  <DynamicInput
                    label="Estimated Monthly Purchase Volume (kg)"
                    type="number"
                    value={editedProfile.purchaseVolumeEstimate || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        purchaseVolumeEstimate: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
