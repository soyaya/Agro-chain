"use client";

import { useState, useEffect, startTransition } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { FAQ } from "~/types/types";
import Link from "next/link";

interface SectionFAQProps {
  faqs: FAQ[];
  heading?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function SectionFAQ({
  faqs,
  heading = "Frequently asked questions",
  subtext = "Have a question? We're here to help.",
  ctaLabel = "Contact Us",
  ctaHref = "/contact",
}: SectionFAQProps) {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setOpenIndex(null);
    });
  }, [pathname]);

  const visibleFaqs = showAll ? faqs : faqs.slice(0, 5);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section
      className="border-gray-border relative h-full w-full border-b"
      aria-label="FAQ Section"
    >
      <div className="px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg flex h-full flex-col gap-10 lg:grid lg:grid-cols-2 lg:gap-15">
        {/* Left column */}
        <div className="flex h-full flex-col justify-between gap-6 lg:gap-8">
          <h2 className="font-ubuntu text-heading-colour text-2xl font-semibold sm:text-3xl lg:text-4xl">
            {heading}
          </h2>

          <div className="flex flex-col gap-4">
            <p className="font-roboto-slab text-text-colour text-base sm:text-lg">
              {subtext}
            </p>
            <Link
              href={ctaHref}
              className="bg-theme-green-dark font-ubuntu hover:bg-theme-green-light inline-flex w-fit items-center rounded-2xl px-5 py-2.5 text-sm font-medium text-white transition"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>

        {/* Right column: accordion */}
        <motion.div layout className="flex flex-col">
          <AnimatePresence initial={false}>
            {visibleFaqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <motion.div
                  key={faq.question}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className={`border-gray-border flex flex-col border-b p-4 transition-all duration-300 ease-in-out ${
                    isOpen ? "bg-gray-bg" : "bg-transparent"
                  }`}
                >
                  <button
                    onClick={() =>
                      setOpenIndex((prev) => (prev === index ? null : index))
                    }
                    className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
                  >
                    <div className="font-ubuntu text-heading-colour flex items-center gap-4 text-lg font-medium sm:text-xl">
                      <span>{String(index + 1)}.</span>
                      <span>{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "mt-4 grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="font-roboto-slab text-text-colour-2 overflow-hidden text-base">
                      {faq.answer}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {faqs.length > 5 && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="font-ubuntu text-theme-green-dark mt-4 self-start text-sm font-medium underline decoration-transparent underline-offset-4 transition hover:decoration-current"
            >
              {showAll ? "Show Less" : "Show All"}
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
