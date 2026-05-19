"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import type { PackagingOption } from "~/types";
import {
  FISH_TYPES,
  NIGERIAN_STATES,
  DELIVERY_OPTIONS,
  MIN_SUPPLY_KG,
  FADE_IN_VARIANT,
  SLIDE_UP_VARIANT,
} from "~/types/constants";

const schema = z.object({
  fishType: z.string().min(1, "Fish type is required"),
  harvestDate: z.string().min(1, "Harvest date is required"),
  totalAvailableKg: z.number().min(MIN_SUPPLY_KG, `Minimum supply is ${MIN_SUPPLY_KG}kg`),
  location: z.string().min(3, "Location is required"),
  state: z.string().min(1, "State is required"),
  localGovernment: z.string().min(2, "Local government is required"),
  visibleOnMarketplace: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

type DeliveryOptionValue = (typeof DELIVERY_OPTIONS)[number];

export default function CreateClusterListingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [packaging, setPackaging] = useState<PackagingOption[]>([]);
  const [packagingError, setPackagingError] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOptionValue[]>([]);
  const [deliveryError, setDeliveryError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { visibleOnMarketplace: true },
  });

  const visibleOnMarketplace = watch("visibleOnMarketplace");

  const addPackaging = () => {
    setPackaging((prev) => [...prev, { weightKg: 1, quantity: 0 }]);
    setPackagingError("");
  };

  const removePackaging = (index: number) => {
    setPackaging((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePackaging = (index: number, field: keyof PackagingOption, value: number) => {
    setPackaging((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const toggleDelivery = (option: DeliveryOptionValue) => {
    setSelectedDelivery((prev) =>
      prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option],
    );
    setDeliveryError("");
  };

  const onSubmit = async (data: FormValues) => {
    if (packaging.length === 0) {
      setPackagingError("Add at least one packaging option");
      return;
    }
    if (selectedDelivery.length === 0) {
      setDeliveryError("Select at least one delivery option");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Cluster listing:", { ...data, packaging, deliveryOptions: selectedDelivery });
      toast.success("Listing submitted for review!");
      router.push("/cluster-dashboard/listings");
    } catch {
      toast.error("Failed to submit listing");
    } finally {
      setIsLoading(false);
    }
  };

  const fishTypeOptions = FISH_TYPES.map((f) => ({ label: f, value: f }));
  const stateOptions = NIGERIAN_STATES.map((s) => ({ label: s, value: s }));

  return (
    <div className="min-h-screen bg-(--gray-bg)">
      <div className="container-max-width px-(--section-px) py-(--section-py) sm:px-(--section-px-sm) sm:py-(--section-py-sm) lg:px-(--section-px-lg) lg:py-(--section-py-lg)">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
          className="flex flex-col gap-(--section-gap)"
        >
          {/* Header */}
          <motion.div variants={FADE_IN_VARIANT} className="flex flex-col gap-(--gap-base)">
            <button
              onClick={() => router.back()}
              className="flex w-fit items-center gap-2 text-(--text-colour) transition hover:text-(--heading-colour)"
            >
              <ArrowLeft size={20} />
              Back to Listings
            </button>
            <div>
              <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour) lg:text-4xl">
                Create Marketplace Listing
              </h1>
              <p className="font-roboto-slab mt-2 text-(--text-colour)">
                List your aggregated fish supply on the marketplace
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            variants={SLIDE_UP_VARIANT}
            className="rounded-3xl bg-(--white) p-(--space-xl) shadow-sm lg:p-(--section-gap)"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-(--gap-lg)">
              {/* Supply Details */}
              <div>
                <h2 className="font-ubuntu mb-(--space-lg) text-lg font-semibold text-(--heading-colour)">
                  Supply Details
                </h2>
                <div className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2">
                  <SelectInput
                    label="Fish Type"
                    value={watch("fishType") ?? ""}
                    onValueChange={(v) => setValue("fishType", v, { shouldValidate: true })}
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
                    placeholder={`Minimum ${MIN_SUPPLY_KG}kg`}
                    error={errors.totalAvailableKg?.message}
                    {...register("totalAvailableKg", { valueAsNumber: true })}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="font-ubuntu mb-(--space-lg) text-lg font-semibold text-(--heading-colour)">
                  Location
                </h2>
                <div className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2">
                  <div className="md:col-span-2">
                    <DynamicInput
                      label="Warehouse / Pickup Location"
                      type="text"
                      placeholder="e.g. Km 5, Sagamu-Ore Expressway"
                      error={errors.location?.message}
                      {...register("location")}
                      required
                    />
                  </div>
                  <SelectInput
                    label="State"
                    value={watch("state") ?? ""}
                    onValueChange={(v) => setValue("state", v, { shouldValidate: true })}
                    options={stateOptions}
                    error={errors.state?.message}
                    required
                  />
                  <DynamicInput
                    label="Local Government"
                    type="text"
                    placeholder="e.g. Ijebu Ode"
                    error={errors.localGovernment?.message}
                    {...register("localGovernment")}
                    required
                  />
                </div>
              </div>

              {/* Packaging Options */}
              <div>
                <div className="mb-(--space-lg) flex items-center justify-between">
                  <h2 className="font-ubuntu text-lg font-semibold text-(--heading-colour)">
                    Packaging Options
                  </h2>
                  <button
                    type="button"
                    onClick={addPackaging}
                    className="font-roboto-slab flex items-center gap-1.5 rounded-xl border border-(--border-gray) px-(--space-lg) py-(--space-sm) text-sm font-medium text-(--heading-colour) transition hover:bg-(--bg-pink)"
                  >
                    <Plus size={16} />
                    Add Option
                  </button>
                </div>

                {packaging.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-(--border-gray) p-(--space-xl) text-center">
                    <p className="font-roboto-slab text-sm text-(--text-colour)">
                      No packaging options added yet. Click &quot;Add Option&quot; to start.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-(--gap-base)">
                    <AnimatePresence>
                      {packaging.map((pkg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="grid grid-cols-2 gap-(--gap-base) rounded-2xl border border-(--border-gray) p-(--space-lg)"
                        >
                          <div>
                            <label className="font-roboto-slab mb-1.5 block text-xs font-medium text-(--heading-colour)">
                              Weight (kg)
                            </label>
                            <input
                              type="number"
                              value={pkg.weightKg}
                              min={1}
                              onChange={(e) =>
                                updatePackaging(i, "weightKg", Number(e.target.value))
                              }
                              className="font-roboto-slab w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) text-sm focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                            />
                          </div>
                          <div className="relative">
                            <label className="font-roboto-slab mb-1.5 block text-xs font-medium text-(--heading-colour)">
                              Quantity
                            </label>
                            <input
                              type="number"
                              value={pkg.quantity}
                              min={0}
                              onChange={(e) =>
                                updatePackaging(i, "quantity", Number(e.target.value))
                              }
                              className="font-roboto-slab w-full rounded-lg border border-(--border-input) px-(--space-md) py-(--space-sm) text-sm focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removePackaging(i)}
                              className="absolute -top-2 -right-2 rounded-full bg-red-50 p-1 text-red-500 transition hover:bg-red-100"
                              aria-label="Remove packaging option"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                {packagingError && (
                  <p className="font-roboto-slab mt-2 text-sm text-red-500">{packagingError}</p>
                )}
              </div>

              {/* Delivery Options */}
              <div>
                <h2 className="font-ubuntu mb-(--space-lg) text-lg font-semibold text-(--heading-colour)">
                  Delivery Options
                </h2>
                <div className="flex flex-wrap gap-(--gap-base)">
                  {DELIVERY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleDelivery(option)}
                      className={`font-roboto-slab rounded-xl border px-(--space-lg) py-(--space-sm) text-sm font-medium transition ${
                        selectedDelivery.includes(option)
                          ? "border-(--theme-green-dark) bg-green-50 text-(--theme-green-dark)"
                          : "border-(--border-gray) bg-(--white) text-(--heading-colour) hover:bg-(--bg-pink)"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {deliveryError && (
                  <p className="font-roboto-slab mt-2 text-sm text-red-500">{deliveryError}</p>
                )}
              </div>

              {/* Marketplace Visibility */}
              <div className="flex items-start gap-(--space-md) rounded-2xl border border-(--border-gray) p-(--space-lg)">
                <button
                  type="button"
                  onClick={() => setValue("visibleOnMarketplace", !visibleOnMarketplace)}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                    visibleOnMarketplace
                      ? "border-(--theme-green-dark) bg-(--theme-green-dark)"
                      : "border-(--border-gray) bg-(--white)"
                  }`}
                  aria-label="Toggle marketplace visibility"
                >
                  {visibleOnMarketplace && (
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    {visibleOnMarketplace ? (
                      <Eye size={16} className="text-(--theme-green-dark)" />
                    ) : (
                      <EyeOff size={16} className="text-gray-400" />
                    )}
                    <span className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                      Visible on marketplace
                    </span>
                  </div>
                  <p className="font-roboto-slab mt-1 text-xs text-(--text-colour)">
                    When enabled, this listing will be publicly visible to buyers on the marketplace
                    after approval.
                  </p>
                </div>
              </div>

              {/* Info box */}
              <div className="rounded-2xl bg-blue-50 p-(--space-lg)">
                <p className="font-roboto-slab text-sm text-blue-800">
                  <span className="font-medium">Pricing note: </span>
                  Price per unit is set platform-wide by the admin based on fish type and weight.
                  You do not need to enter a price.
                </p>
              </div>

              <SubmitPrimaryButton
                loading={isLoading}
                disabled={!isValid || isLoading}
                type="submit"
              >
                Submit Listing
              </SubmitPrimaryButton>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
