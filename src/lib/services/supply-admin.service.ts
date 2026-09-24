import { apiFetch } from "~/lib/api";
import type { BackendDemand, PendingRider, ApprovedRider } from "./cluster.service";

// === Types

export interface SupplyAdminTeamMember {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: "cluster" | "farmer" | "rider";
  location_lga: string;
  is_active: boolean;
  rider_approved: boolean | null;
  created_at: string;
}

export interface SupplyAdminContract {
  pricePerKg: number;
  payoutDelayDays: number;
  status: "active" | "suspended" | "ended";
  updatedAt: string;
}

export interface SupplyAdminPayout {
  payoutId: string;
  orderId: string | null;
  demandId: string | null;
  amount: number;
  scheduledFor: string;
  status: "pending" | "processing" | "paid" | "failed";
  createdAt: string;
}

export interface InviteTeamMemberPayload {
  fullName: string;
  phone: string;
  email: string;
  locationLga: string;
}

// === Supply Admin Service
// Regional-team-building + personal demand fulfillment, mirroring
// cluster.service.ts's demand/rider shapes exactly (same backend controller
// functions, just mounted under /supply-admin instead of /cluster).

export const supplyAdminService = {
  // === Team building

  inviteClusterFarmer(payload: InviteTeamMemberPayload) {
    return apiFetch<{ status: string; data: { clusterFarmer: { id: string; email: string; locationLga: string } } }>(
      "/supply-admin/team/cluster-farmers/invite",
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  inviteFarmer(payload: InviteTeamMemberPayload) {
    return apiFetch<{ status: string; data: { farmer: { id: string; email: string; locationLga: string } } }>(
      "/supply-admin/team/farmers/invite",
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  inviteRider(payload: InviteTeamMemberPayload) {
    return apiFetch<{ status: string; data: { rider: { id: string; email: string; locationLga: string } } }>(
      "/supply-admin/team/riders/invite",
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  getMyTeam() {
    return apiFetch<{ status: string; data: { team: SupplyAdminTeamMember[] } }>("/supply-admin/team");
  },

  // === Standing contract & payouts

  getMyContract() {
    return apiFetch<{ status: string; data: { contract: SupplyAdminContract } }>("/supply-admin/contract");
  },

  getMyPayouts() {
    return apiFetch<{ status: string; data: { payouts: SupplyAdminPayout[] } }>("/supply-admin/payouts");
  },

  // === Personal demand fulfillment

  getDemands() {
    return apiFetch<{ status: string; data: { demands: BackendDemand[] } }>("/supply-admin/demands");
  },

  acceptDemand(demandId: string) {
    return apiFetch(`/supply-admin/demands/${demandId}/accept`, { method: "PATCH" });
  },

  declineDemand(demandId: string, reason?: string) {
    return apiFetch(`/supply-admin/demands/${demandId}/decline`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  markDemandReadyForPickup(demandId: string) {
    return apiFetch(`/supply-admin/demands/${demandId}/ready-for-pickup`, { method: "PATCH" });
  },

  escalateDemandToRider(demandId: string, riderId: string) {
    return apiFetch(`/supply-admin/demands/${demandId}/escalate`, {
      method: "PATCH",
      body: JSON.stringify({ riderId }),
    });
  },

  // === Rider review (own region — needed from day one, before any cluster
  // farmer exists to approve riders)

  getPendingRiders() {
    return apiFetch<{ status: string; data: { riders: PendingRider[] } }>("/supply-admin/riders/pending");
  },

  getApprovedRiders() {
    return apiFetch<{ status: string; data: { riders: ApprovedRider[] } }>("/supply-admin/riders/approved");
  },

  reviewRider(riderId: string, status: "approved" | "rejected") {
    return apiFetch(`/supply-admin/riders/${riderId}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
