"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FADE_IN_VARIANT } from "~/types/constants";
import { ArrowRightIcon } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      aria-label="Hero Section"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-theme-green-dark"
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

      <div className="content-width relative z-10 flex flex-col items-center gap-8 px-section-px sm:px-section-px-sm  text-center lg:px-25 py-section-py sm:py-section-py-sm lg:py-section-py-lg">
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Label */}
          <span className="font-ubuntu text-xs font-semibold tracking-widest text-green-300 uppercase">
            Nigeria&apos;s Catfish Marketplace
          </span>

          {/* H1 */}
          <h1 className="font-ubuntu text-4xl font-bold text-white sm:text-5xl lg:text-6xl lg:leading-tight">
            Connecting Verified Farmers
            <br className="hidden sm:block" /> to Bulk Buyers, Seamlessly.
          </h1>

          {/* Subheading */}
          <p className="font-roboto-slab max-w-2xl text-lg text-white/80">
            Agro-chain digitises the catfish supply chain: farm listing, secure
            payment, and coordinated delivery. No middlemen. No price
            opacity. Just fresh fish, fair prices, and reliable logistics.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="font-ubuntu rounded-full bg-white px-8 py-3 gap-3 flex items-center text-sm font-semibold text-theme-green-dark shadow-md transition hover:bg-white/90"
            >
              Browse Marketplace <ArrowRightIcon size={16} />
            </Link>
            <Link
              href="/register?role=farmer"
              className="font-ubuntu rounded-full border border-white px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Join as a Farmer
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {["Paystack Secured", "Verified Sellers", "Admin-Set Pricing", "Traceable Supply"].map(
              (badge) => (
                <span
                  key={badge}
                  className="font-roboto-slab flex items-center gap-1.5 text-sm text-white/60"
                >
                  <span className="text-green-400">✓</span>
                  {badge}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
