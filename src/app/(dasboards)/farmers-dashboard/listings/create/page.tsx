"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SupplyListingForm } from "~/components/listings/SupplyListingForm";
import type { SupplyListingFormData } from "~/types";
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import { farmerService } from "~/lib/services/farmer.service";
import { toast } from "sonner";

export default function CreateListingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: SupplyListingFormData) => {
    setIsLoading(true);
    try {
      await farmerService.createListing({
        fishType: data.fishType,
        harvestDate: data.harvestDate.toISOString(),
        totalFishAvailable: data.totalAvailableKg,
        weightKg: data.weightKg,
      });

      toast.success("Listing submitted successfully.");
      router.push("/farmers-dashboard/listings");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create listing";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--gray-bg)">
      <div className="container-max-width px-(--section-px) py-(--section-py) sm:px-(--section-px-sm) sm:py-(--section-py-sm) lg:px-(--section-px-lg) lg:py-(--section-py-lg)">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          }}
          className="flex flex-col gap-(--section-gap)"
        >
          {/* Header */}
          <motion.div variants={FADE_IN_VARIANT} className="flex flex-col gap-(--gap-base)">
            <button
              onClick={() => router.back()}
              className="flex w-fit items-center gap-2 text-(--text-colour) transition hover:text-(--heading-colour)"
            >
              <ArrowLeft size={20} />
              Back to Listings
            </button>

            <div>
              <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour) lg:text-4xl">
                Create Supply Listing
              </h1>
              <p className="mt-2 text-(--text-colour)">
                Submit your fish supply for cluster farmer approval
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            variants={SLIDE_UP_VARIANT}
            className="rounded-3xl bg-(--white) p-(--space-xl) shadow-sm lg:p-(--section-gap)"
          >
            <SupplyListingForm onSubmit={handleSubmit} isLoading={isLoading} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
