"use client";

import React, { forwardRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export type NumberInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  label?: string;
  required?: boolean;
  error?: boolean | string;
  placeholder?: string;
  options?: number[];
  unit?: string;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label,
      required = false,
      error,
      placeholder = "0",
      options,
      unit,
      className = "",
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(value || "");

    const hasError = !!error || typeof error === "string";

    const handleSelect = (option: number) => {
      setInternalValue(option);
      if (onChange) {
        const event = {
          target: { value: option.toString() },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
      setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    const displayValue = internalValue ? `${internalValue}${unit || ""}` : "";

    return (
      <div className={cn("flex flex-col gap-(--space-md)", className)}>
        {label && (
          <label
            htmlFor={label}
            className="font-roboto-slab flex cursor-default items-center gap-1 text-base font-medium text-(--heading-colour)"
          >
            {label}
            {required && <span className="text-(--error-red)">*</span>}
          </label>
        )}

        <div className="relative">
          {options ? (
            <>
              {/* Dropdown Trigger */}
              <div
                onClick={() => setIsOpen((o) => !o)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsOpen((o) => !o);
                  } else if (e.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
                tabIndex={0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={label || "Select a number"}
                className={cn(
                  "font-roboto-slab flex h-12 w-full cursor-pointer items-center justify-between rounded-full border text-base shadow-xs ring-0 transition-all duration-300 ease-in-out outline-none",
                  "px-(--space-md)",
                  hasError ? "border-(--error-red)" : "border-(--border-input)",
                  "text-(--text-colour)",
                  "hover:border-(--border-gray) hover:shadow-sm",
                  "focus:border-(--theme-green-dark) focus:ring-2 focus:ring-(--theme-green-dark) focus:ring-offset-1",
                )}
              >
                <span className={cn(internalValue ? "text-(--text-colour)" : "text-gray-400")}>
                  {displayValue || placeholder}
                </span>

                <ChevronDown
                  size={18}
                  className={cn(
                    "text-gray-400 transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    role="listbox"
                    aria-label={label ? `${label} options` : "Number options"}
                    className="absolute right-0 left-0 z-50 mt-2 max-h-60 overflow-auto rounded-xl border border-(--border-input) bg-(--white) shadow-lg"
                  >
                    {options.map((option) => (
                      <div
                        key={option}
                        onClick={() => handleSelect(option)}
                        tabIndex={0}
                        role="option"
                        aria-selected={Number(internalValue) === option}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelect(option);
                          }
                        }}
                        className={cn(
                          "font-roboto-slab cursor-pointer px-(--space-md) py-(--space-md) text-base text-(--text-colour) transition-all duration-200 ease-in-out",
                          "hover:bg-(--bg-pink) hover:shadow-sm",
                          "focus:bg-(--bg-pink) focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none focus:ring-inset",
                          Number(internalValue) === option && "bg-(--bg-pink)",
                        )}
                      >
                        {option}
                        {unit}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden input for form submission */}
              <input
                ref={ref}
                type="number"
                value={internalValue}
                onChange={handleInputChange}
                className="sr-only"
                aria-hidden="true"
                {...props}
              />
            </>
          ) : (
            /* Regular Number Input */
            <input
              ref={ref}
              type="number"
              id={label}
              aria-label={label || "Enter a number"}
              placeholder={placeholder}
              value={internalValue}
              onChange={handleInputChange}
              className={cn(
                "font-roboto-slab h-12 w-full rounded-full border py-(--space-lg) text-base shadow-xs ring-0 transition-all duration-300 ease-in-out outline-none",
                "pr-(--space-md) pl-(--space-md)",
                hasError ? "border-(--error-red)" : "border-(--border-input)",
                "text-(--text-colour) caret-(--input-field-green) placeholder:text-base focus:border-(--border-gray)",
              )}
              {...props}
            />
          )}
        </div>

        {typeof error === "string" && error && (
          <p className="text-sm text-(--error-red)">{error}</p>
        )}
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";
