"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  size?: "sm" | "md" | "lg";
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
  size = "md",
}: ErrorStateProps) {
  const sizeClasses = {
    sm: "h-32",
    md: "h-64",
    lg: "h-96",
  };

  const iconSizes = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center ${sizeClasses[size]} gap-4`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="rounded-full bg-red-50 p-4"
      >
        <AlertCircle size={iconSizes[size]} className="text-(--error-red)" />
      </motion.div>
      <div className="max-w-md text-center">
        <h3 className="font-ubuntu mb-2 text-lg font-semibold text-gray-900">Error</h3>
        <p className="font-roboto-slab text-sm text-gray-600">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="font-roboto-slab flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      )}
    </motion.div>
  );
}
