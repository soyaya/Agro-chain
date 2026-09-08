"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";
import { SelectInput } from "~/components/dynamic-input";
import { motion, AnimatePresence } from "framer-motion";
import { getSafeReturnTo } from "~/lib/utils";

type Role = "farmer" | "buyer" | "";
const roles = [
  { value: "buyer", label: "Buyer" },
  { value: "farmer", label: "Farmer" },
];

function AuthWelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const safeReturnTo = getSafeReturnTo(searchParams.get("returnTo"));
  const [role, setRole] = useState<Role>("");

  const isValid = role !== "";

  // Registration needs the chosen role (sets the pending_role cookie before
  // POST /auth/register). Login determines role from the account itself once
  // authenticated, so it needs no role selection at all.
  const handleRegisterSubmit = async () => {
    if (!role) return;
    try {
      await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    } catch (error) {
      // non-blocking
    } finally {
      const registerUrl = safeReturnTo
        ? `/register?role=${role}&returnTo=${encodeURIComponent(safeReturnTo)}`
        : `/register?role=${role}`;
      router.push(registerUrl);
    }
  };

  const loginUrl = safeReturnTo ? `/login?returnTo=${encodeURIComponent(safeReturnTo)}` : "/login";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="font-roboto-slab -mt-(--navbar-h) pt-(--navbar-h) default-container-max-width flex min-h-screen flex-col gap-(--gap-2xl)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Step Content */}
        <motion.div
          className="default-page-max-width flex w-full flex-col gap-(--section-gap) pt-(--section-py)"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {/* Heading */}
          <motion.div
            className="flex flex-col gap-(--gap-base) text-center"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="font-ubuntu text-2xl font-bold tracking-tight sm:text-3xl lg:text-3xl">
              Fish Vendor
            </h1>
            <p className="font-roboto-slab text-base text-(--text-colour)">
              A marketplace for catfish farmers and verified buyers.
            </p>
          </motion.div>

        </motion.div>

        {/* Already have an account — plain login, no role needed */}
        <motion.div
          className="mx-auto mt-(--space-3xl) flex w-full default-page-max-width flex-col gap-(--gap-md)"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-roboto-slab text-center text-sm text-(--text-colour)">
            Already have an account?
          </p>
          <SubmitSecondaryButton onClick={() => router.push(loginUrl)}>
            Log In
          </SubmitSecondaryButton>
        </motion.div>

        {/* New here — role is only ever picked at registration */}
        <motion.div
          className="mx-auto mt-(--space-xl) flex w-full default-page-max-width flex-col gap-(--gap-base)"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-roboto-slab text-center text-sm text-(--text-colour)">New here?</p>
          <SelectInput
            label="Select your role"
            value={role}
            onValueChange={(value) => setRole(value as Role)}
            options={roles}
            required
          />
          <SubmitPrimaryButton disabled={!isValid} onClick={handleRegisterSubmit}>
            Register
          </SubmitPrimaryButton>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AuthWelcome() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-full w-full items-center justify-center">Loading...</div>
      }
    >
      <AuthWelcomeContent />
    </Suspense>
  );
}
