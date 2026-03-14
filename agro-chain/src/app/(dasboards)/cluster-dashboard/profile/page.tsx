"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2, Save, X, User, Mail, Phone, MapPin, Fish, TrendingUp,
  Building2, FileText, MapPinned, Truck, Warehouse, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ProfileAvatar } from "~/components/profile/ProfileAvatar";
import type { ClusterFarmerProfile, ApplicationStatus } from "~/types/index";
import { FADE_IN_VARIANT } from "~/types/constants";

// Mock data - TODO: Replace with actual API call
const mockClusterProfile: ClusterFarmerProfile = {
  id: "1",
  userId: "user-1",
  fullName: "Emeka Okonkwo",
  phoneNumber: "08023456789",
  email: "emeka.okonkwo@example.com",
  occupation: "Farmer",
  farmName: "Okonkwo Aquaculture Hub",
  farmAddress: "45 Cluster Road, Ogun State",
  state: "Ogun",
  localGovernment: "Ijebu Ode",
  fishType: "Catfish",
  farmingCapacityKg: 15000,
  yearsOfExperience: 12,
  profileImage: undefined,
  isClusterFarmer: true,
  businessName: "Okonkwo Fish Distributors Ltd",
  cacNumber: "RC-1234567",
  warehouseLocation: "Km 5, Sagamu-Ore Expressway, Ogun State",
  distributionCapacity: 50000,
  logisticsAvailable: true,
  verificationStatus: "approved",
  createdAt: new Date(),
  updatedAt: new Date(),
};

type ProfileFormData = {
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
  businessName: string;
  cacNumber: string;
  warehouseLocation: string;
  distributionCapacity: number;
  logisticsAvailable: boolean;
};

