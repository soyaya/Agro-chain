"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";
import { SelectInput } from "~/components/dynamic-input";
import { motion, AnimatePresence } from "framer-motion";

type Role = "Farmer" | "Buyer" | "";
const roles = [
  { value: "Buyer", label: "Buyer" },
  { value: "Farmer", label: "Farmer" },
];

export default function AuthWelcome() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("");

  const isValid = role !== "";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="font-roboto-slab -mt-(--navbar-h) pt-(--navbar-h) default-container-max-width flex min-h-screen flex-col gap-(--gap-lg)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Step Content */}
        <motion.div
          className="default-page-max-width flex-1 flex w-full flex-col gap-(--section-gap) pt-(--section-py)"
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

          {/* Select Role */}
          <motion.div
            className="flex flex-col gap-(--gap-md)"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <SelectInput
              label="Select your role"
              value={role}
              onValueChange={(value) => setRole(value as Role)}
              options={roles}
              required
            />
          </motion.div>
        </motion.div>

        {/* Button Section */}
        <motion.div
          className="mx-auto flex w-full max-w-md flex-col gap-(--gap-base)"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
        >
          <SubmitSecondaryButton
            disabled={!isValid}
            onClick={() => router.push(`/login?role=${role}`)}
          >
            Log In
          </SubmitSecondaryButton>

          <SubmitPrimaryButton
            disabled={!isValid}
            onClick={() => router.push(`/register?role=${role}`)}
          >
            Register
          </SubmitPrimaryButton>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
