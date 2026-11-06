"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Fish,
  CheckCircle2,
  Banknote,
  Truck,
  Camera,
  PackageCheck,
  ClipboardCheck,
  Store,
  Bell,
  FlaskConical,
  Warehouse,
  Users,
} from "lucide-react";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";

interface GuideStep {
  heading: string;
  description: string;
  Icon: LucideIcon;
}

// Same engine as the buyer-facing OnboardingOverlay on the marketplace page,
// generalized to any role — buyer already has its own (richer, illustrated)
// version there, so it's deliberately left out of this role map to avoid
// showing two different welcome overlays to the same buyer account.
const GUIDES: Partial<Record<string, GuideStep[]>> = {
  farmer: [
    { heading: "List Your Fish or Feed", description: "Set your harvest or feed stock, quantity, and price — submit it for review.", Icon: Fish },
    { heading: "Get Approved", description: "A cluster farmer in your area reviews and approves your listing, then it's live on the marketplace.", Icon: CheckCircle2 },
    { heading: "Get Paid", description: "Once a buyer confirms delivery, your payout is scheduled automatically — no chasing required.", Icon: Banknote },
  ],
  cluster: [
    { heading: "Review Nearby Listings", description: "Approve or decline listings from farmers in your area, and manage your own private marketplace.", Icon: ClipboardCheck },
    { heading: "Fulfill Orders", description: "Receive dispatched orders, hand them to a rider or keep them ready for pickup.", Icon: Truck },
    { heading: "Earn Your Incentive", description: "You're paid an incentive on every order you help fulfill, on top of your own listings.", Icon: Banknote },
  ],
  rider: [
    { heading: "Get Assigned Deliveries", description: "A cluster farmer escalates an order to you once it's ready for delivery.", Icon: Truck },
    { heading: "Confirm With Photos", description: "Take a photo at pickup and another at handoff — this protects both you and the buyer.", Icon: Camera },
    { heading: "Get Paid", description: "Your delivery fee is paid out once the buyer confirms they received their order.", Icon: PackageCheck },
  ],
  supply_admin: [
    { heading: "Manage Your Contract", description: "Your supply price and payout terms are set by AgroChain and shown on your dashboard.", Icon: Warehouse },
    { heading: "Track Fulfillment", description: "Keep an eye on orders routed through your supply chain.", Icon: ClipboardCheck },
    { heading: "Get Paid", description: "Payouts follow the delay terms set in your contract.", Icon: Banknote },
  ],
  procurement_officer: [
    { heading: "Claim Fallback Orders", description: "When an order has no cluster farmer available — or one declines it — you can claim and fulfill it yourself.", Icon: Store },
    { heading: "Log Farm Visits", description: "Record stocking, weekly sampling, harvest, and water/health readings for the farmers you consult.", Icon: FlaskConical },
    { heading: "Help Farmers Grow", description: "Your records help farmers track performance and catch problems early.", Icon: Users },
  ],
};

function storageKeyFor(role: string) {
  return `first-time-guide-${role}`;
}

export function FirstTimeGuide({ role, isClusterFarmer }: { role?: string; isClusterFarmer?: boolean }) {
  // useAuth() maps the backend's "cluster" (and "pending") role down to
  // "farmer" for the rest of the app, tracking the distinction separately
  // via isClusterFarmer — undo that here so a cluster farmer gets their own
  // guide content instead of the plain farmer one.
  const effectiveRole = isClusterFarmer ? "cluster" : role;
  const steps = effectiveRole ? GUIDES[effectiveRole] : undefined;
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!steps || !effectiveRole) return;
    if (!localStorage.getItem(storageKeyFor(effectiveRole))) {
      setVisible(true);
    }
    setMounted(true);
  }, [effectiveRole, steps]);

  const isLastStep = steps ? currentStep === steps.length - 1 : true;

  useEffect(() => {
    if (!visible) return;
    headingRef.current?.focus();
  }, [currentStep, visible]);

  const goToStep = useCallback(
    (index: number) => {
      if (loading || index === currentStep) return;
      setLoading(true);
      setDirection(index > currentStep ? 1 : -1);
      setTimeout(() => {
        setCurrentStep(index);
        setLoading(false);
      }, 400);
    },
    [loading, currentStep],
  );

  const handleNext = useCallback(() => {
    if (loading) return;
    if (isLastStep) {
      if (effectiveRole) localStorage.setItem(storageKeyFor(effectiveRole), "true");
      setVisible(false);
      return;
    }
    goToStep(currentStep + 1);
  }, [currentStep, goToStep, isLastStep, loading, effectiveRole]);

  if (!steps || !mounted || !visible) return null;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const { heading, description, Icon } = steps[currentStep];

  return (
    <div
      className="fixed inset-0 z-100 flex h-full w-full overflow-hidden bg-zinc-100"
      role="application"
      aria-label="AgroChain first-time guide"
    >
      <main
        className="relative flex min-h-screen w-full flex-col items-center justify-center text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-1 items-center justify-center">
          <div className="relative flex w-full max-w-md flex-col items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex w-full flex-col items-center gap-6 px-6"
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-(--theme-green-dark)/10">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={reduceMotion ? { scale: 0.9 } : { scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <Icon size={56} className="text-(--theme-green-dark)" />
                  </motion.div>
                </div>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-3xl font-semibold focus:outline-none sm:text-4xl"
                >
                  {heading}
                </h1>
                <p className="text-lg text-zinc-600">{description}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex w-full max-w-md flex-col items-center gap-6 pb-8">
          <div className="flex items-center gap-3" role="tablist" aria-label="Guide steps">
            {steps.map((_, index) => {
              const isActive = index === currentStep;
              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  disabled={loading}
                  onClick={() => goToStep(index)}
                  className={`h-3 w-3 rounded-full bg-(--black) transition-all duration-300 ease-in-out hover:cursor-pointer disabled:opacity-60 ${
                    isActive ? "scale-120 opacity-100" : "opacity-50"
                  }`}
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
            >
              {isLastStep ? "Get Started" : "Next"}
            </SubmitPrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}
