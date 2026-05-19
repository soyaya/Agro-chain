"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { adminService, type FishPriceConfig } from "~/lib/services/admin.service";
import { FALLBACK_PRICES_PER_KG, type FishType } from "~/types/constants";

// === Types

interface PlatformSettingsContextValue {
  pricePerKg: FishPriceConfig;
  isLoaded: boolean;
  /** Compute pricePerUnit for a given fish type and weight. Falls back to FALLBACK_PRICES_PER_KG. */
  getPricePerUnit: (fishType: string, weightKg: number) => number;
}

// === Context

const PlatformSettingsContext = createContext<PlatformSettingsContextValue>({
  pricePerKg: FALLBACK_PRICES_PER_KG,
  isLoaded: false,
  getPricePerUnit: (fishType, weightKg) => {
    const price = FALLBACK_PRICES_PER_KG[fishType as FishType] ?? FALLBACK_PRICES_PER_KG.catfish;
    return weightKg * price;
  },
});

// === Provider

export function PlatformSettingsProvider({ children }: { children: ReactNode }) {
  const [pricePerKg, setPricePerKg] = useState<FishPriceConfig>(FALLBACK_PRICES_PER_KG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    adminService
      .getSettings()
      .then((res) => {
        setPricePerKg(res.data.settings.pricePerKg);
        setIsLoaded(true);
      })
      .catch(() => {
        // Backend not yet available — fallback prices remain active
        setIsLoaded(true);
      });
  }, []);

  const getPricePerUnit = (fishType: string, weightKg: number): number => {
    const pricePerKgForType = pricePerKg[fishType as FishType] ?? pricePerKg.catfish;
    return weightKg * pricePerKgForType;
  };

  return (
    <PlatformSettingsContext.Provider value={{ pricePerKg, isLoaded, getPricePerUnit }}>
      {children}
    </PlatformSettingsContext.Provider>
  );
}

// === Hook

export function usePlatformSettings() {
  return useContext(PlatformSettingsContext);
}
