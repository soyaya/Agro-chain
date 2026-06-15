"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { EASE_OUT_EXPO } from "~/types/constants";

const TRUST_BADGES = [
  "Paystack Secured",
  "Verified Sellers",
  "Admin-Set Pricing",
  "Traceable Supply",
];

export default function HeroSection() {
  return (
    <section
      aria-label="Hero Section"
      className="bg-theme-green-dark relative flex min-h-screen w-full items-center justify-center overflow-hidden"
    >
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-[url('/Home_Image_1/Home_1.webp')] bg-cover bg-center opacity-10"
        aria-hidden="true"
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--hero-overlay)" }}
        aria-hidden="true"
      />

      <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg relative z-10 flex flex-col items-center gap-8 text-center">
        {/* Label */}
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0 }}
          className="font-ubuntu text-green-on-dark text-xs font-semibold tracking-widest uppercase"
        >
          Nigeria&apos;s Catfish Marketplace
        </motion.span>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.12 }}
          className="font-ubuntu text-4xl font-bold text-white sm:text-5xl lg:text-6xl lg:leading-tight"
        >
          Connecting Verified Farmers
          <br className="hidden sm:block" /> to Bulk Buyers, Seamlessly.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.26 }}
          className="font-roboto-slab max-w-2xl text-lg text-white/80"
        >
          Agro-chain digitises the catfish supply chain: farm listing, secure
          payment, and coordinated delivery. No middlemen. No price opacity.
          Just fresh fish, fair prices, and reliable logistics.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/marketplace"
            className="font-ubuntu text-theme-green-dark flex items-center gap-3 rounded-full bg-white px-8 py-3 text-sm font-semibold shadow-md transition hover:bg-white/90 active:scale-95"
          >
            Browse Marketplace <ArrowRightIcon size={16} />
          </Link>
          <Link
            href="/register?role=farmer"
            className="font-ubuntu rounded-full border border-white px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95"
          >
            Join as a Farmer
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.56 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          {TRUST_BADGES.map((badge) => (
            <span
              key={badge}
              className="font-roboto-slab flex items-center gap-1.5 text-sm text-white/60"
            >
              <span className="text-green-icon-dark">✓</span>
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
