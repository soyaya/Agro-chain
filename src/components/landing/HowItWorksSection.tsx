"use client";

import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { howItWorksCards } from "~/models/models";

export default function HowItWorksSection() {
  return (
    <section aria-label="How It Works" className="bg-section-dark">
      <div className="content-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
        {/* Section label */}
        <span className="font-ubuntu text-xs font-semibold tracking-widest text-green-400 uppercase">
          How It Works
        </span>

        {/* Two-column intro */}
        <div className="mt-4 flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          <h2 className="font-ubuntu text-3xl font-bold text-white lg:text-4xl">
            Three roles.
            <br />
            One platform.
          </h2>
          <p className="font-roboto-slab text-lg text-white/60 lg:pt-2">
            Whether you grow fish, aggregate supply, or buy in bulk, Agro-chain has a dedicated flow
            built for you.
          </p>
        </div>

        {/* Cards */}
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {howItWorksCards.map(({ number, icon: Icon, title, steps }) => (
            <motion.div
              key={title}
              variants={SLIDE_UP_VARIANT}
              className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center gap-3">
                <span className="bg-theme-green-dark flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                  {number}
                </span>
                <Icon className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="font-ubuntu text-xl font-semibold text-white">{title}</h3>
              <ul className="flex flex-col gap-2">
                {steps.map((step) => (
                  <li key={step} className="font-roboto-slab text-sm text-white/60">
                    {step}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