function VerificationBadge({ status }: { status: ApplicationStatus }) {
  const config = {
    approved: { icon: CheckCircle2, label: "Verified", className: "bg-green-50 text-green-700 border-green-200" },
    pending: { icon: Clock, label: "Pending Review", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    rejected: { icon: XCircle, label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
  }[status];

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${config.className}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
}

export default function ClusterProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ClusterFarmerProfile>(mockClusterProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(profile.profileImage);

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: profile.fullName,
    phoneNumber: profile.phoneNumber,
    email: profile.email,
    farmName: profile.farmName,
    farmAddress: profile.farmAddress,
    state: profile.state,
    localGovernment: profile.localGovernment,
    fishType: profile.fishType,
    farmingCapacityKg: profile.farmingCapacityKg,
    yearsOfExperience: profile.yearsOfExperience,
    businessName: profile.businessName,
    cacNumber: profile.cacNumber,
    warehouseLocation: profile.warehouseLocation,
    distributionCapacity: profile.distributionCapacity,
    logisticsAvailable: profile.logisticsAvailable,
  });

  const handleImageChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      email: profile.email,
      farmName: profile.farmName,
      farmAddress: profile.farmAddress,
      state: profile.state,
      localGovernment: profile.localGovernment,
      fishType: profile.fishType,
      farmingCapacityKg: profile.farmingCapacityKg,
      yearsOfExperience: profile.yearsOfExperience,
      businessName: profile.businessName,
      cacNumber: profile.cacNumber,
      warehouseLocation: profile.warehouseLocation,
      distributionCapacity: profile.distributionCapacity,
      logisticsAvailable: profile.logisticsAvailable,
    });
    setImagePreview(profile.profileImage);
    setIsEditing(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProfile({ ...profile, ...formData, profileImage: imagePreview, updatedAt: new Date() });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const field = (
    label: string,
    icon: React.ReactNode,
    key: keyof ProfileFormData,
    type: "text" | "tel" | "email" | "number" = "text",
    colSpan?: "full"
  ) => (
    <div className={colSpan === "full" ? "md:col-span-2" : ""}>
      <label className="font-roboto-slab mb-2 flex items-center gap-2 text-sm font-medium text-(--heading-colour)">
        {icon}
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={formData[key] as string | number}
          onChange={(e) =>
            setFormData({
              ...formData,
              [key]: type === "number" ? parseInt(e.target.value) || 0 : e.target.value,
            })
          }
          className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
          required
        />
      ) : (
        <p className="font-roboto-slab text-base text-(--heading-colour)">
          {type === "number"
            ? `${(formData[key] as number).toLocaleString()} ${key === "farmingCapacityKg" || key === "distributionCapacity" ? "kg" : ""}`
            : (formData[key] as string)}
          {key === "yearsOfExperience" ? " years" : ""}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">My Profile</h1>
          <p className="font-roboto-slab text-(--text-colour)">Manage your cluster farmer profile</p>
        </div>
        <VerificationBadge status={profile.verificationStatus} />
      </motion.div>

      {/* Profile Card */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <div className="mb-(--space-xl) flex items-center justify-between">
          <h2 className="font-ubuntu text-xl font-semibold text-(--heading-colour)">Profile Information</h2>
          <button
            onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
            className="flex items-center gap-2 rounded-xl border border-(--border-gray) bg-(--white) px-(--space-lg) py-(--space-sm) font-roboto-slab text-sm font-medium text-(--heading-colour) cursor-pointer ease-in-out transition-all duration-300 hover:bg-(--bg-pink)"
          >
            {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
          </button>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div className="mb-(--space-xl) flex justify-center">
            <ProfileAvatar
              imageUrl={imagePreview}
              name={formData.fullName || "User"}
              size="lg"
              editable={isEditing}
              onImageChange={handleImageChange}
            />
          </div>

          {/* Personal Info */}
          <h3 className="font-ubuntu mb-(--space-lg) text-base font-semibold text-(--heading-colour)">Personal Information</h3>
          <div className="mb-(--space-xl) grid grid-cols-1 gap-(--space-lg) md:grid-cols-2">
            {field("Full Name", <User size={16} />, "fullName")}
            {field("Phone Number", <Phone size={16} />, "phoneNumber", "tel")}
            {field("Email Address", <Mail size={16} />, "email", "email")}
            {field("Farm Name", <Building2 size={16} />, "farmName")}
            {field("Farm Address", <MapPin size={16} />, "farmAddress", "text", "full")}
            {field("State", <MapPinned size={16} />, "state")}
            {field("Local Government", <MapPinned size={16} />, "localGovernment")}
            {field("Fish Type", <Fish size={16} />, "fishType")}
            {field("Farming Capacity (kg)", <TrendingUp size={16} />, "farmingCapacityKg", "number")}
            {field("Years of Experience", <TrendingUp size={16} />, "yearsOfExperience", "number")}
          </div>

          {/* Business Info */}
          <h3 className="font-ubuntu mb-(--space-lg) text-base font-semibold text-(--heading-colour)">Business Information</h3>
          <div className="mb-(--space-xl) grid grid-cols-1 gap-(--space-lg) md:grid-cols-2">
            {field("Business Name", <Building2 size={16} />, "businessName")}
            {field("CAC Registration Number", <FileText size={16} />, "cacNumber")}
            {field("Warehouse Location", <Warehouse size={16} />, "warehouseLocation", "text", "full")}
            {field("Distribution Capacity (kg)", <TrendingUp size={16} />, "distributionCapacity", "number")}

            <div className="md:col-span-2">
              <div className="flex items-start gap-(--space-md)">
                {isEditing ? (
                  <input
                    type="checkbox"
                    id="logisticsAvailable"
                    checked={formData.logisticsAvailable}
                    onChange={(e) => setFormData({ ...formData, logisticsAvailable: e.target.checked })}
                    className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-(--theme-green-dark) focus:ring-2 focus:ring-(--theme-green-dark) ease-in-out transition-all duration-300"
                  />
                ) : (
                  <span className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center ${formData.logisticsAvailable ? "bg-green-100" : "bg-gray-100"}`}>
                    {formData.logisticsAvailable
                      ? <CheckCircle2 size={14} className="text-green-600" />
                      : <X size={14} className="text-gray-400" />}
                  </span>
                )}
                <label
                  htmlFor="logisticsAvailable"
                  className="font-roboto-slab flex items-center gap-2 text-sm font-medium text-(--heading-colour) cursor-pointer"
                >
                  <Truck size={16} />
                  Logistics/transportation available for distribution
                </label>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-(--theme-green-dark) px-(--space-xl) py-(--space-lg) font-roboto-slab font-medium text-white cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Save size={20} />
                      Save Profile
                    </span>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}
