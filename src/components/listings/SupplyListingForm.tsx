"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import type { SupplyListingFormData } from "~/types";
import { MIN_SUPPLY_KG, FADE_IN_VARIANT } from "~/types/constants";
import {
  farmerService,
  type ListingFishVariant,
  type ListingPriceCatalog,
  type ListingSeedlingSize,
  type ListingWeightBracket,
} from "~/lib/services/farmer.service";

const FISH_VARIANTS: { label: string; value: ListingFishVariant }[] = [
  { label: "Broodstock", value: "broodstock" },
  { label: "Table Size", value: "table_size" },
  { label: "Dry Fish", value: "dried" },
  { label: "Seedlings", value: "seedlings" },
];

const WEIGHT_BRACKETS: { label: string; value: ListingWeightBracket }[] = [
  { label: "300g – 500g", value: "weight_300_500" },
  { label: "500g – 700g", value: "weight_500_700" },
  { label: "700g – 1kg", value: "weight_700_1000" },
  { label: "1kg – 1.2kg", value: "weight_1000_1200" },
  { label: "1.2kg and above", value: "weight_1200_plus" },
];

const SEEDLING_SIZES: { label: string; value: ListingSeedlingSize }[] = [
  { label: "Juveniles (8–9cm)", value: "juveniles" },
  { label: "Post (10–11cm)", value: "post" },
  { label: "Jumbo (12–15cm)", value: "jumbo" },
];

interface SupplyListingFormProps {
  onSubmit: (data: SupplyListingFormData) => Promise<void>;
  isLoading?: boolean;
}

