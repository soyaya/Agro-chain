"use client";

import React, { useState, forwardRef } from "react";
import { Input } from "./ui/input";
import { Eye, EyeOff, Mail, User, Phone } from "lucide-react";
import { cn } from "~/lib/utils";

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
      <div className={cn("flex flex-col gap-2", className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={label}
            className="flex cursor-default items-center gap-1 text-base font-medium text-(--heading-colour) transition-all duration-300 ease-in-out hover:cursor-pointer focus:cursor-text lg:font-medium"
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
              "h-16 w-full rounded-full border text-base shadow-xs ring-0 transition-all duration-300 ease-in-out outline-none sm:text-lg lg:text-xl",
              LeadingIcon ? "pl-(--forty-px)" : "pl-(--twelve-px)",
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
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-(--twelve-px) transition-all duration-300 ease-in-out hover:text-gray-700"
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
