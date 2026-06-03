"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

export default function NotFound() {
  return (
    <motion.div
      variants={STAGGER_CONTAINER_VARIANT}
      initial="hidden"
      animate="visible"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center"
    >
      <motion.h1
        variants={SLIDE_UP_VARIANT}
        transition={{ duration: 0.5 }}
        className="font-ubuntu text-5xl font-bold text-heading-colour"
      >
        404
      </motion.h1>
      <motion.p
        variants={SLIDE_UP_VARIANT}
        transition={{ duration: 0.5 }}
        className="font-roboto-slab text-lg text-text-colour"
      >
        This page doesn&apos;t exist. Back to safety?
      </motion.p>
      <motion.div
        variants={SLIDE_UP_VARIANT}
        transition={{ duration: 0.5 }}
        className="flex gap-4"
      >
        <Link
          href="/"
          className="font-ubuntu text-sm font-medium text-theme-green-dark underline underline-offset-4"
        >
          Go Home
        </Link>
        <Link
          href="/marketplace"
          className="font-ubuntu text-sm font-medium text-theme-green-dark underline underline-offset-4"
        >
          Browse Marketplace
        </Link>
      </motion.div>
    </motion.div>
  );
}
