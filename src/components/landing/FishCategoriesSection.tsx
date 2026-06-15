"use client";

import Link from "next/link";
import { motion, type TargetAndTransition } from "framer-motion";
import { ArrowRight, Flame, Fish, Sparkles } from "lucide-react";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { fishCategoryGroups } from "~/models/models";
import type { FishCategoryGroup } from "~/types/types";

const CARD_HOVER: TargetAndTransition = {
  y: -6,
  scale: 1.02,
  transition: { duration: 0.22, ease: "easeOut" },
};

const CARD_TAP: TargetAndTransition = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

const CATEGORY_ICONS = {
  live: Fish,
  processed: Flame,
  demand: Sparkles,
};

function CategoryCard({ group }: { group: FishCategoryGroup }) {
  const Icon =
    CATEGORY_ICONS[group.categoryParam as keyof typeof CATEGORY_ICONS] ?? Fish;

  if (group.isSpecialDemand) {
    return (
      <motion.div
        variants={SLIDE_UP_VARIANT}
        whileHover={CARD_HOVER}
        whileTap={CARD_TAP}
        className="border-gray-border flex cursor-pointer flex-col gap-5 rounded-2xl border-2 border-dashed bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="bg-theme-green-dark/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Icon size={20} className="text-theme-green-dark" />
          </span>
          <h3 className="font-ubuntu text-heading-colour text-lg font-bold">
            {group.name}
          </h3>
        </div>

        <p className="font-roboto-slab text-text-colour flex-1 text-sm leading-relaxed">
          {group.description}
        </p>

        <Link
          href={group.ctaHref}
          className="bg-theme-green-dark font-ubuntu mt-auto flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {group.ctaLabel}
          <ArrowRight size={15} />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={SLIDE_UP_VARIANT}
      whileHover={CARD_HOVER}
      whileTap={CARD_TAP}
      className="border-gray-border flex cursor-pointer flex-col gap-5 rounded-2xl border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="bg-green-tint flex h-10 w-10 items-center justify-center rounded-xl">
          <Icon size={20} className="text-theme-green-dark" />
        </span>
        <h3 className="font-ubuntu text-heading-colour text-lg font-bold">
          {group.name}
        </h3>
      </div>

      <p className="font-roboto-slab text-text-colour text-sm leading-relaxed">
        {group.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {group.subTypes.map((sub) => (
          <span
            key={sub.value}
            className="font-roboto-slab border-gray-border text-text-colour bg-gray-bg rounded-full border px-3 py-1 text-xs font-medium"
          >
            {sub.label}
          </span>
        ))}
      </div>

      <Link
        href={group.ctaHref}
        className="font-ubuntu text-theme-green-dark mt-auto flex items-center gap-1 text-sm font-semibold transition hover:underline"
      >
        {group.ctaLabel} <ArrowRight size={14} />
      </Link>
    </motion.div>
  );
}

export default function FishCategoriesSection() {
  return (
    <section aria-label="Browse by Category" className="bg-gray-bg">
      <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="font-ubuntu text-theme-green-dark text-xs font-semibold tracking-widest uppercase">
            Browse by Category
          </span>
          <h2 className="font-ubuntu text-heading-colour text-3xl font-bold lg:text-4xl">
            Find the catfish you need.
          </h2>
          <p className="font-roboto-slab text-text-colour max-w-xl text-lg">
            Live or processed — verified catfish supply across every category,
            with a special demand option when you need something custom.
          </p>
        </div>

        {/* Cards */}
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {fishCategoryGroups.map((group) => (
            <CategoryCard key={group.key} group={group} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
