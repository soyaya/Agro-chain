import { apiFetch } from "~/lib/api";

export const platformService = {
  /** States currently open for registration/marketplace selection (admin-controlled, public). */
  getActiveStates() {
    return apiFetch<{ status: string; data: { activeStates: string[] } }>(
      "/marketplace/active-states",
    );
  },
};
