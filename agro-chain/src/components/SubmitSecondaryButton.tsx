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

export const SubmitSecondaryButton = React.forwardRef<HTMLButtonElement, SubmitSecondaryButtonProps>(
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
          "rounded-full h-14 w-full bg-transparent border border-(--border-gray) font-bold transition-all shadow-sm duration-300 ease-in-out cursor-pointer",
          "hover:shadow-md hover:opacity-96 hover:bg-(--bg-pink) hover:scale-[1.01]",
          "focus:outline-none focus:ring-2 focus:ring-(--border-gray) focus:ring-offset-2",
          "active:scale-[0.99]",
          (loading || disabled) && "cursor-not-allowed opacity-90 hover:scale-100 active:scale-100 hover:bg-transparent",
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
