"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";

type Step = {
  heading: string;
  description: string;
};

type OnboardingProps = {
  steps: Step[];
  onFinish?: () => void;
};

export default function Onboarding({ steps, onFinish }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onFinish?.();
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center justify-center gap-10 text-center px-6 py-16">
      
      {/* Heading + Description */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white">
          {steps[currentStep].heading}
        </h1>

        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
          {steps[currentStep].description}
        </p>
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center gap-3">
        {steps.map((_, index) => (
          <span
            key={index}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              index === currentStep
                ? "bg-black dark:bg-white scale-110"
                : "bg-zinc-300 dark:bg-zinc-700"
            }`}
          />
        ))}
      </div>

      {/* Button */}
      <Button
        onClick={handleNext}
        className="rounded-full px-10 py-6 text-base font-medium"
      >
        {isLastStep ? "Get Started" : "Next"}
      </Button>
    </div>
  );
}