"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({ message = "Loading...", size = "md" }: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-32",
    md: "h-64",
    lg: "h-96",
  };

  const iconSizes = {
    sm: 24,
    md: 40,
    lg: 56,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center ${sizeClasses[size]} gap-4`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 size={iconSizes[size]} className="text-green-600" />
      </motion.div>
      <p className="text-gray-600 font-roboto-slab text-sm">{message}</p>
    </motion.div>
  );
}
