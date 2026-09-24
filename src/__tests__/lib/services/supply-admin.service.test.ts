import { describe, it, expect, vi, beforeEach } from "vitest";

const apiFetchMock = vi.fn();
vi.mock("~/lib/api", () => ({ apiFetch: (...args: unknown[]) => apiFetchMock(...args) }));

const { supplyAdminService } = await import("~/lib/services/supply-admin.service");

describe("supplyAdminService", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    apiFetchMock.mockResolvedValue({ status: "success", data: {} });
  });

  it("inviteClusterFarmer POSTs to the team invite route", async () => {
    const payload = { fullName: "Cluster C", phone: "08011112222", email: "c@test.com", locationLga: "AMAC" };
    await supplyAdminService.inviteClusterFarmer(payload);
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/team/cluster-farmers/invite", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });

  it("inviteFarmer POSTs to the team invite route", async () => {
    const payload = { fullName: "Farmer F", phone: "08011112223", email: "f@test.com", locationLga: "AMAC" };
    await supplyAdminService.inviteFarmer(payload);
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/team/farmers/invite", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });

  it("inviteRider POSTs to the team invite route", async () => {
    const payload = { fullName: "Rider R", phone: "08011112224", email: "r@test.com", locationLga: "AMAC" };
    await supplyAdminService.inviteRider(payload);
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/team/riders/invite", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });

  it("getMyTeam GETs /supply-admin/team", async () => {
    await supplyAdminService.getMyTeam();
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/team");
  });

  it("getMyContract GETs /supply-admin/contract", async () => {
    await supplyAdminService.getMyContract();
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/contract");
  });

  it("getMyPayouts GETs /supply-admin/payouts", async () => {
    await supplyAdminService.getMyPayouts();
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/payouts");
  });

  it("getDemands GETs /supply-admin/demands", async () => {
    await supplyAdminService.getDemands();
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/demands");
  });

  it("acceptDemand PATCHes the accept route", async () => {
    await supplyAdminService.acceptDemand("demand_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/demands/demand_1/accept", { method: "PATCH" });
  });

  it("declineDemand PATCHes the decline route with a reason", async () => {
    await supplyAdminService.declineDemand("demand_1", "Out of stock");
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/demands/demand_1/decline", {
      method: "PATCH",
      body: JSON.stringify({ reason: "Out of stock" }),
    });
  });

  it("markDemandReadyForPickup PATCHes the ready-for-pickup route", async () => {
    await supplyAdminService.markDemandReadyForPickup("demand_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/demands/demand_1/ready-for-pickup", {
      method: "PATCH",
    });
  });

  it("escalateDemandToRider PATCHes the escalate route with a riderId", async () => {
    await supplyAdminService.escalateDemandToRider("demand_1", "rider_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/demands/demand_1/escalate", {
      method: "PATCH",
      body: JSON.stringify({ riderId: "rider_1" }),
    });
  });

  it("getPendingRiders GETs /supply-admin/riders/pending", async () => {
    await supplyAdminService.getPendingRiders();
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/riders/pending");
  });

  it("getApprovedRiders GETs /supply-admin/riders/approved", async () => {
    await supplyAdminService.getApprovedRiders();
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/riders/approved");
  });

  it("reviewRider PATCHes the review route with a status", async () => {
    await supplyAdminService.reviewRider("rider_1", "approved");
    expect(apiFetchMock).toHaveBeenCalledWith("/supply-admin/riders/rider_1/review", {
      method: "PATCH",
      body: JSON.stringify({ status: "approved" }),
    });
  });
});
