"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface SubmitSecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children?: React.ReactNode; // Default text when not loading (e.g. "Sign Up")
  className?: string;
}

export const SubmitSecondaryButton = React.forwardRef<
  HTMLButtonElement,
  SubmitSecondaryButtonProps
>(
  (
    {
      loading = false,
      loadingText = "Creating Account...",
      children = "Submit",
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        type="submit"
        variant="outline"
        disabled={loading || disabled}
        className={cn(
          "border-gray-border h-12 w-full cursor-default rounded-full border bg-transparent font-bold shadow-xs transition-all duration-300 ease-in-out",
          "hover:bg-pink-bg hover:scale-[1.01] hover:cursor-pointer hover:opacity-96 hover:shadow-sm",
          "focus:ring-border-gray focus:ring-1 focus:outline-none",
          "active:scale-[0.99]",
          (loading || disabled) &&
            "cursor-not-allowed opacity-90 hover:scale-100 hover:bg-transparent active:scale-100",
          className,
        )}
        {...props}
      >
        {loading ? loadingText : children}
      </Button>
    );
  },
);

SubmitSecondaryButton.displayName = "SubmitSecondaryButton";
