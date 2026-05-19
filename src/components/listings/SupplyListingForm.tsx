"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import type { FarmerSupplyListing, SupplyListingFormData } from "~/types";
import {
  FISH_TYPES,
  FISH_TYPE_LABELS,
  MIN_SUPPLY_KG,
  FADE_IN_VARIANT,
  type FishType,
} from "~/types/constants";

const supplyListingSchema = z.object({
  fishType: z.string().min(1, "Fish type is required"),
  harvestDate: z.string().min(1, "Harvest date is required"),
  totalAvailableKg: z.number().min(MIN_SUPPLY_KG, `Minimum supply is ${MIN_SUPPLY_KG}kg`),
  weightKg: z.number().min(0.1, "Weight must be at least 0.1kg"),
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
  const [selectedFishType, setSelectedFishType] = useState(initialData?.fishType ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<SupplyListingFormValues>({
    resolver: zodResolver(supplyListingSchema),
    mode: "onChange",
    defaultValues: initialData
      ? {
          fishType: initialData.fishType,
          harvestDate: new Date(initialData.harvestDate).toISOString().split("T")[0],
          totalAvailableKg: initialData.totalAvailableKg,
          weightKg: initialData.packaging?.[0]?.weightKg ?? 1,
        }
      : { weightKg: 1 },
  });

  const handleFormSubmit = async (data: SupplyListingFormValues) => {
    try {
      await onSubmit({
        fishType: data.fishType,
        harvestDate: new Date(data.harvestDate),
        totalAvailableKg: data.totalAvailableKg,
        weightKg: data.weightKg,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit listing";
      toast.error(message);
    }
  };

  const fishTypeOptions = FISH_TYPES.map((fish) => ({
    label: FISH_TYPE_LABELS[fish as FishType],
    value: fish,
  }));

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
          {...register("totalAvailableKg", { valueAsNumber: true })}
          placeholder={`Minimum ${MIN_SUPPLY_KG}kg`}
          required
        />

        <DynamicInput
          label="Weight per fish (kg)"
          type="number"
          step="0.1"
          error={errors.weightKg?.message}
          {...register("weightKg", { valueAsNumber: true })}
          placeholder="e.g. 1.5"
          required
        />
      </motion.div>

      {/* Info Box */}
      <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl bg-blue-50 p-(--space-lg)">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Pricing note: </span>
          Price per unit is set platform-wide by the admin and applied automatically based on your
          fish type and weight. You do not need to enter a price.
        </p>
      </motion.div>

      {/* Approval note */}
      <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl bg-yellow-50 p-(--space-lg)">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">Note: </span>
          Your listing will be reviewed by a cluster farmer. Once approved, it will appear on the
          marketplace under their name. You will be notified of the approval status.
        </p>
      </motion.div>

      {/* Submit */}
      <motion.div variants={FADE_IN_VARIANT} className="mt-(--submit-button-mt)">
        <SubmitPrimaryButton loading={isLoading} disabled={!isValid || isLoading} type="submit">
          {initialData ? "Update Listing" : "Submit Listing"}
        </SubmitPrimaryButton>
      </motion.div>
    </motion.form>
  );
}
