"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "~/types/constants";

export default function CTABannerSection() {
  return (
    <section
      aria-label="Call to Action"
      className="w-full"
      style={{
        background: "linear-gradient(135deg, var(--theme-green-dark), var(--theme-green-light))",
      }}
    >
      <div className="section-content-max-width py-section-py sm:py-section-py-sm lg:py-section-py-lg px-section-px sm:px-section-px-sm lg:px-section-px-lg flex flex-col items-center gap-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
          className="font-ubuntu text-3xl font-bold text-white lg:text-4xl"
        >
          Ready to trade smarter?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: EASE_OUT_EXPO, delay: 0.1 }}
          className="font-roboto-slab max-w-xl text-lg text-white/70"
        >
          Join hundreds of farmers and buyers already using Agro-chain to source and sell fresh
          catfish across Nigeria.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="font-ubuntu text-theme-green-dark rounded-full bg-white px-8 py-3 text-sm font-semibold shadow-md transition hover:bg-white/90 active:scale-95"
          >
            Get Started Free
          </Link>
          <Link
            href="/marketplace"
            className="font-ubuntu rounded-full border border-white px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95"
          >
            Browse Marketplace
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
