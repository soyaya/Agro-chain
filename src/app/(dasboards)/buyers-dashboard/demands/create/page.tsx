"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  buyerService,
  type DemandBracketVariant,
  type DemandFishVariant,
  type DemandPriceCatalog,
  type DemandWeightBracket,
  type SeedlingSize,
} from "~/lib/services/buyer.service";
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";

// === Options

const FISH_VARIANTS: { label: string; value: DemandFishVariant }[] = [
  { label: "Broodstock", value: "broodstock" },
  { label: "Table Size", value: "table_size" },
  { label: "Dry Fish", value: "dried" },
  { label: "Seedlings", value: "seedlings" },
];

const WEIGHT_BRACKETS: { label: string; value: DemandWeightBracket }[] = [
  { label: "300g – 500g", value: "weight_300_500" },
  { label: "500g – 700g", value: "weight_500_700" },
  { label: "700g – 1kg", value: "weight_700_1000" },
  { label: "1kg – 1.2kg", value: "weight_1000_1200" },
  { label: "1.2kg and above", value: "weight_1200_plus" },
];

const SEEDLING_SIZES: { label: string; value: SeedlingSize }[] = [
  { label: "Juveniles (8–9cm)", value: "juveniles" },
  { label: "Post (10–11cm)", value: "post" },
  { label: "Jumbo (12–15cm)", value: "jumbo" },
];

const FULFILLMENT_OPTIONS = [
  { label: "Pickup", value: "pickup" },
  { label: "Delivery", value: "delivery" },
];

// === Page

