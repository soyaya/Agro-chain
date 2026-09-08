"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";

const ONBOARDING_KEY = "onboarding-completed";

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

export function OnboardingOverlay() {
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
                className="flex w-full flex-col gap-6"
              >
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
