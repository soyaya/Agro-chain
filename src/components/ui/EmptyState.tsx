"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  size = "md",
}: EmptyStateProps) {
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

  const ActionButton = () => {
    if (!actionLabel) return null;

    const buttonContent = (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAction}
        className="px-6 py-3 rounded-full bg-green-600 text-white font-roboto-slab font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        {actionLabel}
      </motion.button>
    );

    if (actionHref) {
      return <Link href={actionHref}>{buttonContent}</Link>;
    }

    return buttonContent;
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
        className="p-6 rounded-full bg-gray-100"
      >
        <Icon size={iconSizes[size]} className="text-gray-400" />
      </motion.div>
      <div className="text-center max-w-md">
        <h3 className="font-ubuntu text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 font-roboto-slab text-sm">{description}</p>
      </div>
      <ActionButton />
    </motion.div>
  );
}
