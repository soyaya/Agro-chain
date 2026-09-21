"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Download } from "lucide-react";
import { usePwaInstall } from "~/hooks/usePwaInstall";

// Bottom-sheet banner that slides up on mobile when the browser's
// install prompt is available. Completely hidden on desktop (≥768px).
export function PwaInstallBanner() {
  const { showBanner, install, dismiss, isInstalling } = usePwaInstall();
  const [visible, setVisible] = useState(false);

  // Slight delay so it doesn't flash immediately on page load
  useEffect(() => {
    if (!showBanner) return;
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [showBanner]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install AgroChain app"
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up md:hidden"
    >
      {/* Backdrop blur strip */}
      <div className="mx-3 mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Green accent bar at top */}
        <div className="h-1 w-full bg-[#1a5c1a]" />

        <div className="flex items-center gap-4 px-4 py-4">
          {/* App icon */}
          <div className="shrink-0">
            <Image
              src="/icons/icon-192x192.png"
              alt="AgroChain"
              width={52}
              height={52}
              className="rounded-xl"
            />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="font-ubuntu text-sm font-bold text-[#1a5c1a]">
              Install AgroChain
            </p>
            <p className="font-roboto-slab mt-0.5 truncate text-xs text-gray-500">
              Add to home screen for the best experience
            </p>
          </div>

          {/* Install button */}
          <button
            onClick={install}
            disabled={isInstalling}
            aria-label="Install app"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#1a5c1a] px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Download size={14} />
            {isInstalling ? "Installing…" : "Install"}
          </button>

          {/* Dismiss */}
          <button
            onClick={() => { setVisible(false); dismiss(); }}
            aria-label="Dismiss install banner"
            className="ml-1 shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
