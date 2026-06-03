"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANT, FADE_IN_VARIANT } from "~/types/constants";

export function ComingSoon() {
  return (
    <motion.div
      variants={STAGGER_CONTAINER_VARIANT}
      initial="hidden"
      animate="visible"
      className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3"
    >
      <motion.div variants={FADE_IN_VARIANT} transition={{ duration: 0.4 }}>
        <Loader2 className="h-10 w-10 animate-spin text-theme-green-dark" />
      </motion.div>
      <motion.p
        variants={FADE_IN_VARIANT}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="font-roboto-slab text-text-colour"
      >
        Coming Soon
      </motion.p>
    </motion.div>
  );
}
