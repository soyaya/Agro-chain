"use client";

import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SelectInput, DynamicInput } from "~/components/dynamic-input";
import type { MarketplaceFilters as Filters } from "~/types";
import { FISH_TYPE_OPTIONS, FADE_IN_VARIANT } from "~/types/constants";
import wardData from "~/data/nigeria-wards.json";

type WardData = Record<string, Record<string, string[]>>;
const NIGERIA_WARDS = wardData as WardData;

interface MarketplaceFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
  /** States open for selection (admin-controlled) — undefined means unrestricted. */
  activeStates?: string[];
}

export function MarketplaceFilters({ filters, onChange, onReset, activeStates }: MarketplaceFiltersProps) {
  const fishTypeOptions = [{ label: "All Fish Types", value: "" }, ...FISH_TYPE_OPTIONS];

  const stateOptions = [
    { label: "All States", value: "" },
    ...Object.keys(NIGERIA_WARDS)
      .sort()
      .map((state) => {
        const isActive = !activeStates || activeStates.includes(state);
        return {
          label: isActive ? state : `${state} (Coming soon)`,
          value: state,
          disabled: !isActive,
        };
      }),
  ];

  // LGA/Ward names are stored on listings verbatim (not slugs), so the
  // dataset's real names double as the filter values here to match real data.
  const lgas = filters.state ? NIGERIA_WARDS[filters.state] : undefined;
  const lgaOptions = [
    { label: "All LGAs", value: "" },
    ...(lgas ? Object.keys(lgas).sort() : []).map((lga) => ({ label: lga, value: lga })),
  ];

  const wards = filters.state && filters.localGovernment ? lgas?.[filters.localGovernment] : undefined;
  const wardOptions = [
    { label: "All Wards", value: "" },
    ...(wards ?? []).map((ward) => ({ label: ward, value: ward })),
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
    onChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleStateChange = (value: string) => {
    onChange({ ...filters, state: value || undefined, localGovernment: undefined, ward: undefined });
  };

  const handleLgaChange = (value: string) => {
    onChange({ ...filters, localGovernment: value || undefined, ward: undefined });
  };

  const hasActiveFilters =
    filters.search ||
    filters.fishType ||
    filters.state ||
    filters.localGovernment ||
    filters.ward ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minQuantity;

  return (
    <motion.div
      variants={FADE_IN_VARIANT}
      className="flex flex-col gap-(--gap-base) rounded-3xl border border-(--border-gray) bg-(--white) p-(--space-lg) shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-(--text-colour)" />
          <h3 className="font-roboto-slab text-lg font-medium text-(--heading-colour)">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-(--text-colour) transition hover:text-(--heading-colour)"
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
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--text-colour)"
        />
        <input
          type="text"
          placeholder="Search listings..."
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="font-roboto-slab h-12 w-full rounded-full border border-(--border-input) pr-(--space-md) pl-10 text-base text-(--text-colour) transition outline-none focus:border-(--border-gray)"
        />
      </div>

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
        onValueChange={handleStateChange}
        options={stateOptions}
      />

      {/* Local Government Area */}
      <SelectInput
        label="Local Government Area"
        value={filters.localGovernment || ""}
        onValueChange={handleLgaChange}
        options={lgaOptions}
      />

      {/* Ward / Community */}
      <SelectInput
        label="Ward / Community"
        value={filters.ward || ""}
        onValueChange={(value) => handleFilterChange("ward", value)}
        options={wardOptions}
      />

      {/* Price Range */}
      <div className="flex flex-col gap-(--space-md)">
        <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
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
          onChange({
            ...filters,
            sortBy,
            sortOrder,
          });
        }}
        options={sortOptions}
      />
    </motion.div>
  );
}
