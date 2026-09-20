"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";

const ONBOARDING_KEY = "onboarding-completed";

const CLOUDINARY = "https://res.cloudinary.com/erw7cxay/image/upload/v1788775005";

// Each step pairs a catfish photo with one thing the platform actually does
// (all of it is enforced in the backend: cluster-farmer approval, admin-set
// price catalog, pickup/handoff delivery photos, payout after confirmation).
const steps = [
  {
    heading: "Explore",
    description:
      "Fresh catfish from verified cluster farmers near you — table size, broodstock, fingerlings and dried.",
    imageUrl: `${CLOUDINARY}/Table_size.jpg`,
    imageAlt: "Fresh table-size catfish",
  },
  {
    heading: "Order It",
    description:
      "Fair prices set by us, not haggled over. Pay from your wallet and we take it from there.",
    imageUrl: `${CLOUDINARY}/Broodstock.jpg`,
    imageAlt: "Healthy broodstock catfish",
  },
  {
    heading: "You Got It",
    description:
      "We photograph your fish at pickup and at handoff, and farmers are paid only after you confirm.",
    imageUrl: `${CLOUDINARY}/Dry_Fish.jpg`,
    imageAlt: "Dried catfish",
  },
];

export function OnboardingOverlay() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setVisible(true);
    }
    setMounted(true);
  }, []);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    if (!visible) return;
    headingRef.current?.focus();
  }, [currentStep, visible]);

  useEffect(() => {
    if (!visible) return;
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !loading) {
        e.preventDefault();
        buttonRef.current?.click();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [loading, visible]);

  const goToStep = useCallback((index: number) => {
    if (loading || index === currentStep) return;

    setLoading(true);
    setDirection(index > currentStep ? 1 : -1);

    setTimeout(() => {
      setCurrentStep(index);
      setLoading(false);
    }, 400);
  }, [loading, currentStep]);

  const handleNext = useCallback(() => {
    if (loading) return;

    if (isLastStep) {
      localStorage.setItem(ONBOARDING_KEY, "true");
      setVisible(false);
      return;
    }

    goToStep(currentStep + 1);
  }, [currentStep, goToStep, isLastStep, loading]);

  useEffect(() => {
    if (!visible || loading || isLastStep) return;

    const timer = setTimeout(() => {
      goToStep(currentStep + 1);
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentStep, goToStep, loading, isLastStep, visible]);

  useEffect(() => {
    if (!visible || loading || !isLastStep) return;

    const timer = setTimeout(() => {
      handleNext();
    }, 4000);

    return () => clearTimeout(timer);
  }, [handleNext, isLastStep, loading, visible]);

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

  if (!mounted || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex h-full w-full overflow-hidden bg-zinc-100"
      role="application"
      aria-label="Agro-chain onboarding"
    >
      <main
        className="relative flex min-h-screen w-full flex-col items-center justify-center text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-1 items-center justify-center" role="region" aria-label="Onboarding content">
          <div className="relative flex w-full max-w-md flex-col items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                id={`step-panel-${currentStep}`}
                role="tabpanel"
                aria-labelledby={`step-tab-${currentStep}`}
                aria-live="polite"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex w-full flex-col gap-6 px-6"
              >
                <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-zinc-200 shadow-sm sm:h-64">
                  {/* Slow zoom + drift (Ken Burns); direction alternates per
                      step so consecutive photos don't move the same way. */}
                  <motion.div
                    className="absolute inset-0"
                    // Starts at 1.25, not 1: the Broodstock source photo has
                    // white bars baked into its left/right edges, which this
                    // crop keeps out of frame (drift stays well inside the
                    // ~12% margin the extra zoom creates).
                    initial={{ scale: 1.25, x: 0, y: 0 }}
                    animate={
                      reduceMotion
                        ? { scale: 1.25, x: 0, y: 0 }
                        : {
                            scale: 1.4,
                            x: currentStep % 2 === 0 ? -14 : 14,
                            y: currentStep === 1 ? 8 : -8,
                          }
                    }
                    transition={{ duration: 6, ease: "easeOut" }}
                  >
                    <Image
                      src={steps[currentStep].imageUrl}
                      alt={steps[currentStep].imageAlt}
                      fill
                      priority={currentStep === 0}
                      sizes="(max-width: 448px) 100vw, 448px"
                      className="object-cover"
                    />
                  </motion.div>
                  {/* Soft light sweeping across the "water" */}
                  {!reduceMotion && (
                    <motion.div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent"
                      initial={{ x: "0%" }}
                      animate={{ x: "400%" }}
                      transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
                    />
                  )}
                </div>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-3xl font-semibold focus:outline-none sm:text-4xl"
                  aria-label={`Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].heading}`}
                >
                  {steps[currentStep].heading}
                </h1>

                <p className="text-lg text-zinc-600" aria-label={steps[currentStep].description}>
                  {steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex w-full max-w-md flex-col items-center gap-6 pb-8" role="region" aria-label="Onboarding navigation">
          <div className="flex items-center gap-3" role="tablist" aria-label="Onboarding steps navigation">
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
                  aria-label={`Go to step ${index + 1} of ${steps.length}: ${step.heading}`}
                  tabIndex={isActive ? 0 : -1}
                  disabled={loading}
                  data-active={isActive}
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
                />
              );
            })}
          </div>

          <div className="w-full max-w-xs">
            <SubmitPrimaryButton
              ref={buttonRef}
              type="button"
              loading={loading}
              loadingText="Loading next step"
              onClick={handleNext}
              aria-disabled={loading}
              aria-label={isLastStep ? "Get started with Agro-chain" : `Continue to step ${currentStep + 2} of ${steps.length}`}
            >
              {isLastStep ? "Get Started" : "Next"}
            </SubmitPrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}
