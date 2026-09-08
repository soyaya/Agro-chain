"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";

interface VerifyAccountModalProps {
  open: boolean;
  email: string;
  onVerify: () => void;
  onDismiss: () => void;
}

export function VerifyAccountModal({ open, email, onVerify, onDismiss }: VerifyAccountModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-(--black)/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-[90%] max-w-md rounded-2xl bg-(--white) p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-(--gap-base) text-center">
              <ShieldAlert className="h-12 w-12 text-(--black)" />

              <div>
                <p className="text-lg font-semibold text-(--text-colour)">
                  Verify your account
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {email} hasn&apos;t been verified yet. We&apos;ll send a fresh verification
                  code to finish setting up your account.
                </p>
              </div>

              <div className="mt-4 flex w-full flex-col gap-(--gap-base)">
                <SubmitPrimaryButton type="button" onClick={onVerify}>
                  Verify Now
                </SubmitPrimaryButton>
                <SubmitSecondaryButton type="button" onClick={onDismiss}>
                  Cancel
                </SubmitSecondaryButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
