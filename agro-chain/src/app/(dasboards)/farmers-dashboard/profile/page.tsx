"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Save, X, User, Mail, Phone, MapPin, Fish, TrendingUp, Building2, FileText, MapPinned, Truck } from "lucide-react";
import { toast } from "sonner";
import { ProfileAvatar } from "~/components/profile/ProfileAvatar";
import { FileUploadField } from "~/components/profile/FileUploadField";
import type { FarmerProfile } from "~/types/index";
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

// Mock data - replace with actual API call
const mockFarmerProfile: FarmerProfile = {
  id: "1",
  userId: "user-1",
  fullName: "John Doe",
  phoneNumber: "08012345678",
  email: "john.doe@example.com",
  occupation: "Farmer",
  farmName: "Green Valley Fish Farm",
  farmAddress: "123 Farm Road, Kaduna",
  state: "Kaduna",
  localGovernment: "Kaduna North",
  fishType: "Catfish",
  farmingCapacityKg: 5000,
  yearsOfExperience: 10,
  profileImage: undefined,
  isClusterFarmer: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

type ClusterFarmerDocuments = {
  bvnVerification: File | null;
  proofOfAddress: File | null;
  cacRegistration: File | null;
  businessLicense: File | null;
  taxClearance: File | null;
};

export default function FarmerProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<FarmerProfile>(mockFarmerProfile);
  const [isLoading, setIsLoading] = useState(false);
  
  // Editable form state
  const [formData, setFormData] = useState({
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
  });
  
  const [profileImage, setProfileImage] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>(profile.profileImage);
  
  // Cluster farmer application state
  const [showClusterApplication, setShowClusterApplication] = useState(false);
  const [isClusterInterested, setIsClusterInterested] = useState(false);
  const [clusterFormData, setClusterFormData] = useState({
    businessName: "",
    cacNumber: "",
    warehouseLocation: "",
    distributionCapacity: 0,
    logisticsAvailable: false,
  });
  
  const [clusterDocuments, setClusterDocuments] = useState<ClusterFarmerDocuments>({
    bvnVerification: null,
    proofOfAddress: null,
    cacRegistration: null,
    businessLicense: null,
    taxClearance: null,
  });
  
  const [openUploadFields, setOpenUploadFields] = useState<Record<string, boolean>>({});

  const handleImageChange = (file: File) => {
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const updatedProfile: FarmerProfile = {
        ...profile,
        ...formData,
        profileImage: imagePreview,
        updatedAt: new Date(),
      };
      
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClusterApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate all required documents are uploaded
      const requiredDocs = ['bvnVerification', 'proofOfAddress', 'cacRegistration', 'businessLicense'] as const;
      const missingDocs = requiredDocs.filter(doc => !clusterDocuments[doc]);
      
      if (missingDocs.length > 0) {
        toast.error("Please upload all required documents");
        setIsLoading(false);
        return;
      }
      
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log("Cluster farmer application submitted:", {
        ...clusterFormData,
        documents: clusterDocuments,
      });
      
      toast.success("Cluster farmer application submitted successfully! We'll review it shortly.");
      setShowClusterApplication(false);
      setIsClusterInterested(false);
    } catch (error) {
      toast.error("Failed to submit application");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUploadField = (fieldName: string) => {
    setOpenUploadFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

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
          <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">
            My Profile
          </h1>
          <p className="font-roboto-slab text-(--text-colour)">
            Manage your farmer profile information
          </p>
        </div>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <div className="flex items-center justify-between mb-(--space-xl)">
          <h2 className="font-ubuntu text-xl font-semibold text-(--heading-colour)">
            Profile Information
          </h2>
          <button
            onClick={() => {
              if (isEditing) {
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
                });
                setImagePreview(profile.profileImage);
              }
              setIsEditing(!isEditing);
            }}
            className="flex items-center gap-2 rounded-xl border border-(--border-gray) bg-(--white) px-(--space-lg) py-(--space-sm) font-roboto-slab text-sm font-medium text-(--heading-colour) cursor-pointer ease-in-out transition-all duration-300 hover:bg-(--bg-pink) focus:ring-2 focus:ring-(--border-gray) focus:ring-offset-2 focus:outline-none"
          >
            {isEditing ? (
              <>
                <X size={18} />
                Cancel
              </>
            ) : (
              <>
                <Edit2 size={18} />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleProfileSubmit}>
          {/* Profile Avatar */}
          <div className="flex justify-center mb-(--space-xl)">
            <ProfileAvatar
              imageUrl={imagePreview}
              name={formData.fullName || "User"}
              size="lg"
              editable={isEditing}
              onImageChange={handleImageChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-(--space-lg) md:grid-cols-2">
            {/* Full Name */}
            <div>
              <label className="font-roboto-slab mb-2 flex items-center gap-2 text-sm font-medium text-(--heading-colour)">
                <User size={16} />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                  required
                />
              ) : (
                <p className="font-roboto-slab text-base text-(--heading-colour)">{profile.fullName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="font-roboto-slab mb-2 flex items-center gap-2 text-sm font-medium text-(--heading-colour)">
                <Phone size={16} />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                  required
                />
              ) : (
                <p className="font-roboto-slab text-base text-(--heading-colour)">{profile.phoneNumber}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="font-roboto-slab mb-2 flex items-center gap-2 text-sm font-medium text-(--heading-colour)">
                <Mail size={16} />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                  required
                />
              ) : (
                <p className="font-roboto-slab text-base text-(--heading-colour)">{profile.email}</p>
              )}
            </div>

            {/* Farm Name */}
            <div>
              <label className="font-roboto-slab mb-2 flex items-center gap-2 text-sm font-medium text-(--heading-colour)">
                <Building2 size={16} />
                Farm Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                  required
                />
              ) : (
                <p className="font-roboto-slab text-base text-(--heading-colour)">{profile.farmName}</p>
              )}
            </div>

            {/* Farm Address */}
            <div className="md:col-span-2">
              <label className="font-roboto-slab mb-2 flex items-center gap-2 text-sm font-medium text-(--heading-colour)">
                <MapPin size={16} />
                Farm Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.farmAddress}
                  onChange={(e) => setFormData({ ...formData, farmAddress: e.target.value })}
                  className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                  required
                />
              ) : (
                <p className="font-roboto-slab text-base text-(--heading-colour)">{profile.farmAddress}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="font-roboto-slab mb-2 flex items-center gap-2 text-sm font-medium text-(--heading-colour)">
                <MapPinned size={16} />
                State
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                  required
                />
              ) : (
                <p className="font-roboto-slab text-base text-(--heading-colour)">{profile.state}</p>
              )}
            </div>

            {/* Local Government */}
            <div>
              <label className="font-roboto-slab mb-2 flex items-center gap-2 text-sm font-medium text-(--heading-colour)">
                <MapPinned size={16} />
                Local Government
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.localGovernment}
                  onChange={(e) => setFormData({ ...formData, localGovernment: e.target.value })}
                  className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                  required
                />
              ) : (
                <p className="font-roboto-slab text-base text-(--heading-colour)">{profile.localGovernment}</p>
              )}
            </div>

            {/* Fish Type */}
            <div>
              <label className="font-roboto-slab mb-2 flex items-center gap-2 text-sm font-medium text-(--heading-colour)">
                <Fish size={16} />
                Fish Type
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fishType}
                  onChange={(e) => setFormData({ ...formData, fishType: e.target.value })}
                  className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                  required
                />
              ) : (
                <p className="font-roboto-slab text-base text-(--heading-colour)">{profile.fishType}</p>
              )}
            </div>

            {/* Farming Capacity */}
            <div>
              <label className="font-roboto-slab mb-2 flex items-center gap-2 text-sm font-medium text-(--heading-colour)">
                <TrendingUp size={16} />
                Farming Capacity (kg)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.farmingCapacityKg}
                  onChange={(e) => setFormData({ ...formData, farmingCapacityKg: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                  required
                />
              ) : (
                <p className="font-roboto-slab text-base text-(--heading-colour)">{profile.farmingCapacityKg.toLocaleString()} kg</p>
              )}
            </div>

            {/* Years of Experience */}
            <div>
              <label className="font-roboto-slab mb-2 flex items-center gap-2 text-sm font-medium text-(--heading-colour)">
                <TrendingUp size={16} />
                Years of Experience
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                  required
                />
              ) : (
                <p className="font-roboto-slab text-base text-(--heading-colour)">{profile.yearsOfExperience} years</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          {isEditing && (
            <div className="mt-(--space-xl)">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-(--theme-green-dark) px-(--space-xl) py-(--space-lg) font-roboto-slab font-medium text-white cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-(--theme-green-dark) focus:ring-offset-2 focus:outline-none"
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
            </div>
          )}
        </form>
      </motion.div>

      {/* Cluster Farmer Application Section */}
      {!profile.isClusterFarmer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
        >
          <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
            Become a Cluster Farmer
          </h2>
          
          <div className="flex items-start gap-(--space-md) mb-(--space-lg)">
            <input
              type="checkbox"
              id="clusterInterest"
              checked={isClusterInterested}
              onChange={(e) => {
                setIsClusterInterested(e.target.checked);
                setShowClusterApplication(e.target.checked);
              }}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-(--theme-green-dark) focus:ring-2 focus:ring-(--theme-green-dark) cursor-pointer ease-in-out transition-all duration-300"
            />
            <div className="flex-1">
              <label
                htmlFor="clusterInterest"
                className="font-roboto-slab block text-base font-medium text-(--heading-colour) cursor-pointer"
              >
                I&apos;m interested in becoming a Cluster Farmer
              </label>
              <p className="font-roboto-slab mt-1 text-sm text-gray-600">
                Cluster farmers can aggregate produce from multiple farmers and manage distribution to buyers. This requires additional verification and documentation.
              </p>
            </div>
          </div>

          {/* Animated Cluster Application Form */}
          <AnimatePresence>
            {showClusterApplication && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <motion.form
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  exit={{ y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleClusterApplicationSubmit}
                  className="mt-(--space-lg) rounded-xl border border-blue-200 bg-blue-50/30 p-(--space-lg)"
                >
                  <h3 className="font-ubuntu mb-(--space-lg) text-lg font-semibold text-(--heading-colour)">
                    Cluster Farmer Application
                  </h3>

                  {/* Business Information */}
                  <div className="grid grid-cols-1 gap-(--space-lg) md:grid-cols-2 mb-(--space-xl)">
                    <div>
                      <label className="font-roboto-slab mb-2 block text-sm font-medium text-(--heading-colour)">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={clusterFormData.businessName}
                        onChange={(e) => setClusterFormData({ ...clusterFormData, businessName: e.target.value })}
                        className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-roboto-slab mb-2 block text-sm font-medium text-(--heading-colour)">
                        CAC Registration Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={clusterFormData.cacNumber}
                        onChange={(e) => setClusterFormData({ ...clusterFormData, cacNumber: e.target.value })}
                        className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-roboto-slab mb-2 block text-sm font-medium text-(--heading-colour)">
                        Warehouse Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={clusterFormData.warehouseLocation}
                        onChange={(e) => setClusterFormData({ ...clusterFormData, warehouseLocation: e.target.value })}
                        className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-roboto-slab mb-2 block text-sm font-medium text-(--heading-colour)">
                        Distribution Capacity (kg) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={clusterFormData.distributionCapacity}
                        onChange={(e) => setClusterFormData({ ...clusterFormData, distributionCapacity: parseInt(e.target.value) })}
                        className="w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) font-roboto-slab focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-start gap-(--space-md)">
                        <input
                          type="checkbox"
                          id="logisticsAvailable"
                          checked={clusterFormData.logisticsAvailable}
                          onChange={(e) => setClusterFormData({ ...clusterFormData, logisticsAvailable: e.target.checked })}
                          className="mt-1 h-5 w-5 rounded border-gray-300 text-(--theme-green-dark) focus:ring-2 focus:ring-(--theme-green-dark) cursor-pointer ease-in-out transition-all duration-300"
                        />
                        <label
                          htmlFor="logisticsAvailable"
                          className="font-roboto-slab flex items-center gap-2 text-sm font-medium text-(--heading-colour) cursor-pointer"
                        >
                          <Truck size={16} />
                          I have logistics/transportation available for distribution
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="mb-(--space-xl)">
                    <h4 className="font-ubuntu mb-(--space-md) text-base font-semibold text-(--heading-colour)">
                      Required Documents
                    </h4>
                    <div className="flex flex-col gap-(--space-md)">
                      <FileUploadField
                        label="BVN Verification"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSizeMB={5}
                        required
                        isOpen={openUploadFields['bvnVerification'] || false}
                        onToggle={() => toggleUploadField('bvnVerification')}
                        onFileChange={(file) => setClusterDocuments({ ...clusterDocuments, bvnVerification: file })}
                        onUploadComplete={(file) => setClusterDocuments({ ...clusterDocuments, bvnVerification: file })}
                      />
                      
                      <FileUploadField
                        label="Proof of Address"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSizeMB={5}
                        required
                        isOpen={openUploadFields['proofOfAddress'] || false}
                        onToggle={() => toggleUploadField('proofOfAddress')}
                        onFileChange={(file) => setClusterDocuments({ ...clusterDocuments, proofOfAddress: file })}
                        onUploadComplete={(file) => setClusterDocuments({ ...clusterDocuments, proofOfAddress: file })}
                      />
                      
                      <FileUploadField
                        label="CAC Registration Certificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSizeMB={5}
                        required
                        isOpen={openUploadFields['cacRegistration'] || false}
                        onToggle={() => toggleUploadField('cacRegistration')}
                        onFileChange={(file) => setClusterDocuments({ ...clusterDocuments, cacRegistration: file })}
                        onUploadComplete={(file) => setClusterDocuments({ ...clusterDocuments, cacRegistration: file })}
                      />
                      
                      <FileUploadField
                        label="Business License"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSizeMB={5}
                        required
                        isOpen={openUploadFields['businessLicense'] || false}
                        onToggle={() => toggleUploadField('businessLicense')}
                        onFileChange={(file) => setClusterDocuments({ ...clusterDocuments, businessLicense: file })}
                        onUploadComplete={(file) => setClusterDocuments({ ...clusterDocuments, businessLicense: file })}
                      />
                      
                      <FileUploadField
                        label="Tax Clearance Certificate (Optional)"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSizeMB={5}
                        isOpen={openUploadFields['taxClearance'] || false}
                        onToggle={() => toggleUploadField('taxClearance')}
                        onFileChange={(file) => setClusterDocuments({ ...clusterDocuments, taxClearance: file })}
                        onUploadComplete={(file) => setClusterDocuments({ ...clusterDocuments, taxClearance: file })}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-(--theme-green-dark) px-(--space-xl) py-(--space-lg) font-roboto-slab font-medium text-white cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-(--theme-green-dark) focus:ring-offset-2 focus:outline-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting Application...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FileText size={20} />
                        Submit Cluster Farmer Application
                      </span>
                    )}
                  </button>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
