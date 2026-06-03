"use client";

import Link from "next/link";
import { motion, type TargetAndTransition } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { SLOW_STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { featureCards } from "~/models/models";

const CARD_HOVER: TargetAndTransition = {
  y: -6,
  scale: 1.02,
  boxShadow: "var(--card-hover-shadow)",
  transition: { duration: 0.25, ease: "easeOut" },
};

const CARD_TAP: TargetAndTransition = { scale: 0.98, transition: { duration: 0.1 } };

export default function FeaturesSection() {
  return (
    <section aria-label="Why Agro-chain" className="bg-white">
      <div className="content-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="font-ubuntu text-theme-green-dark text-xs font-semibold tracking-widest uppercase">
            Why Agro-chain
          </span>
          <h2 className="font-ubuntu text-heading-colour text-3xl font-bold lg:text-4xl">
            Built for every role in the supply chain.
          </h2>
          <p className="font-roboto-slab text-text-colour max-w-xl text-lg">
            From farm to table, every step of the process is verified, transparent, and secure.
          </p>
        </div>

        {/* Cards grid */}
        <motion.div
          variants={SLOW_STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featureCards.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={SLIDE_UP_VARIANT}
              whileHover={CARD_HOVER}
              whileTap={CARD_TAP}
              className="border-gray-border flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <Icon className="text-theme-green-dark h-6 w-6" />
              </div>
              <h3 className="font-ubuntu text-heading-colour text-lg font-semibold">{title}</h3>
              <p className="font-roboto-slab text-text-colour text-sm">{description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/register"
            className="font-ubuntu bg-theme-green-dark hover:bg-theme-green-light rounded-full px-8 py-3 text-sm font-semibold text-white transition inline-flex items-center gap-2"
          >
            Get Started Free <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
