import { apiFetch } from "~/lib/api";

export interface SettlementOption {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface SubCommunitiesResponse {
  status: string;
  data: { settlements: SettlementOption[] };
}

export const locationService = {
  /** Ward-scoped sub-community autocomplete — public, no auth. */
  getSubCommunities(state: string, lga: string, ward: string, query?: string) {
    const params = new URLSearchParams({ state, lga, ward });
    if (query) params.set("q", query);
    return apiFetch<SubCommunitiesResponse>(`/locations/sub-communities?${params.toString()}`);
  },
};
