"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { fishCategories } from "~/models/models";
import ArrowRightIcon from "lucide-react";

export default function FishCategoriesSection() {
  return (
    <section aria-label="Browse by Category" className="bg-gray-bg">
      <div className="content-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="font-ubuntu text-theme-green-dark text-xs font-semibold tracking-widest uppercase">
            Browse by Category
          </span>
          <h2 className="font-ubuntu text-heading-colour text-3xl font-bold lg:text-4xl">
            Find the fish type you need.
          </h2>
          <p className="font-roboto-slab text-text-colour max-w-xl text-lg">
            From fingerlings to table-size catfish - verified supply across every category.
          </p>
        </div>

        {/* Grid */}
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {fishCategories.map(({ key, name, description, fishTypeParam }) => (
            <motion.div
              key={key}
              variants={SLIDE_UP_VARIANT}
              className="border-gray-border flex flex-col items-center gap-3 rounded-2xl border bg-white p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <span className="text-4xl" aria-hidden="true">
                🐟
              </span>
              <h3 className="font-ubuntu text-heading-colour text-sm font-bold">{name}</h3>
              <p className="font-roboto-slab text-text-colour text-xs">{description}</p>
              <Link
                href={`/marketplace?fishType=${fishTypeParam}`}
                className="font-ubuntu text-theme-green-dark text-xs font-medium transition hover:underline"
              >
                Browse <ArrowRightIcon size={12} />

              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
