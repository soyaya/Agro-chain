"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { ProfileAvatar } from "./ProfileAvatar";
import type { FarmerProfile, FarmerProfileFormData } from "~/types";
import {
  FISH_TYPES,
  NIGERIAN_STATES,
  MIN_FARMING_CAPACITY_KG,
  MIN_YEARS_EXPERIENCE,
  MAX_YEARS_EXPERIENCE,
  PHONE_REGEX,
  FADE_IN_VARIANT,
} from "~/types/constants";

const farmerProfileSchema = z
  .object({
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    phoneNumber: z.string().regex(PHONE_REGEX, "Invalid Nigerian phone number"),
    email: z.string().email("Invalid email address"),
    farmName: z.string().min(3, "Farm name must be at least 3 characters"),
    farmAddress: z.string().min(5, "Farm address is required"),
    state: z.string().min(1, "State is required"),
    localGovernment: z.string().min(1, "Local government is required"),
    fishType: z.string().min(1, "Fish type is required"),
    farmingCapacityKg: z
      .number()
      .min(
        MIN_FARMING_CAPACITY_KG,
        `Minimum capacity is ${MIN_FARMING_CAPACITY_KG}kg`,
      ),
    yearsOfExperience: z
      .number()
      .min(MIN_YEARS_EXPERIENCE, "Experience cannot be negative")
      .max(MAX_YEARS_EXPERIENCE, `Maximum ${MAX_YEARS_EXPERIENCE} years`),
    isClusterFarmer: z.boolean().optional(),
    businessName: z.string().optional(),
    cacNumber: z.string().optional(),
    warehouseLocation: z.string().optional(),
    distributionCapacity: z.number().optional(),
    logisticsAvailable: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.isClusterFarmer) {
        return (
          data.businessName &&
          data.businessName.length >= 3 &&
          data.cacNumber &&
          data.cacNumber.length >= 5 &&
          data.warehouseLocation &&
          data.warehouseLocation.length >= 5 &&
          data.distributionCapacity &&
          data.distributionCapacity > 0
        );
      }
      return true;
    },
    {
      message:
        "All cluster farmer fields are required when applying to be a cluster farmer",
      path: ["businessName"],
    },
  );

type FarmerProfileFormValues = z.infer<typeof farmerProfileSchema>;

