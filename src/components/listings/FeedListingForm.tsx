"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { FADE_IN_VARIANT } from "~/types/constants";
import { feedService, type FeedCategory, type CreateFeedListingPayload } from "~/lib/services/feed.service";

// Seeded from real Nigerian catfish-feed brands (confirmed via web search) —
// a convenience suggestion list, not a closed set: the field stays free text
// since this list will never be complete and new brands enter the market
// regularly.
const BRAND_SUGGESTIONS = [
  "Blue Crown",
  "Vital Feed",
  "TopFeed Aqua",
  "EcoFloat",
  "Aqualis",
  "Multi Feed",
  "Ace Feed",
  "Primacy",
  "Prominence",
  "Tobaf",
  "Happy Feed",
  "New Hope",
  "Coppens",
  "Skretting",
  "Aller Aqua",
  "Raanan",
  "Inve",
];

const PELLET_FORMS: { label: string; value: "floating" | "sinking" }[] = [
  { label: "Floating", value: "floating" },
  { label: "Sinking", value: "sinking" },
];

interface FeedListingFormProps {
  onSubmit: (data: CreateFeedListingPayload) => Promise<void>;
  isLoading?: boolean;
}

export function FeedListingForm({ onSubmit, isLoading = false }: FeedListingFormProps) {
  const [categories, setCategories] = useState<FeedCategory[]>([]);
  const [feedCategoryId, setFeedCategoryId] = useState("");
  const [pelletForm, setPelletForm] = useState<"floating" | "sinking" | "">("");
  const [pelletSizeMm, setPelletSizeMm] = useState("");
  const [brandName, setBrandName] = useState("");
  const [proteinPercent, setProteinPercent] = useState("");
  const [bagWeightKg, setBagWeightKg] = useState("");
  const [clusterPricePerBag, setClusterPricePerBag] = useState("");
  const [quantityAvailable, setQuantityAvailable] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    feedService
      .getFeedCategories()
      .then((res) => setCategories(res.data.categories))
      .catch(() => toast.error("Failed to load feed categories"));
  }, []);

  const selectedCategory = categories.find((c) => c.id === feedCategoryId) ?? null;

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        label: `${c.label} (${c.minPelletSizeMm}–${c.maxPelletSizeMm}mm)`,
        value: c.id,
      })),
    [categories],
  );

  // Live preview of what the buyer will actually see — the cluster farmer
  // doesn't control the margin, so showing this before submit avoids any
  // surprise about why the listed price differs from what they typed.
  const buyerPricePreview = useMemo(() => {
    const price = Number(clusterPricePerBag);
    if (!selectedCategory || !price || price <= 0) return null;
    if (selectedCategory.markupType == null || selectedCategory.markupValue == null) return null;
    const raw =
      selectedCategory.markupType === "percentage"
        ? price * (1 + selectedCategory.markupValue / 100)
        : price + selectedCategory.markupValue;
    return Math.round(raw * 100) / 100;
  }, [selectedCategory, clusterPricePerBag]);

  const pelletSizeInRange =
    !selectedCategory ||
    !pelletSizeMm ||
    (Number(pelletSizeMm) >= selectedCategory.minPelletSizeMm && Number(pelletSizeMm) <= selectedCategory.maxPelletSizeMm);

  const canSubmit =
    !!feedCategoryId &&
    !!pelletForm &&
    Number(pelletSizeMm) > 0 &&
    pelletSizeInRange &&
    !!brandName.trim() &&
    Number(bagWeightKg) > 0 &&
    Number(clusterPricePerBag) > 0 &&
    Number(quantityAvailable) > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !pelletForm) return;
    try {
      await onSubmit({
        feedCategoryId,
        pelletForm,
        pelletSizeMm: Number(pelletSizeMm),
        brandName: brandName.trim(),
        proteinPercent: proteinPercent ? Number(proteinPercent) : undefined,
        bagWeightKg: Number(bagWeightKg),
        clusterPricePerBag: Number(clusterPricePerBag),
        quantityAvailable: Number(quantityAvailable),
        description: description.trim() || undefined,
      });
      toast.success("Feed listing published to the Feed Hub!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit feed listing";
      toast.error(message);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      className="flex w-full flex-col gap-(--gap-lg)"
    >
      {/* Category */}
      <motion.div variants={FADE_IN_VARIANT} className="flex flex-col gap-1.5">
        <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
          Feed Category <span className="text-red-500">*</span>
        </label>
        <SelectInput
          label=""
          value={feedCategoryId}
          onValueChange={(v) => setFeedCategoryId(v)}
          options={categoryOptions}
          required
        />
      </motion.div>

      {/* Exact pellet size — buyers shop by this precise figure, not the category's range */}
      <motion.div variants={FADE_IN_VARIANT} className="flex flex-col gap-1.5">
        <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
          Pellet Size (mm) <span className="text-red-500">*</span>
        </label>
        <DynamicInput
          label=""
          type="number"
          value={pelletSizeMm}
          onChange={(e) => setPelletSizeMm(e.target.value)}
          placeholder={selectedCategory ? `e.g. ${selectedCategory.minPelletSizeMm}` : "e.g. 4"}
          required
        />
        {selectedCategory && (
          <p className="text-xs text-(--text-colour)">
            Must be between {selectedCategory.minPelletSizeMm}mm and {selectedCategory.maxPelletSizeMm}mm for the
            "{selectedCategory.label}" category.
          </p>
        )}
        {!pelletSizeInRange && pelletSizeMm && (
          <p className="text-xs text-red-600">Pellet size is outside the selected category's range.</p>
        )}
      </motion.div>

      {/* Pellet form + brand */}
      <motion.div variants={FADE_IN_VARIANT} className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
            Pellet Form <span className="text-red-500">*</span>
          </label>
          <SelectInput
            label=""
            value={pelletForm}
            onValueChange={(v) => setPelletForm(v as "floating" | "sinking")}
            options={PELLET_FORMS}
            required
          />
        </div>
        <DynamicInput
          label="Brand"
          list="feed-brand-suggestions"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="e.g. Blue Crown"
          required
        />
        <datalist id="feed-brand-suggestions">
          {BRAND_SUGGESTIONS.map((brand) => (
            <option key={brand} value={brand} />
          ))}
        </datalist>
      </motion.div>

      {/* Bag weight + protein */}
      <motion.div variants={FADE_IN_VARIANT} className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
        <DynamicInput
          label="Bag Weight (kg)"
          type="number"
          value={bagWeightKg}
          onChange={(e) => setBagWeightKg(e.target.value)}
          placeholder="e.g. 15"
          required
        />
        <DynamicInput
          label="Protein % (optional)"
          type="number"
          value={proteinPercent}
          onChange={(e) => setProteinPercent(e.target.value)}
          placeholder="e.g. 42"
        />
      </motion.div>

      {/* Price + quantity */}
      <motion.div variants={FADE_IN_VARIANT} className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
        <DynamicInput
          label="Your Price per Bag (₦)"
          type="number"
          value={clusterPricePerBag}
          onChange={(e) => setClusterPricePerBag(e.target.value)}
          placeholder="e.g. 3200"
          required
        />
        <DynamicInput
          label="Quantity Available (bags)"
          type="number"
          value={quantityAvailable}
          onChange={(e) => setQuantityAvailable(e.target.value)}
          placeholder="e.g. 20"
          required
        />
      </motion.div>

      {/* Description */}
      <motion.div variants={FADE_IN_VARIANT} className="flex flex-col gap-1.5">
        <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-2xl border border-(--border-gray) p-(--space-md) font-roboto-slab text-sm text-(--text-colour) outline-none focus:border-(--theme-green-dark)"
          placeholder="Any extra detail buyers should know..."
        />
      </motion.div>

      {/* Buyer price preview */}
      {buyerPricePreview !== null && (
        <motion.div
          variants={FADE_IN_VARIANT}
          className="rounded-2xl border border-(--border-gray) bg-(--gray-bg) p-(--space-md)"
        >
          <p className="font-roboto-slab text-sm text-(--text-colour)">
            Your price: ₦{Number(clusterPricePerBag).toLocaleString()}/bag
          </p>
          <p className="font-ubuntu text-lg font-bold text-(--heading-colour)">
            Buyers will see: ₦{buyerPricePreview.toLocaleString()}/bag
          </p>
          <p className="mt-1 text-xs text-(--text-colour)">
            The difference covers AgroChain's platform margin for this category.
          </p>
        </motion.div>
      )}

      {/* Info box */}
      <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl bg-blue-50 p-(--space-lg)">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Note: </span>
          Your feed listing publishes to the Feed Hub immediately — no approval step, since you're
          the one publishing it.
        </p>
      </motion.div>

      {/* Submit */}
      <motion.div variants={FADE_IN_VARIANT} className="mt-(--submit-button-mt)">
        <SubmitPrimaryButton
          loading={isLoading}
          loadingText="Publishing Listing..."
          disabled={!canSubmit || isLoading}
          onClick={handleSubmit}
          type="button"
        >
          Publish Feed Listing
        </SubmitPrimaryButton>
      </motion.div>
    </motion.div>
  );
}
