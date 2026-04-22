"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { PackagingSelector } from "./PackagingSelector";
import type { FarmerSupplyListing, SupplyListingFormData, PackagingOption } from "~/types";
import {
  FISH_TYPES,
  MIN_SUPPLY_KG,
  FADE_IN_VARIANT,
} from "~/types/constants";

const supplyListingSchema = z.object({
  fishType: z.string().min(1, "Fish type is required"),
  harvestDate: z.string().min(1, "Harvest date is required"),
  totalAvailableKg: z
    .number()
    .min(MIN_SUPPLY_KG, `Minimum supply is ${MIN_SUPPLY_KG}kg`),
});

type SupplyListingFormValues = z.infer<typeof supplyListingSchema>;

interface SupplyListingFormProps {
  initialData?: FarmerSupplyListing;
  onSubmit: (data: SupplyListingFormData) => Promise<void>;
  isLoading?: boolean;
}

export function SupplyListingForm({
  initialData,
  onSubmit,
  isLoading = false,
}: SupplyListingFormProps) {
  const [packaging, setPackaging] = useState<PackagingOption[]>(
    initialData?.packaging || []
  );
  const [packagingError, setPackagingError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<SupplyListingFormValues>({
    resolver: zodResolver(supplyListingSchema),
    mode: "onChange",
    defaultValues: initialData
      ? {
          fishType: initialData.fishType,
          harvestDate: new Date(initialData.harvestDate)
            .toISOString()
            .split("T")[0],
          totalAvailableKg: initialData.totalAvailableKg,
        }
      : undefined,
  });

  // Use getValues instead of watch to avoid React Compiler warnings
  const [selectedFishType, setSelectedFishType] = useState(initialData?.fishType || "");
  const [totalKg, setTotalKg] = useState(initialData?.totalAvailableKg || 0);

  const handleFormSubmit = async (data: SupplyListingFormValues) => {
    if (packaging.length === 0) {
      setPackagingError("Please add at least one packaging option");
      return;
    }

    setPackagingError("");

    try {
      await onSubmit({
        fishType: data.fishType,
        harvestDate: new Date(data.harvestDate),
        totalAvailableKg: data.totalAvailableKg,
        packaging,
      });
      toast.success("Listing submitted successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit listing";
      toast.error(message);
    }
  };

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
      {/* Basic Information */}
      <motion.div
        variants={FADE_IN_VARIANT}
        className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2"
      >
        <SelectInput
          label="Fish Type"
          value={selectedFishType}
          onValueChange={(value) => {
            setValue("fishType", value, { shouldValidate: true });
            setSelectedFishType(value);
          }}
          options={fishTypeOptions}
          error={errors.fishType?.message}
          required
        />

        <DynamicInput
          label="Harvest Date"
          type="date"
          error={errors.harvestDate?.message}
          {...register("harvestDate")}
          required
        />

        <DynamicInput
          label="Total Available (kg)"
          type="number"
          error={errors.totalAvailableKg?.message}
          {...register("totalAvailableKg", { 
            valueAsNumber: true,
            onChange: (e) => setTotalKg(Number(e.target.value) || 0)
          })}
          placeholder={`Minimum ${MIN_SUPPLY_KG}kg`}
          required
        />
      </motion.div>

      {/* Packaging Selector */}
      <motion.div variants={FADE_IN_VARIANT}>
        <PackagingSelector
          totalKg={totalKg}
          packaging={packaging}
          onChange={setPackaging}
          error={packagingError}
        />
      </motion.div>

      {/* Information Box */}
      <motion.div
        variants={FADE_IN_VARIANT}
        className="rounded-2xl bg-blue-50 p-(--space-lg)"
      >
        <p className="text-sm text-blue-800">
          <span className="font-medium">Note: </span>
          Your listing will be reviewed by a cluster farmer. Once approved, it
          will appear on the marketplace under their name. You will be notified
          of the approval status.
        </p>
      </motion.div>

      {/* Submit Button */}
      <motion.div variants={FADE_IN_VARIANT} className="mt-(--submit-button-mt)">
        <SubmitPrimaryButton
          loading={isLoading}
          disabled={!isValid || isLoading || packaging.length === 0}
          type="submit"
        >
          {initialData ? "Update Listing" : "Submit Listing"}
        </SubmitPrimaryButton>
      </motion.div>
    </motion.form>
  );
}
