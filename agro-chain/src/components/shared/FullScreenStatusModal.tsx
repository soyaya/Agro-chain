"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "~/lib/utils";

type Variant = "loading" | "success";

interface FullScreenStatusModalProps {
  open: boolean;
  variant: Variant;
  title: string;
  description?: string;
}

export function FullScreenStatusModal({
  open,
  variant,
  title,
  description,
}: FullScreenStatusModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-[90%] max-w-md rounded-2xl bg-white p-10 shadow-2xl"
          >
            {/* LOADING STATE */}
            {variant === "loading" && (
              <div className="flex flex-col items-center text-center gap-(--gap-base)">
                <p className="text-lg font-medium text-(--text-colour)">
                  {title}
                </p>

                <Loader2 className="h-12 w-12 animate-spin text-(--black)" />
              </div>
            )}

            {/* SUCCESS STATE */}
            {variant === "success" && (
              <div className="flex flex-col items-center text-center gap-(--gap-base)">
                <CheckCircle2 className="h-14 w-14 text-(--theme-green-dark)" />

                <div>
                  <p className="text-lg font-semibold text-(--text-colour)">
                    {title}
                  </p>

                  {description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}