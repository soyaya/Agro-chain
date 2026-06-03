"use client";

import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANT, STAT_ITEM_VARIANT } from "~/types/constants";
import type { ImpactStat } from "~/types/types";

const aboutStats: ImpactStat[] = [
  { value: "₦500B+", label: "Industry Size" },
  { value: "300K MT", label: "Annual Output" },
  { value: "6 Fish", label: "Types Listed" },
  { value: "3 Roles", label: "Served" },
];

export default function AboutStatsSection() {
  return (
    <section aria-label="About Impact Numbers" className="bg-theme-green-dark">
      <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 gap-8 lg:grid-cols-4"
        >
          {aboutStats.map(({ value, label }) => (
            <motion.div
              key={label}
              variants={STAT_ITEM_VARIANT}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span
                className="font-ubuntu font-bold text-white"
                style={{ fontSize: "var(--stat-number-size)" }}
              >
                {value}
              </span>
              <span className="font-roboto-slab text-sm text-white/60">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
