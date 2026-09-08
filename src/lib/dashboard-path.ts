import type { AuthUser } from "~/types/index";

/**
 * Canonical role → dashboard section mapping, mirroring proxy.ts's
 * middleware-side redirect logic. Kept in one place because it's needed both
 * right after verification (verify/page.tsx) and as an ongoing self-correction
 * check on every dashboard page load (auth-context.tsx) — a role change
 * (e.g. a farmer's cluster application getting approved) doesn't retroactively
 * fix a URL the user is already sitting on or a stale routing cookie.
 */
export function getDashboardPath(user: AuthUser | null): string {
  if (!user) return "/buyers-dashboard";
  if (user.isClusterFarmer) return "/cluster-dashboard";
  if (user.role === "farmer") return "/farmers-dashboard";
  if (user.role === "rider") return "/rider-dashboard";
  return "/buyers-dashboard";
}

/** Matches the leading `/xxx-dashboard` segment of a pathname, if any. */
export function getDashboardSection(pathname: string): string | null {
  const match = pathname.match(/^\/(farmers|buyers|cluster|rider)-dashboard/);
  return match ? `/${match[1]}-dashboard` : null;
}
