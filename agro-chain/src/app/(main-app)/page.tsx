"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";

const metadata = {
  title: "Agro-chain | Connecting Catfish Farmers & Bulk Buyers",
  description:
    "Agro-chain is a trusted marketplace connecting cluster catfish farmers with verified buyers. Secure payments, transparent pricing, and reliable logistics — all in one platform.",

  keywords: [
    "catfish marketplace",
    "catfish farmers",
    "bulk fish buyers",
    "aquaculture Nigeria",
    "fish supply chain",
    "cluster farming",
    "fresh catfish vendors",
  ],

  openGraph: {
    url: "/",
    title: "Agro-chain | Farm-to-Buyer Catfish Marketplace",
    description:
      "Buy and sell catfish with confidence. We connect cluster farmers to bulk buyers with secure payments and coordinated delivery.",
    siteName: "Agro-chain",
    locale: "en_NG",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Agro-chain | Connecting Farmers to Buyers",
    description:
      "A digital marketplace for cluster catfish farmers and verified buyers. Secure transactions and seamless logistics.",
  },

  alternates: {
    canonical: "/",
  },

  category: "Agriculture",
};

export default function Home() {
  const router = useRouter();

  const steps = [
    {
      heading: "Explore",
      description: "We guarantee total satisfaction",
    },
    {
      heading: "Order It",
      description:
        "Welcome! We're here to simplify your life. Sit back, relax, and let's get started.",
    },
    {
      heading: "You Got It",
      description: "New Users, score big! Grab FREE delivery on us with this exclusive offer!",
    },
  ];

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const isLastStep = currentStep === steps.length - 1;

  // === Focus on step change
  useEffect(() => {
    headingRef.current?.focus();
  }, [currentStep]);

  const goToStep = useCallback((index: number) => {
    if (loading || index === currentStep) return;

    setLoading(true);
    setDirection(index > currentStep ? 1 : -1);

    setTimeout(() => {
      setCurrentStep(index);
      setLoading(false);
    }, 400);
  }, [loading, currentStep]);

  useEffect(() => {
  if (loading || isLastStep) return;

  const timer = setTimeout(() => {
    goToStep(currentStep + 1);
  }, 4000);

  return () => clearTimeout(timer);
}, [currentStep, goToStep, loading, isLastStep]);

  // === Handle Next
  const handleNext = useCallback(() => {
    if (loading) return;

    if (isLastStep) {
      localStorage.setItem("onboarding-completed", "true");
      router.push("/authentication");
      return;
    }

    goToStep(currentStep + 1);
  }, [currentStep, goToStep, isLastStep, loading, router]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-zinc-100">
      <main
        className="relative flex min-h-screen w-full flex-col items-center justify-center text-center"
        aria-live="polite"
      >
        {/* Step Content */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative flex w-full max-w-md flex-col items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                id={`step-panel-${currentStep}`}
                role="tabpanel"
                aria-labelledby={`step-tab-${currentStep}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex w-full flex-col gap-6"
              >
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-3xl font-semibold focus:outline-none sm:text-4xl"
                >
                  {steps[currentStep].heading}
                </h1>

                <p className="text-lg text-zinc-600">{steps[currentStep].description}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="flex w-full max-w-md flex-col items-center gap-6 pb-8">
          {/* Dots */}
          <div className="flex items-center gap-3" role="tablist" aria-label="Onboarding steps">
            {steps.map((step, index) => {
              const isActive = index === currentStep;

              return (
                <motion.button
                  key={index}
                  id={`step-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`step-panel-${index}`}
                  tabIndex={isActive ? 0 : -1}
                  disabled={loading}
                  data-active={isActive} // 👈 ACTIVE STATE FOR STYLING
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.15 }}
                  onClick={() => goToStep(index)}
                  onKeyDown={(e) => {
                    if (loading) return;

                    switch (e.key) {
                      case "ArrowRight":
                        e.preventDefault();
                        goToStep((index + 1) % steps.length);
                        break;
                      case "ArrowLeft":
                        e.preventDefault();
                        goToStep((index - 1 + steps.length) % steps.length);
                        break;
                      case "Home":
                        e.preventDefault();
                        goToStep(0);
                        break;
                      case "End":
                        e.preventDefault();
                        goToStep(steps.length - 1);
                        break;
                    }
                  }}
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    opacity: isActive ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-3 w-3 rounded-full bg-(--black) transition-all duration-300 ease-in-out hover:cursor-pointer focus:ring-2 focus:ring-black focus:outline-none disabled:opacity-60 data-[active=true]:scale-120 data-[active=true]:opacity-100"
                  aria-label={`Go to step ${index + 1}: ${step.heading}`}
                />
              );
            })}
          </div>

          {/* Button */}
          <div className="w-full max-w-xs">
            <SubmitPrimaryButton
              type="button"
              loading={loading}
              loadingText="Loading next step"
              onClick={handleNext}
              aria-disabled={loading}
            >
              {isLastStep ? "Get Started" : "Next"}
            </SubmitPrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}
