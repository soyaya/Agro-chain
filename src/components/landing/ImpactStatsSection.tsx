"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { impactStats } from "~/models/models";

export default function ImpactStatsSection() {
  return (
    <section aria-label="Impact Stats" className="border-y border-gray-border bg-white">
      <div className="content-width px-section-px lg:px-section-px-lg sm:px-section-px-sm  py-section-py sm:py-section-py-sm lg:py-section-py-lg flex flex-col gap-6">
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 gap-8 lg:grid-cols-4"
        >
          {impactStats.map(({ value, label }) => (
            <motion.div
              key={label}
              variants={SLIDE_UP_VARIANT}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span
                className="font-ubuntu font-bold text-theme-green-dark"
                style={{ fontSize: "var(--stat-number-size)" }}
              >
                {value}
              </span>
              <span className="font-roboto-slab text-sm text-text-colour">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center">
          <Link
            href="/how-it-works"
            className="font-ubuntu flex items-center gap-1 text-sm font-medium text-theme-green-dark transition hover:underline"
          >
            See how it works <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
