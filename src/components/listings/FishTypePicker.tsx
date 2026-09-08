"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "~/lib/utils";
import { FISH_TYPE_CATEGORIES } from "~/types/constants";

interface FishTypePickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function FishTypePicker({ value, onChange, error }: FishTypePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
        Fish Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-(--gap-base) sm:grid-cols-3 lg:grid-cols-6">
        {FISH_TYPE_CATEGORIES.map((category) => {
          const isSelected = value === category.value;
          return (
            <button
              key={category.value}
              type="button"
              onClick={() => onChange(category.value)}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition",
                isSelected
                  ? "border-(--theme-green-dark)"
                  : "border-(--border-gray) hover:border-(--theme-green-dark)/50",
              )}
            >
              <div className="relative h-20 w-full bg-(--gray-bg)">
                <Image
                  src={category.imageUrl}
                  alt={category.label}
                  fill
                  sizes="150px"
                  className="object-cover"
                />
                {isSelected && (
                  <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-(--theme-green-dark)">
                    <Check size={12} className="text-white" aria-hidden="true" />
                  </div>
                )}
              </div>
              <span className="font-roboto-slab px-2 py-2 text-center text-xs font-medium text-(--heading-colour)">
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
