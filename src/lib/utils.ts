import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates a `returnTo` query param before using it as a redirect target.
 * Only accepts a same-origin relative path — never an absolute or
 * protocol-relative URL, which could otherwise be used as an open redirect.
 * Returns "" (falsy) when the input is missing or unsafe.
 */
export function getSafeReturnTo(returnTo: string | null | undefined): string {
  if (!returnTo) return "";
  return returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "";
}
