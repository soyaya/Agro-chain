"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Package } from "lucide-react";
import { NumberInput } from "~/components/ui/NumberInput";
import type { PackagingOption } from "~/types";
import { STANDARD_PACKAGING_WEIGHTS, FADE_IN_VARIANT } from "~/types/constants";

interface PackagingSelectorProps {
  totalKg: number;
  packaging: PackagingOption[];
  onChange: (packaging: PackagingOption[]) => void;
  error?: string;
}

export function PackagingSelector({ totalKg, packaging, onChange, error }: PackagingSelectorProps) {
  const [selectedWeight, setSelectedWeight] = useState<number>(1);

  const addPackaging = () => {
    if (selectedWeight <= 0) return;

    const quantity = Math.floor(totalKg / selectedWeight);
    if (quantity <= 0) return;

    // Avoid duplicate weight entries
    if (packaging.some((p) => p.weightKg === selectedWeight)) return;

    const newPackaging: PackagingOption = {
      weightKg: selectedWeight,
      quantity,
      // pricePerUnit is intentionally omitted — computed by backend from admin config
    };

    onChange([...packaging, newPackaging]);
  };

  const removePackaging = (index: number) => {
    onChange(packaging.filter((_, i) => i !== index));
  };

  const totalPackaged = packaging.reduce((sum, p) => sum + p.weightKg * p.quantity, 0);

  return (
    <div
      className="flex flex-col gap-(--gap-base)"
      role="region"
      aria-label="Packaging configuration"
    >
      <div className="flex items-center gap-2">
        <Package size={20} className="text-(--text-colour)" aria-hidden="true" />
        <h3 className="font-roboto-slab text-lg font-medium text-(--heading-colour)">
          Packaging Options
        </h3>
      </div>

      {/* Add Packaging Form */}
      <motion.div
        variants={FADE_IN_VARIANT}
        className="grid grid-cols-1 gap-(--gap-base) rounded-2xl border border-(--border-gray) bg-(--white)/50 p-(--space-lg) backdrop-blur-sm md:grid-cols-2"
        role="form"
        aria-label="Add packaging option"
      >
        <NumberInput
          label="Weight per package"
          options={[...STANDARD_PACKAGING_WEIGHTS]}
          unit="kg"
          value={selectedWeight}
          onChange={(e) => setSelectedWeight(Number(e.target.value))}
          aria-label="Select package weight in kilograms"
        />

        <div className="flex items-end">
          <button
            type="button"
            onClick={addPackaging}
            disabled={!totalKg || selectedWeight <= 0}
            aria-label="Add packaging option"
            aria-disabled={!totalKg || selectedWeight <= 0}
            className="font-roboto-slab flex h-12 w-full items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) font-medium text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} aria-hidden="true" />
            Add Package
          </button>
        </div>
      </motion.div>

      {/* Packaging List */}
      <AnimatePresence>
        {packaging.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-(--space-md)"
          >
            {packaging.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between rounded-2xl border border-(--border-gray) p-(--space-lg)"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-roboto-slab text-base text-(--heading-colour)">
                    {pkg.weightKg}kg packages
                  </p>
                  <p className="text-sm text-(--text-colour)">
                    {pkg.quantity} units · price set by platform
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removePackaging(index)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-(--error-red) transition hover:bg-red-100"
                  aria-label={`Remove ${pkg.weightKg}kg packaging option`}
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}

            {/* Summary */}
            <div className="rounded-2xl bg-(--gray-bg) p-(--space-lg)">
              <div className="flex justify-between">
                <span className="font-roboto-slab text-sm text-(--text-colour)">
                  Total Packaged:
                </span>
                <span className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                  {totalPackaged}kg / {totalKg}kg
                </span>
              </div>
              {totalPackaged < totalKg && (
                <p className="mt-2 text-sm text-yellow-600">
                  {totalKg - totalPackaged}kg remaining
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-sm text-(--error-red)">{error}</p>}
    </div>
  );
}