export function SupplyListingForm({ onSubmit, isLoading = false }: SupplyListingFormProps) {
  const [catalog, setCatalog] = useState<ListingPriceCatalog | null>(null);
  const [fishVariant, setFishVariant] = useState<ListingFishVariant | "">("");
  const [weightBracket, setWeightBracket] = useState<ListingWeightBracket | "">("");
  const [availableKg, setAvailableKg] = useState("");
  const [seedlingSize, setSeedlingSize] = useState<ListingSeedlingSize | "">("");
  const [availablePieces, setAvailablePieces] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [priceAgreementAccepted, setPriceAgreementAccepted] = useState(false);

  useEffect(() => {
    farmerService
      .getListingPrices()
      .then((res) => setCatalog(res.data))
      .catch(() => toast.error("Failed to load current pricing"));
  }, []);

  const isSeedling = fishVariant === "seedlings";

  const currentPrice = useMemo(() => {
    if (!catalog) return null;
    if (isSeedling) {
      const match = catalog.seedlingPrices.find((p) => p.seedlingSize === seedlingSize);
      return match?.pricePerPiece ?? null;
    }
    if (!fishVariant || !weightBracket) return null;
    const match = catalog.bracketPrices.find(
      (p) => p.variant === fishVariant && p.weightBracket === weightBracket,
    );
    return match?.pricePerKg ?? null;
  }, [catalog, isSeedling, fishVariant, weightBracket, seedlingSize]);

  const quantity = isSeedling ? Number(availablePieces) : Number(availableKg);
  const total = currentPrice !== null && quantity > 0 ? currentPrice * quantity : null;

  const canSubmit =
    !!fishVariant &&
    (isSeedling ? !!seedlingSize && Number(availablePieces) > 0 : !!weightBracket && Number(availableKg) >= MIN_SUPPLY_KG) &&
    currentPrice !== null &&
    !!harvestDate &&
    priceAgreementAccepted;

  const handleSubmit = async () => {
    if (!canSubmit || !fishVariant) return;
    try {
      await onSubmit({
        fishVariant,
        weightBracket: isSeedling ? undefined : (weightBracket as ListingWeightBracket),
        availableKg: isSeedling ? undefined : Number(availableKg),
        seedlingSize: isSeedling ? (seedlingSize as ListingSeedlingSize) : undefined,
        availablePieces: isSeedling ? Number(availablePieces) : undefined,
        harvestDate: new Date(harvestDate),
        priceAgreementAccepted,
      });
      toast.success("Listing submitted successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit listing";
      toast.error(message);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
      className="flex w-full flex-col gap-(--gap-lg)"
    >
      {/* Fish Product */}
      <motion.div variants={FADE_IN_VARIANT} className="flex flex-col gap-1.5">
        <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
          Fish Product <span className="text-red-500">*</span>
        </label>
        <SelectInput
          label=""
          value={fishVariant}
          onValueChange={(v) => {
            setFishVariant(v as ListingFishVariant);
            setWeightBracket("");
            setSeedlingSize("");
            setAvailableKg("");
            setAvailablePieces("");
            setPriceAgreementAccepted(false);
          }}
          options={FISH_VARIANTS}
          required
        />
      </motion.div>

      {/* Conditional: seedling vs kg-priced */}
      {fishVariant && (
        <motion.div variants={FADE_IN_VARIANT} className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
          {isSeedling ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                  Seedling Size <span className="text-red-500">*</span>
                </label>
                <SelectInput
                  label=""
                  value={seedlingSize}
                  onValueChange={(v) => {
                    setSeedlingSize(v as ListingSeedlingSize);
                    setPriceAgreementAccepted(false);
                  }}
                  options={SEEDLING_SIZES}
                  required
                />
              </div>
              <DynamicInput
                label="Available Quantity (pieces)"
                type="number"
                value={availablePieces}
                onChange={(e) => setAvailablePieces(e.target.value)}
                placeholder="e.g. 500"
                required
              />
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                  Weight Range <span className="text-red-500">*</span>
                </label>
                <SelectInput
                  label=""
                  value={weightBracket}
                  onValueChange={(v) => {
                    setWeightBracket(v as ListingWeightBracket);
                    setPriceAgreementAccepted(false);
                  }}
                  options={WEIGHT_BRACKETS}
                  required
                />
              </div>
              <DynamicInput
                label="Available Quantity (kg)"
                type="number"
                value={availableKg}
                onChange={(e) => setAvailableKg(e.target.value)}
                placeholder={`Minimum ${MIN_SUPPLY_KG}kg`}
                required
              />
            </>
          )}
        </motion.div>
      )}

      {/* Harvest Date */}
      <motion.div variants={FADE_IN_VARIANT} className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2">
        <DynamicInput
          label="Harvest Date"
          type="date"
          value={harvestDate}
          onChange={(e) => setHarvestDate(e.target.value)}
          required
        />
      </motion.div>

      {/* Price summary */}
      {fishVariant && (isSeedling ? seedlingSize : weightBracket) && (
        <motion.div
          variants={FADE_IN_VARIANT}
          className="rounded-2xl border border-(--border-gray) bg-(--gray-bg) p-(--space-md)"
        >
          {currentPrice === null ? (
            <p className="font-roboto-slab text-sm text-(--text-colour)">
              No admin-regulated price has been set for this combination yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="font-roboto-slab text-sm text-(--text-colour)">
                ₦{currentPrice.toLocaleString()} per {isSeedling ? "piece" : "kg"}
              </p>
              {total !== null && (
                <p className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                  Estimated Total: ₦{total.toLocaleString()}
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Price Agreement */}
      {fishVariant && (isSeedling ? seedlingSize : weightBracket) && (
        <motion.div
          variants={FADE_IN_VARIANT}
          className="flex items-start gap-(--space-md) rounded-2xl border border-(--border-gray) p-(--space-lg)"
        >
          <input
            type="checkbox"
            id="priceAgreement"
            checked={priceAgreementAccepted}
            onChange={(e) => setPriceAgreementAccepted(e.target.checked)}
            disabled={currentPrice === null}
            className="mt-0.5 h-5 w-5 cursor-pointer rounded border-gray-300 text-(--theme-green-dark) focus:ring-2 focus:ring-(--theme-green-dark) disabled:cursor-not-allowed"
          />
          <label htmlFor="priceAgreement" className="font-roboto-slab text-sm text-(--text-colour)">
            {currentPrice !== null
              ? `I agree to the current admin-regulated price of ₦${currentPrice.toLocaleString()} per ${isSeedling ? "piece" : "kg"} for this product.`
              : "No admin-regulated price has been set for this combination yet — you cannot submit until one is set."}
          </label>
        </motion.div>
      )}

      {/* Information Box */}
      <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl bg-blue-50 p-(--space-lg)">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Note: </span>
          Your listing will be reviewed by a cluster farmer. Once approved, it will appear on
          the marketplace under their name. You will be notified of the approval status.
        </p>
      </motion.div>

      {/* Submit Button */}
      <motion.div variants={FADE_IN_VARIANT} className="mt-(--submit-button-mt)">
        <SubmitPrimaryButton
          loading={isLoading}
          disabled={!canSubmit || isLoading}
          onClick={handleSubmit}
          type="button"
        >
          Submit Listing
        </SubmitPrimaryButton>
      </motion.div>
    </motion.div>
  );
}
