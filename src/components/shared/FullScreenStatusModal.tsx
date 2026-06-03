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
          className="fixed inset-0 z-999 flex items-center justify-center bg-(--black)/40 backdrop-blur-sm"
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
            className="w-[90%] max-w-md rounded-2xl bg-(--white) p-10 shadow-2xl"
          >
            <AnimatePresence mode="wait">
              {variant === "loading" ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-(--gap-base) text-center"
                >
                  <p className="text-text-colour text-lg font-medium">{title}</p>
                  <Loader2 className="h-12 w-12 animate-spin text-(--black)" />
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center gap-(--gap-base) text-center"
                >
                  <CheckCircle2 className="h-14 w-14 text-theme-green-dark" />
                  <div>
                    <p className="text-text-colour text-lg font-semibold">{title}</p>
                    {description && (
                      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
