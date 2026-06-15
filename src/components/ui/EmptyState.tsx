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

function ActionButton({
  actionLabel,
  actionHref,
  onAction,
}: Pick<EmptyStateProps, "actionLabel" | "actionHref" | "onAction">) {
  if (!actionLabel) return null;

  const button = (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onAction}
      className="bg-theme-green-dark font-roboto-slab hover:bg-theme-green-light focus:ring-theme-green-light rounded-full px-6 py-3 font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
    >
      {actionLabel}
    </motion.button>
  );

  return actionHref ? <Link href={actionHref}>{button}</Link> : button;
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
        className="bg-gray-bg rounded-full p-6"
      >
        <Icon size={iconSizes[size]} className="text-muted-text" />
      </motion.div>
      <div className="max-w-md text-center">
        <h3 className="font-ubuntu text-heading-colour mb-2 text-xl font-semibold">
          {title}
        </h3>
        <p className="text-text-colour font-roboto-slab text-sm">
          {description}
        </p>
      </div>
      <ActionButton
        actionLabel={actionLabel}
        actionHref={actionHref}
        onAction={onAction}
      />
    </motion.div>
  );
}
