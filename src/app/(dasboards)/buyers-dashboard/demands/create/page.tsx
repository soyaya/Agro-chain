"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { buyerService } from "~/lib/services/buyer.service";
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";

// === Schema

const FISH_TYPES = [
  { label: "Catfish", value: "catfish" },
  { label: "Fingerlings", value: "fingerlings" },
  { label: "Juveniles", value: "juveniles" },
  { label: "Table Size", value: "table_size" },
  { label: "Jumbo", value: "jumbo" },
  { label: "Parent Stocks", value: "parent_stocks" },
];

const FISH_VARIANTS = [
  { label: "Dried", value: "dried" },
  { label: "Jumbo", value: "jumbo" },
  { label: "Table Size", value: "table_size" },
  { label: "Broodstock", value: "broodstock" },
];

const createDemandSchema = z.object({
  fishType: z.string().min(1, "Fish type is required"),
  weightKg: z
    .number({ error: "Weight must be a number" })
    .positive("Weight must be greater than 0")
    .max(10000, "Weight cannot exceed 10,000 kg"),
  fishVariant: z.string().min(1, "Fish variant is required"),
  locationState: z.string().min(1, "State is required"),
  locationLga: z.string().min(1, "LGA is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

type CreateDemandForm = z.infer<typeof createDemandSchema>;

// === Page

export default function CreateDemandPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CreateDemandForm>({
    resolver: zodResolver(createDemandSchema),
    mode: "onChange",
    defaultValues: { fishType: "", fishVariant: "", locationState: "", locationLga: "" },
  });

  const fishType = watch("fishType");
  const fishVariant = watch("fishVariant");
  const locationState = watch("locationState");
  const locationLga = watch("locationLga");

  const onSubmit = async (data: CreateDemandForm) => {
    setSubmitting(true);
    try {
      await buyerService.createDemand({
        fishType: data.fishType,
        weightKg: data.weightKg,
        fishVariant: data.fishVariant,
        locationState: data.locationState,
        locationLga: data.locationLga,
        deliveryAddress: data.deliveryAddress,
        notes: data.notes,
      });
      toast.success("Demand submitted! Admin will assign a cluster farmer shortly.");
      router.push("/buyers-dashboard/demands");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit demand");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Header */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-(--gap-base)"
      >
        <button
          onClick={() => router.back()}
          className="font-roboto-slab flex w-fit items-center gap-2 text-sm text-(--text-colour) transition hover:text-(--heading-colour)"
        >
          <ArrowLeft size={18} />
          Back to Demands
        </button>
        <div>
          <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Create Demand</h1>
          <p className="font-roboto-slab mt-1 text-(--text-colour)">
            Request any weight of fish — even less than 1kg. Admin will assign a cluster farmer to
            fulfill it.
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        variants={SLIDE_UP_VARIANT}
        initial="hidden"
        animate="visible"
        className="rounded-3xl border border-(--border-gray) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-(--gap-lg)">
          {/* Fish Type + Variant */}
          <div className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                Fish Type <span className="text-red-500">*</span>
              </label>
              <SelectInput
                label=""
                value={fishType}
                onValueChange={(v) => setValue("fishType", v, { shouldValidate: true })}
                options={FISH_TYPES}
                required
              />
              {errors.fishType && (
                <p className="font-roboto-slab text-xs text-red-500">{errors.fishType.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                Fish Variant <span className="text-red-500">*</span>
              </label>
              <SelectInput
                label=""
                value={fishVariant}
                onValueChange={(v) => setValue("fishVariant", v, { shouldValidate: true })}
                options={FISH_VARIANTS}
                required
              />
              {errors.fishVariant && (
                <p className="font-roboto-slab text-xs text-red-500">
                  {errors.fishVariant.message}
                </p>
              )}
            </div>
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1.5">
            <DynamicInput
              label="Weight (kg)"
              placeholder="e.g. 0.5 for half a kg, 2 for 2kg"
              error={errors.weightKg?.message}
              {...register("weightKg", { valueAsNumber: true })}
              required
            />
            <p className="font-roboto-slab text-xs text-gray-500">
              You can request any amount — there is no minimum weight.
            </p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
            <DynamicInput
              label="State"
              placeholder="e.g. Kaduna"
              error={errors.locationState?.message}
              {...register("locationState")}
              required
            />
            <DynamicInput
              label="LGA"
              placeholder="e.g. Kaduna South"
              error={errors.locationLga?.message}
              {...register("locationLga")}
              required
            />
          </div>

          {/* Delivery Address */}
          <DynamicInput
            label="Delivery Address"
            placeholder="Full delivery address"
            error={errors.deliveryAddress?.message}
            {...register("deliveryAddress")}
            required
          />

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
              Additional Notes <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              {...register("notes")}
              placeholder="Any specific requirements, preferred delivery time, etc."
              rows={3}
              className="font-roboto-slab w-full rounded-2xl border border-(--border-input) p-(--space-md) text-sm text-(--text-colour) transition outline-none focus:border-(--border-gray)"
            />
            {errors.notes && (
              <p className="font-roboto-slab text-xs text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="mx-auto w-full max-w-sm">
            {isValid ? (
              <SubmitPrimaryButton loading={submitting} type="submit">
                Submit Demand
              </SubmitPrimaryButton>
            ) : (
              <SubmitSecondaryButton disabled type="button">
                Submit Demand
              </SubmitSecondaryButton>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
