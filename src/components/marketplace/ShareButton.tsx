"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  text?: string;
  /** Path relative to the site origin, e.g. "/marketplace/abc123" — resolved to an absolute URL at click time. */
  path: string;
  /** Icon-only round button for cards; set false for a labeled inline button (detail pages). */
  compact?: boolean;
  className?: string;
}

// Uses the native Web Share API where available (mobile browsers, most
// desktop browsers now) so a user can share straight to WhatsApp, Facebook,
// X, etc. without us maintaining per-network share links. Falls back to
// copying the link when navigator.share isn't available (older desktop
// browsers) — still gets the user something they can paste anywhere.
export function ShareButton({ title, text, path, compact = true, className = "" }: ShareButtonProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const url = `${window.location.origin}${path}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled the share sheet — not an error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied — share it anywhere.");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleShare}
        aria-label={`Share ${title}`}
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-(--heading-colour) shadow-sm backdrop-blur transition hover:bg-white ${className}`}
      >
        <Share2 size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      aria-label={`Share ${title}`}
      className={`flex h-10 items-center justify-center gap-2 rounded-full border border-(--border-gray) px-4 text-sm font-medium text-(--text-colour) transition hover:bg-(--gray-bg) ${className}`}
    >
      <Share2 size={16} />
      Share
    </button>
  );
}
