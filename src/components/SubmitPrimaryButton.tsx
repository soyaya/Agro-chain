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
          "h-12 w-full cursor-pointer rounded-full border border-(--theme-green-dark) bg-(--theme-green-dark) font-bold text-(--white) shadow-xs transition-all duration-300 ease-in-out",
          "hover:scale-[1.01] hover:opacity-96 hover:shadow-sm",
          "focus:ring-1 focus:ring-(--theme-green-dark) focus:outline-none",
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
