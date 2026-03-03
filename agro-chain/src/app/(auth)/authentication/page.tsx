"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

type Role = "Farmer" | "Buyer" | "";

export default function AuthWelcome() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("");

  const isValid = role !== "";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="min-h-screen font-roboto-slab py-(--section-py) flex flex-col gap-(--gap-lg)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Step Content */}
        <motion.div
          className="w-full flex flex-col gap-(--section-gap) mx-auto"
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
            <h1 className="text-2xl font-ubuntu sm:text-3xl lg:text-3xl font-bold tracking-tight">
              Fish Vendor
            </h1>
            <p className="text-(--text-colour) font-roboto-slab text-base">
              A marketplace for catfish farmers and verified buyers.
            </p>
          </motion.div>

          {/* Select Role */}
          <motion.div
            className="flex flex-col gap-(--gap-base) md:gap-(--gap-md)"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <label className="text-base font-medium">
              Select your role
            </label>

            <Select value={role} onValueChange={(v: Role) => setRole(v)}>
              <SelectTrigger className="cursor-pointer rounded-full py-6 text-base w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>

              <SelectContent className="p-0 overflow-hidden border border-(--border-gray) p-2">
                <SelectItem
                  value="Farmer"
                  className="border-b border-(--border-input) py-3 cursor-pointer"
                >
                  Farmer
                </SelectItem>
                <SelectItem
                  value="Buyer"
                  className="py-3 cursor-pointer"
                >
                  Buyer
                </SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </motion.div>

        {/* Button Section */}
        <motion.div
          className="max-w-md mt-16 w-full mx-auto flex flex-col gap-(--gap-base)"
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