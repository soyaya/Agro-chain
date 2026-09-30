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
      loadingText,
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
        {/* Falling back to `children` (not a fixed generic string) when no
            loadingText is given — this used to default to "Creating
            Account...", which every caller that skipped loadingText (e.g.
            login's "Send OTP") silently inherited regardless of what the
            button actually did. Callers that already compute their own
            loading-aware label via `children` (e.g. login's OTP-verify step)
            now render correctly too, since children is no longer discarded
            whenever loading is true. */}
        {loading ? (loadingText ?? children) : children}
      </Button>
    );
  },
);

SubmitPrimaryButton.displayName = "SubmitPrimaryButton";
