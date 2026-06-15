"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LocationData {
  address: string;
  latitude?: number;
  longitude?: number;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (location: LocationData) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<LocationData | null>(null);

  const setLocation = (location: LocationData) => {
    setLocationState(location);
  };

  const clearLocation = () => {
    setLocationState(null);
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
}
