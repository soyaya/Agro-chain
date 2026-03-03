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
          "rounded-full h-14 w-full bg-(--theme-green-dark) font-bold text-(--white) border border-(--border-gray) transition-all duration-300 hover:shadow-md shadow-sm ease-in-out hover:cursor-pointer hover:opacity-96",
          (loading || disabled) && "cursor-not-allowed opacity-70",
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