interface FarmerProfileFormProps {
  initialData?: FarmerProfile;
  onSubmit: (data: FarmerProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

export function FarmerProfileForm({
  initialData,
  onSubmit,
  isLoading = false,
}: FarmerProfileFormProps) {
  const [profileImage, setProfileImage] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    initialData?.profileImage,
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    setValue,
  } = useForm<FarmerProfileFormValues>({
    resolver: zodResolver(farmerProfileSchema),
    mode: "onChange",
    defaultValues: initialData
      ? {
          fullName: initialData.fullName,
          phoneNumber: initialData.phoneNumber,
          email: initialData.email,
          farmName: initialData.farmName,
          farmAddress: initialData.farmAddress,
          state: initialData.state,
          localGovernment: initialData.localGovernment,
          fishType: initialData.fishType,
          farmingCapacityKg: initialData.farmingCapacityKg,
          yearsOfExperience: initialData.yearsOfExperience,
          isClusterFarmer: initialData.isClusterFarmer || false,
        }
      : {
          isClusterFarmer: false,
        },
  });

  const selectedState = useWatch({ control, name: "state" });
  const selectedFishType = useWatch({ control, name: "fishType" });
  const isClusterFarmer = useWatch({ control, name: "isClusterFarmer" });
  const fullName = useWatch({ control, name: "fullName" });

  const handleImageChange = (file: File) => {
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (data: FarmerProfileFormValues) => {
    try {
      await onSubmit({
        ...data,
        profileImage,
      });
      toast.success("Profile saved successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save profile";
      toast.error(message);
    }
  };

  const stateOptions = NIGERIAN_STATES.map((state) => ({
    label: state,
    value: state,
  }));

  const fishTypeOptions = FISH_TYPES.map((fish) => ({
    label: fish,
    value: fish,
  }));

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex w-full flex-col gap-(--gap-lg)"
    >
      {/* Profile Image */}
      <motion.div variants={FADE_IN_VARIANT} className="flex justify-center">
        <ProfileAvatar
          imageUrl={imagePreview}
          name={fullName || "User"}
          size="lg"
          editable
          onImageChange={handleImageChange}
        />
      </motion.div>

      {/* Personal Information */}
      <motion.div
        variants={FADE_IN_VARIANT}
        className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2"
      >
        <DynamicInput
          label="Full Name"
          error={errors.fullName?.message}
          {...register("fullName")}
          required
        />

        <DynamicInput
          fieldType="tel"
          label="Phone Number"
          error={errors.phoneNumber?.message}
          {...register("phoneNumber")}
          placeholder="08012345678"
          required
        />

        <DynamicInput
          fieldType="email"
          label="Email Address"
          error={errors.email?.message}
          {...register("email")}
          required
        />

        <DynamicInput
          label="Farm Name"
          error={errors.farmName?.message}
          {...register("farmName")}
          required
        />
      </motion.div>

      {/* Farm Details */}
      <motion.div
        variants={FADE_IN_VARIANT}
        className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2"
      >
        <SelectInput
          label="State"
          value={selectedState}
          onValueChange={(value) =>
            setValue("state", value, { shouldValidate: true })
          }
          options={stateOptions}
          error={errors.state?.message}
          required
        />

        <DynamicInput
          label="Local Government"
          error={errors.localGovernment?.message}
          {...register("localGovernment")}
          required
        />

        <DynamicInput
          label="Farm Address"
          error={errors.farmAddress?.message}
          {...register("farmAddress")}
          required
        />

        <SelectInput
          label="Fish Type"
          value={selectedFishType}
          onValueChange={(value) =>
            setValue("fishType", value, { shouldValidate: true })
          }
          options={fishTypeOptions}
          error={errors.fishType?.message}
          required
        />

        <DynamicInput
          label="Farming Capacity (kg)"
          type="number"
          error={errors.farmingCapacityKg?.message}
          {...register("farmingCapacityKg", { valueAsNumber: true })}
          required
        />

        <DynamicInput
          label="Years of Experience"
          type="number"
          error={errors.yearsOfExperience?.message}
          {...register("yearsOfExperience", { valueAsNumber: true })}
          required
        />
      </motion.div>

      {/* Cluster Farmer Section */}
      <motion.div
        variants={FADE_IN_VARIANT}
        className="border-input-border bg-gray-bg rounded-xl border p-(--space-lg)"
      >
        <div className="flex items-start gap-(--space-md)">
          <input
            type="checkbox"
            id="isClusterFarmer"
            {...register("isClusterFarmer")}
            className="text-theme-green-dark focus:ring-theme-green-dark border-gray-border mt-1 h-5 w-5 rounded transition-all duration-300 ease-in-out hover:cursor-pointer focus:ring-2"
          />
          <div className="flex-1">
            <label
              htmlFor="isClusterFarmer"
              className="font-roboto-slab text-heading-colour block text-base font-medium hover:cursor-pointer"
            >
              I&apos;m interested in becoming a Cluster Farmer
            </label>
            <p className="font-roboto-slab text-text-colour mt-1 text-sm">
              Cluster farmers can aggregate produce from multiple farmers and
              manage distribution to buyers
            </p>
          </div>
        </div>

        {/* Animated Cluster Farmer Fields */}
        <AnimatePresence>
          {isClusterFarmer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-(--space-lg) grid grid-cols-1 gap-(--gap-base) md:grid-cols-2"
              >
                <DynamicInput
                  label="Business Name"
                  error={errors.businessName?.message}
                  {...register("businessName")}
                  placeholder="Enter your business name"
                  required={isClusterFarmer}
                />

                <DynamicInput
                  label="CAC Registration Number"
                  error={errors.cacNumber?.message}
                  {...register("cacNumber")}
                  placeholder="Enter CAC number"
                  required={isClusterFarmer}
                />

                <DynamicInput
                  label="Warehouse Location"
                  error={errors.warehouseLocation?.message}
                  {...register("warehouseLocation")}
                  placeholder="Enter warehouse address"
                  required={isClusterFarmer}
                />

                <DynamicInput
                  label="Distribution Capacity (kg)"
                  type="number"
                  error={errors.distributionCapacity?.message}
                  {...register("distributionCapacity", { valueAsNumber: true })}
                  placeholder="Enter distribution capacity"
                  required={isClusterFarmer}
                />

                <div className="md:col-span-2">
                  <div className="flex items-start gap-(--space-md)">
                    <input
                      type="checkbox"
                      id="logisticsAvailable"
                      {...register("logisticsAvailable")}
                      className="text-theme-green-dark focus:ring-theme-green-dark border-gray-border mt-1 h-5 w-5 rounded transition-all duration-300 ease-in-out hover:cursor-pointer focus:ring-2"
                    />
                    <label
                      htmlFor="logisticsAvailable"
                      className="font-roboto-slab text-heading-colour block text-sm font-medium hover:cursor-pointer"
                    >
                      I have logistics/transportation available for distribution
                    </label>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        variants={FADE_IN_VARIANT}
        className="mt-(--submit-button-mt)"
      >
        <SubmitPrimaryButton
          loading={isLoading}
          disabled={!isValid || isLoading}
          type="submit"
        >
          {initialData ? "Update Profile" : "Create Profile"}
        </SubmitPrimaryButton>
      </motion.div>
    </motion.form>
  );
}