export default function CreateDemandPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [catalog, setCatalog] = useState<DemandPriceCatalog | null>(null);

  const [fishVariant, setFishVariant] = useState<DemandFishVariant | "">("");
  const [weightBracket, setWeightBracket] = useState<DemandWeightBracket | "">("");
  const [quantityKg, setQuantityKg] = useState("");
  const [seedlingSize, setSeedlingSize] = useState<SeedlingSize | "">("");
  const [quantityPieces, setQuantityPieces] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"pickup" | "delivery">("pickup");
  const [locationState, setLocationState] = useState("Kaduna");
  const [locationLga, setLocationLga] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await buyerService.getDemandPrices();
        setCatalog(res.data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load prices");
      }
    };
    void load();
  }, []);

  const isSeedling = fishVariant === "seedlings";

  const pricePerUnit = useMemo(() => {
    if (!catalog) return null;
    if (isSeedling) {
      const match = catalog.seedlingPrices.find((p) => p.seedlingSize === seedlingSize);
      return match?.pricePerPiece ?? null;
    }
    if (!fishVariant || !weightBracket) return null;
    const match = catalog.bracketPrices.find(
      (p) => p.variant === (fishVariant as DemandBracketVariant) && p.weightBracket === weightBracket,
    );
    return match?.pricePerKg ?? null;
  }, [catalog, isSeedling, fishVariant, weightBracket, seedlingSize]);

  const quantity = isSeedling ? Number(quantityPieces) : Number(quantityKg);
  const total = pricePerUnit !== null && quantity > 0 ? pricePerUnit * quantity : null;

  const canSubmit =
    !!fishVariant &&
    (isSeedling ? !!seedlingSize && Number(quantityPieces) > 0 : !!weightBracket && Number(quantityKg) > 0) &&
    pricePerUnit !== null &&
    !!locationLga &&
    !!deliveryAddress;

  const handleSubmit = async () => {
    if (!canSubmit || !fishVariant) return;
    setSubmitting(true);
    try {
      const created = await buyerService.createDemand({
        fishVariant,
        weightBracket: isSeedling ? undefined : (weightBracket as DemandWeightBracket),
        quantityKg: isSeedling ? undefined : Number(quantityKg),
        seedlingSize: isSeedling ? (seedlingSize as SeedlingSize) : undefined,
        quantityPieces: isSeedling ? Number(quantityPieces) : undefined,
        fulfillmentMethod,
        locationState,
        locationLga,
        deliveryAddress,
        notes: notes || undefined,
      });

      const demandId = created.data.demand.id;
      toast.success("Demand created. Paying escrow...");

      try {
        await buyerService.payDemandWithWallet(demandId);
        toast.success("Payment successful. Your demand is now live.");
      } catch (payError) {
        toast.error(
          payError instanceof Error
            ? `Demand created, but payment failed: ${payError.message}`
            : "Demand created, but payment failed. Pay from My Demands.",
        );
      }

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
            Request fish at admin-regulated prices. Pay the escrow to make your demand live.
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
        <div className="flex flex-col gap-(--gap-lg)">
          {/* Fish Type (fixed for now) + Variant */}
          <div className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                Fish Type
              </label>
              <div className="font-roboto-slab flex h-11 items-center rounded-2xl border border-(--border-input) px-(--space-md) text-sm text-(--text-colour)">
                Catfish
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                Fish Product <span className="text-red-500">*</span>
              </label>
              <SelectInput
                label=""
                value={fishVariant}
                onValueChange={(v) => {
                  setFishVariant(v as DemandFishVariant);
                  setWeightBracket("");
                  setSeedlingSize("");
                  setQuantityKg("");
                  setQuantityPieces("");
                }}
                options={FISH_VARIANTS}
                required
              />
            </div>
          </div>

          {/* Conditional: seedling vs kg-priced */}
          {fishVariant && (
            <div className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
              {isSeedling ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                      Seedling Size <span className="text-red-500">*</span>
                    </label>
                    <SelectInput
                      label=""
                      value={seedlingSize}
                      onValueChange={(v) => setSeedlingSize(v as SeedlingSize)}
                      options={SEEDLING_SIZES}
                      required
                    />
                  </div>
                  <DynamicInput
                    label="Quantity (pieces)"
                    placeholder="e.g. 100"
                    value={quantityPieces}
                    onChange={(e) => setQuantityPieces(e.target.value)}
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
                      onValueChange={(v) => setWeightBracket(v as DemandWeightBracket)}
                      options={WEIGHT_BRACKETS}
                      required
                    />
                  </div>
                  <DynamicInput
                    label="Quantity (kg)"
                    placeholder="e.g. 10"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    required
                  />
                </>
              )}
            </div>
          )}

          {/* Price summary */}
          {fishVariant && (
            <div className="rounded-2xl border border-(--border-gray) bg-(--gray-bg) p-(--space-md)">
              {pricePerUnit === null ? (
                <p className="font-roboto-slab text-sm text-(--text-colour)">
                  Select a {isSeedling ? "seedling size" : "weight range"} to see the price.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="font-roboto-slab text-sm text-(--text-colour)">
                    ₦{pricePerUnit.toLocaleString()} per {isSeedling ? "piece" : "kg"}
                  </p>
                  {total !== null && (
                    <p className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                      Total: ₦{total.toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Fulfillment */}
          <div className="flex flex-col gap-1.5">
            <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
              Fulfillment Method <span className="text-red-500">*</span>
            </label>
            <SelectInput
              label=""
              value={fulfillmentMethod}
              onValueChange={(v) => setFulfillmentMethod(v as "pickup" | "delivery")}
              options={FULFILLMENT_OPTIONS}
              required
            />
            <p className="font-roboto-slab text-xs text-gray-500">
              {fulfillmentMethod === "delivery"
                ? "Your order will be delivered to the address below."
                : "You'll pick up from the assigned cluster farmer's office."}
            </p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
            <DynamicInput
              label="State"
              placeholder="e.g. Kaduna"
              value={locationState}
              onChange={(e) => setLocationState(e.target.value)}
              required
            />
            <DynamicInput
              label="LGA"
              placeholder="e.g. Kaduna South"
              value={locationLga}
              onChange={(e) => setLocationLga(e.target.value)}
              required
            />
          </div>

          {/* Delivery Address */}
          <DynamicInput
            label={fulfillmentMethod === "delivery" ? "Delivery Address" : "Your Address"}
            placeholder="Full address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
          />

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
              Additional Notes <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific requirements, preferred delivery time, etc."
              rows={3}
              maxLength={500}
              className="font-roboto-slab w-full rounded-2xl border border-(--border-input) p-(--space-md) text-sm text-(--text-colour) transition outline-none focus:border-(--border-gray)"
            />
          </div>

          {/* Submit */}
          <div className="mx-auto w-full max-w-sm">
            {canSubmit ? (
              <SubmitPrimaryButton loading={submitting} onClick={handleSubmit} type="button">
                {total !== null ? `Pay ₦${total.toLocaleString()} & Submit` : "Submit Demand"}
              </SubmitPrimaryButton>
            ) : (
              <SubmitSecondaryButton disabled type="button">
                Submit Demand
              </SubmitSecondaryButton>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
