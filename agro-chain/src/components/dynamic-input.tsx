"use client";

import React, { useState, forwardRef, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Eye, EyeOff, Mail, User, Phone, ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export type DynamicInputProps = React.ComponentProps<typeof Input> & {
  label?: string;
  required?: boolean;
  error?: boolean | string;

  // Controls icon, toggle behavior, placeholder, etc.
  fieldType?: "text" | "email" | "tel" | "password" | "confirm-password";

  // Optional custom placeholder (overrides default behavior)
  placeholder?: string;
};

export const DynamicInput = forwardRef<HTMLInputElement, DynamicInputProps>(
  (
    {
      label,
      required = false,
      error,
      fieldType = "text",
      placeholder: customPlaceholder,
      className = "",
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);

    // Determine input type
    const inputType =
      fieldType === "password" || fieldType === "confirm-password"
        ? visible
          ? "text"
          : "password"
        : fieldType;

    // Default placeholders
    const defaultPlaceholder = {
      text: "Enter text...",
      email: "example@example.com",
      tel: "+234 (0) 123-4567",
      password: "At least 8 characters",
      "confirm-password": "Confirm your password",
    }[fieldType];

    const finalPlaceholder = customPlaceholder || defaultPlaceholder;

    // Icon logic
    let LeadingIcon = null;
    if (fieldType === "email") {
      LeadingIcon = Mail;
    } else if (fieldType === "text") {
      LeadingIcon = User;
    } else if (fieldType === "tel") {
      LeadingIcon = Phone;
    }

    const hasError = !!error || typeof error === "string";

    return (
      <div className={cn("flex flex-col gap-(--space-md)", className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={label}
            className="font-roboto-slab flex cursor-default items-center gap-1 text-base font-medium text-(--heading-colour) transition-all duration-300 ease-in-out hover:cursor-pointer focus:cursor-text lg:font-medium"
          >
            {label}
            {required && <span className="text-(--error-red)">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative cursor-default transition-all duration-300 ease-in-out hover:cursor-pointer focus:cursor-text">
          {/* Leading icon (email, text, etc.) */}
          {LeadingIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <LeadingIcon size={20} className="text-gray-400" />
            </div>
          )}

          <Input
            ref={ref}
            type={inputType}
            id={label}
            aria-label={label || fieldType}
            placeholder={finalPlaceholder}
            className={cn(
              "font-roboto-slab h-12 w-full rounded-full border py-(--space-lg) text-base shadow-xs ring-0 transition-all duration-300 ease-in-out outline-none",
              LeadingIcon ? "pl-(--space-forty)" : "pl-(--space-md)",
              fieldType === "password" || fieldType === "confirm-password" ? "pr-10" : "pr-3",
              hasError ? "border-(--error-red)" : "border-(--border-input)",
              "border-(--border-input) text-(--text-colour) caret-(--input-field-green) placeholder:text-base focus:border-(--border-gray)",
            )}
            {...props}
          />

          {/* Show/Hide password toggle */}
          {(fieldType === "password" || fieldType === "confirm-password") && (
            <button
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={() => setVisible((v) => !v)}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-(--space-md) transition-all duration-300 ease-in-out hover:text-gray-700"
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {/* Error message */}
        {typeof error === "string" && error && (
          <p className="text-sm text-(--error-red)">{error}</p>
        )}
      </div>
    );
  },
);

DynamicInput.displayName = "DynamicInput";

export type BaseInputProps = React.ComponentProps<"input"> & {
  label?: string;
  required?: boolean;
  error?: boolean | string;
  placeholder?: string;
};

export type SelectInputProps = {
  label?: string;
  required?: boolean;
  error?: boolean | string;

  options: {
    value: string;
    label: string;
  }[];

  value?: string;
  onValueChange?: (value: string) => void;

  className?: string;
};

export const SelectInput = forwardRef<HTMLDivElement, SelectInputProps>(
  ({ label, required = false, error, options = [], value, onValueChange, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dropdownId = `dropdown-${label?.replace(/\s+/g, "-").toLowerCase() || "select"}`;

    const hasError = !!error || typeof error === "string";

    const selectedOption = options.find((opt) => opt.value === value);
    const display = selectedOption?.label || "Select an option";

    // Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          triggerRef.current &&
          !dropdownRef.current.contains(e.target as Node) &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div ref={ref} className={cn("flex flex-col gap-(--space-md)", className)}>
        {/* Label */}
        {label && (
          <label className="font-roboto-slab flex items-center gap-1 text-base font-medium text-(--heading-colour)">
            {label}
            {required && <span className="text-(--error-red)">*</span>}
          </label>
        )}

        {/* Select Trigger */}
        <div className="relative">
          <div
            ref={triggerRef}
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
            aria-controls={dropdownId}
            aria-label={label || "Select an option"}
            className={cn(
              "font-roboto-slab flex h-12 w-full items-center justify-between rounded-full border text-base shadow-xs ring-0 transition-all duration-300 ease-in-out outline-none",
              "px-(--space-md)",
              hasError ? "border-(--error-red)" : "border-(--border-input)",
              "cursor-pointer text-(--text-colour)",
              "hover:border-(--border-gray) hover:shadow-sm",
              "focus:border-(--theme-green-dark) focus:ring-2 focus:ring-(--theme-green-dark) focus:ring-offset-1",
            )}
          >
            <span className={cn(selectedOption ? "text-(--text-colour)" : "text-gray-400")}>
              {display}
            </span>

            <ChevronDown
              size={18}
              className={cn(
                "text-gray-400 transition-transform duration-300",
                isOpen && "rotate-180",
              )}
            />
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                role="listbox"
                aria-label={label ? `${label} options` : "Options"}
                className="absolute right-0 left-0 z-50 mt-2 max-h-60 overflow-auto rounded-xl border border-(--border-input) bg-(--white) shadow-lg"
              >
                {options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      onValueChange?.(option.value);
                      setIsOpen(false);
                    }}
                    tabIndex={0}
                    role="option"
                    aria-selected={option.value === value}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onValueChange?.(option.value);
                        setIsOpen(false);
                      }
                    }}
                    className={cn(
                      "font-roboto-slab cursor-pointer px-(--space-md) py-(--space-md) text-base text-(--text-colour) transition-all duration-200 ease-in-out",
                      "hover:bg-(--bg-pink) hover:shadow-sm",
                      "focus:bg-(--bg-pink) focus:ring-2 focus:ring-(--theme-green-dark) focus:outline-none focus:ring-inset",
                      option.value === value && "bg-(--bg-pink)",
                    )}
                  >
                    {option.label}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        {typeof error === "string" && error && (
          <p className="text-sm text-(--error-red)">{error}</p>
        )}
      </div>
    );
  },
);

SelectInput.displayName = "SelectInput";
