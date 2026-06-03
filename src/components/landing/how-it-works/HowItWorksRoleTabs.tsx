"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT_EXPO } from "~/types/constants";
import type { FAQ } from "~/types/types";
import SectionFAQ from "~/components/SectionFAQ";

interface RoleStep {
  title: string;
  description: string;
}

interface RoleData {
  label: string;
  steps: RoleStep[];
}

const roles: RoleData[] = [
  {
    label: "Farmer",
    steps: [
      {
        title: "Register",
        description:
          'Create an account and select "Farmer" as your role. Complete your profile with farm details, location, and fish type.',
      },
      {
        title: "Create a Listing",
        description:
          "Enter your fish type, harvest date, total available kg, and weight per fish. Price is set automatically by the platform.",
      },
      {
        title: "Await Cluster Approval",
        description:
          "Your listing is sent to your assigned cluster farmer for review. They approve or reject with a reason within 24–48 hours.",
      },
      {
        title: "Listing Goes Live",
        description:
          "Once approved, your supply appears on the marketplace under your cluster farmer's name. Buyers can now order.",
      },
      {
        title: "Get Paid",
        description:
          "When a buyer confirms delivery, your payout is released to your cluster farmer who distributes to you.",
      },
    ],
  },
  {
    label: "Cluster Farmer",
    steps: [
      {
        title: "Apply for Cluster Status",
        description:
          "Submit your business documents (CAC, BVN, warehouse location). Admin reviews and approves your application.",
      },
      {
        title: "Manage Your Farmers",
        description:
          "Farmers in your area are automatically assigned to you. Review their listings and approve or reject with feedback.",
      },
      {
        title: "Create Your Own Listings",
        description:
          "List your aggregated supply directly on the marketplace with your warehouse location and delivery options.",
      },
      {
        title: "Fulfill Orders",
        description:
          "When buyers order, you process, pack, and ship. Update order status in your dashboard as it progresses.",
      },
      {
        title: "Receive Payout",
        description:
          "After buyer confirms delivery, funds are released from escrow to your account after the selected delay window.",
      },
    ],
  },
  {
    label: "Buyer",
    steps: [
      {
        title: "Browse the Marketplace",
        description:
          "No account needed to browse. Filter by fish type, state, or price range. View full listing details including seller info.",
      },
      {
        title: "Add to Cart",
        description:
          "Select your packaging size, variant (dried, jumbo, table size, broodstock), and quantity. Add to cart.",
      },
      {
        title: "Checkout",
        description:
          "Choose pickup or delivery. Enter delivery address if needed. Review your order total including delivery fee.",
      },
      {
        title: "Pay Securely",
        description:
          "Pay via Paystack (card or bank transfer). Funds are held in escrow until you confirm delivery.",
      },
      {
        title: "Confirm Delivery",
        description:
          "When your order arrives, confirm delivery in your dashboard. This releases payment to the cluster farmer.",
      },
    ],
  },
];

const PANEL_VARIANTS = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(2px)",
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

const STEP_CONTAINER_VARIANTS = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const STEP_ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

interface HowItWorksRoleTabsProps {
  farmerFaqs: FAQ[];
  clusterFarmerFaqs: FAQ[];
  buyerFaqs: FAQ[];
}

export default function HowItWorksRoleTabs({
  farmerFaqs,
  clusterFarmerFaqs,
  buyerFaqs,
}: HowItWorksRoleTabsProps) {
  const [activeRole, setActiveRole] = useState(0);

  const faqMap = [farmerFaqs, clusterFarmerFaqs, buyerFaqs];

  return (
    <>
      {/* Section 2 - Role Tabs */}
      <section aria-label="Role Steps" className="bg-white">
        <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
          {/* Tab buttons */}
          <div
            className="bg-gray-bg flex w-fit gap-2 rounded-full p-1"
            role="tablist"
            aria-label="Select your role"
          >
            {roles.map(({ label }, i) => (
              <button
                key={label}
                role="tab"
                aria-selected={activeRole === i}
                aria-controls={`role-panel-${i}`}
                onClick={() => setActiveRole(i)}
                className={`font-ubuntu cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ease-in-out ${
                  activeRole === i
                    ? "bg-theme-green-dark text-white shadow"
                    : "text-text-colour hover:text-heading-colour"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Steps timeline */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              id={`role-panel-${activeRole}`}
              role="tabpanel"
              variants={PANEL_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-10"
            >
              <motion.div
                variants={STEP_CONTAINER_VARIANTS}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-0"
              >
                {roles[activeRole].steps.map(({ title, description }, stepIndex) => (
                  <motion.div key={title} variants={STEP_ITEM_VARIANTS} className="flex gap-6">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center">
                      <div className="bg-theme-green-dark flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                        {stepIndex + 1}
                      </div>
                      {stepIndex < roles[activeRole].steps.length - 1 && (
                        <div className="bg-gray-border mt-1 w-0.5 flex-1" />
                      )}
                    </div>

                    {/* Step content */}
                    <div className="pb-8">
                      <h3 className="font-ubuntu text-heading-colour text-lg font-semibold">
                        {title}
                      </h3>
                      <p className="font-roboto-slab text-text-colour mt-1 text-base">
                        {description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Section 3 - Role-specific FAQ */}
      <SectionFAQ
        faqs={faqMap[activeRole]}
        heading={`Questions from ${roles[activeRole].label}s`}
        subtext="Most common questions from this role on the platform."
        ctaLabel="Get Started"
        ctaHref="/register"
      />
    </>
  );
}
