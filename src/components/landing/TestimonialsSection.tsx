"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { testimonials } from "~/models/models";

export default function TestimonialsSection() {
  return (
    <section aria-label="Testimonials" className="bg-theme-green-dark">
      <div className="content-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="font-ubuntu text-xs font-semibold tracking-widest text-green-300 uppercase">
            Testimonials
          </span>
          <h2 className="font-ubuntu text-3xl font-bold text-white lg:text-4xl">
            Trusted by farmers and buyers alike.
          </h2>
        </div>

        {/* Cards */}
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {testimonials.map(({ quote, name, role }) => (
            <motion.div
              key={name}
              variants={SLIDE_UP_VARIANT}
              className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/10 p-6"
            >
              <span className="font-serif text-6xl leading-none text-white/20" aria-hidden="true">
                &quot;
              </span>
              <p className="font-roboto-slab text-base text-white/90 italic">{quote}</p>
              <p className="font-ubuntu text-sm text-white/60">
                {name}, {role}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/register"
            className="font-ubuntu text-theme-green-dark rounded-full bg-white px-8 py-3 text-sm font-semibold transition hover:bg-white/90"
          >
            Join them →
          </Link>
        </div>
      </div>
    </section>
  );
}
