"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MailWarning } from "lucide-react";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";

interface EmailExistsModalProps {
  open: boolean;
  email: string;
  onLogin: () => void;
  onDismiss: () => void;
}

export function EmailExistsModal({ open, email, onLogin, onDismiss }: EmailExistsModalProps) {
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
              <MailWarning className="h-12 w-12 text-(--black)" />

              <div>
                <p className="text-lg font-semibold text-(--text-colour)">
                  An account already exists
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {email} is already registered. Log in instead, or try a different email address.
                </p>
              </div>

              <div className="mt-4 flex w-full flex-col gap-(--gap-base)">
                <SubmitPrimaryButton type="button" onClick={onLogin}>
                  Log In
                </SubmitPrimaryButton>
                <SubmitSecondaryButton type="button" onClick={onDismiss}>
                  Use a different email
                </SubmitSecondaryButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
