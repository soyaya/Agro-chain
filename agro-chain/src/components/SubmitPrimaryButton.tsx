"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface SubmitPrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children?: React.ReactNode;
  className?: string;
}

export const SubmitPrimaryButton = React.forwardRef<HTMLButtonElement, SubmitPrimaryButtonProps>(
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
        disabled={loading || disabled}
        variant="default"
        className={cn(
          "rounded-full h-14 w-full bg-(--theme-green-dark) font-bold text-(--white) border border-(--border-gray) transition-all duration-300 shadow-sm ease-in-out cursor-pointer",
          "hover:shadow-md hover:opacity-96 hover:scale-[1.01]",
          "focus:outline-none focus:ring-2 focus:ring-(--theme-green-dark) focus:ring-offset-2",
          "active:scale-[0.99]",
          (loading || disabled) && "cursor-not-allowed opacity-70 hover:scale-100 active:scale-100",
          className,
        )}
        {...props}
      >
        {loading ? loadingText : children}
      </Button>
    );
  },
);

SubmitPrimaryButton.displayName = "SubmitPrimaryButton";
