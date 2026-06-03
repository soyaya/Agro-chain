"use client";

import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SelectInput, DynamicInput } from "~/components/dynamic-input";
import type { MarketplaceFilters as Filters } from "~/types";
import {
  LIVE_FISH_TYPES,
  PROCESSED_FISH_TYPES,
  LIVE_FISH_TYPE_LABELS,
  PROCESSED_FISH_TYPE_LABELS,
  NIGERIAN_STATES,
  FADE_IN_VARIANT,
} from "~/types/constants";

interface MarketplaceFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

export function MarketplaceFilters({ filters, onChange, onReset }: MarketplaceFiltersProps) {
  const categoryOptions = [
    { label: "All Categories", value: "" },
    { label: "Live Catfish", value: "live" },
    { label: "Processed Catfish", value: "processed" },
  ];

  const liveFishTypeOptions = LIVE_FISH_TYPES.map((t) => ({
    label: LIVE_FISH_TYPE_LABELS[t],
    value: t,
  }));

  const processedFishTypeOptions = PROCESSED_FISH_TYPES.map((t) => ({
    label: PROCESSED_FISH_TYPE_LABELS[t],
    value: t,
  }));

  const fishTypeOptions = [
    { label: filters.category === "processed" ? "All Processed Types" : filters.category === "live" ? "All Live Types" : "All Fish Types", value: "" },
    ...(filters.category === "processed"
      ? processedFishTypeOptions
      : filters.category === "live"
      ? liveFishTypeOptions
      : [...liveFishTypeOptions, ...processedFishTypeOptions]),
  ];

  const stateOptions = [
    { label: "All States", value: "" },
    ...NIGERIAN_STATES.map((state) => ({ label: state, value: state })),
  ];

  const sortOptions = [
    { label: "Latest First", value: "date-desc" },
    { label: "Oldest First", value: "date-asc" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Quantity: Low to High", value: "quantity-asc" },
    { label: "Quantity: High to Low", value: "quantity-desc" },
  ];

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    const update: Partial<Filters> = { [key]: value || undefined };
    // Clear fish type when category changes so stale values don't carry over
    if (key === "category") update.fishType = undefined;
    onChange({ ...filters, ...update });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.fishType ||
    filters.state ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minQuantity;

  return (
    <motion.div
      variants={FADE_IN_VARIANT}
      className="border-gray-border flex flex-col gap-(--gap-base) rounded-3xl border bg-(--white) p-(--space-lg) shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-text-colour" />
          <h3 className="font-roboto-slab text-heading-colour text-lg font-medium">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-text-colour hover:text-heading-colour flex items-center gap-1 text-sm transition"
          >
            <X size={16} />
            Reset
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="text-text-colour pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          type="text"
          placeholder="Search listings..."
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="font-roboto-slab focus:border-gray-border text-text-colour border-input-border h-12 w-full rounded-full border pr-(--space-md) pl-10 text-base transition outline-none"
        />
      </div>

      {/* Category */}
      <SelectInput
        label="Category"
        value={filters.category || ""}
        onValueChange={(value) =>
          handleFilterChange("category", value as "live" | "processed" | "")
        }
        options={categoryOptions}
      />

      {/* Fish Type */}
      <SelectInput
        label="Fish Type"
        value={filters.fishType || ""}
        onValueChange={(value) => handleFilterChange("fishType", value)}
        options={fishTypeOptions}
      />

      {/* State */}
      <SelectInput
        label="State"
        value={filters.state || ""}
        onValueChange={(value) => handleFilterChange("state", value)}
        options={stateOptions}
      />

      {/* Price Range */}
      <div className="flex flex-col gap-(--space-md)">
        <label className="font-roboto-slab text-heading-colour text-sm font-medium">
          Price Range (₦)
        </label>
        <div className="grid grid-cols-2 gap-(--gap-base)">
          <DynamicInput
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => handleFilterChange("minPrice", Number(e.target.value))}
          />
          <DynamicInput
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => handleFilterChange("maxPrice", Number(e.target.value))}
          />
        </div>
      </div>

      {/* Minimum Quantity */}
      <DynamicInput
        label="Minimum Quantity (kg)"
        type="number"
        placeholder="e.g. 1000"
        value={filters.minQuantity || ""}
        onChange={(e) => handleFilterChange("minQuantity", Number(e.target.value))}
      />

      {/* Sort By */}
      <SelectInput
        label="Sort By"
        value={
          filters.sortBy && filters.sortOrder
            ? `${filters.sortBy}-${filters.sortOrder}`
            : "date-desc"
        }
        onValueChange={(value) => {
          const [sortBy, sortOrder] = value.split("-") as [
            "price" | "quantity" | "date",
            "asc" | "desc",
          ];
          onChange({ ...filters, sortBy, sortOrder });
        }}
        options={sortOptions}
      />
    </motion.div>
  );
}
