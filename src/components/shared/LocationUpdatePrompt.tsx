"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, MapPinned } from "lucide-react";
import { useAuth } from "~/lib/auth-context";
import { getDashboardPath } from "~/lib/dashboard-path";

const DISMISS_KEY = "agro_chain_sub_community_prompt_dismissed";

// Nudges an existing account (created before the sub-community level
// existed) to fill it in. Dismissal is per-browser-session only (not
// permanent) — this is a progressive-completion prompt, not a one-time
// notice, so it keeps resurfacing on future visits until the field is
// actually set. For a farmer, setting it also re-resolves which cluster
// farmer they fall under (see findBestClusterFarmerMatch on the backend).
export function LocationUpdatePrompt() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!user || user.locationSubCommunity) return;
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, [user]);

  if (!user || user.locationSubCommunity || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Private browsing / storage disabled — fine, it just won't persist across reloads.
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-(--space-lg)">
      <MapPinned size={20} className="mt-0.5 shrink-0 text-amber-600" />
      <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
        <p className="font-roboto-slab text-sm text-amber-900">
          Add your sub-community to your profile — it helps us match you with the right cluster
          farmer and show you more accurate nearby listings.
        </p>
        <Link
          href={`${getDashboardPath(user)}/profile`}
          className="font-roboto-slab shrink-0 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Update now
        </Link>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 text-amber-600 transition hover:bg-amber-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}
