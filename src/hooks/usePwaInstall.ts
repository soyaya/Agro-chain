"use client";

import { useEffect, useState } from "react";

// The browser fires this before showing its own install UI.
// We intercept it, hold the prompt, and fire it ourselves only on mobile.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const MOBILE_BREAKPOINT = 768; // px — matches Tailwind's `md` breakpoint
const DISMISSED_KEY = "pwa_install_dismissed";
const INSTALLED_KEY = "pwa_install_done";

export function usePwaInstall() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Detect mobile screen size and watch for resizes
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Read persisted dismissal / install state
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
    setIsInstalled(
      localStorage.getItem(INSTALLED_KEY) === "true" ||
        window.matchMedia("(display-mode: standalone)").matches,
    );
  }, []);

  // Capture the browser's install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Track successful installs
  useEffect(() => {
    const handler = () => {
      setIsInstalled(true);
      localStorage.setItem(INSTALLED_KEY, "true");
      setPromptEvent(null);
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    setIsInstalling(true);
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        localStorage.setItem(INSTALLED_KEY, "true");
      } else {
        dismiss();
      }
    } finally {
      setIsInstalling(false);
      setPromptEvent(null);
    }
  };

  const dismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  // Show the banner only when:
  // - on a mobile-sized screen
  // - browser has a deferred install prompt ready
  // - user hasn't dismissed or already installed
  const showBanner =
    isMobile && !!promptEvent && !isDismissed && !isInstalled;

  return { showBanner, install, dismiss, isInstalling, isInstalled };
}
