"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FADE_IN_VARIANT } from "~/types/constants";

export default function CTABannerSection() {
  return (
    <section
      aria-label="Call to Action"
      className="w-full"
      style={{
        background: "linear-gradient(135deg, var(--theme-green-dark), var(--theme-green-light))",
      }}
    >
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="content-width flex flex-col items-center gap-6 py-section-py sm:py-section-py-sm lg:py-section-py-lg text-center px-section-px sm:px-section-px-sm lg:px-section-px-lg"
      >
        <h2 className="font-ubuntu text-3xl font-bold text-white lg:text-4xl">
          Ready to trade smarter?
        </h2>
        <p className="font-roboto-slab max-w-xl text-lg text-white/70">
          Join hundreds of farmers and buyers already using Agro-chain to source and sell fresh
          catfish across Nigeria.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="font-ubuntu text-theme-green-dark rounded-full bg-white px-8 py-3 text-sm font-semibold shadow-md transition hover:bg-white/90"
          >
            Get Started Free
          </Link>
          <Link
            href="/marketplace"
            className="font-ubuntu rounded-full border border-white px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Browse Marketplace
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
