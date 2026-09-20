import { describe, it, expect, vi, beforeEach } from "vitest";

const apiFetchMock = vi.fn();
vi.mock("~/lib/api", () => ({ apiFetch: (...args: unknown[]) => apiFetchMock(...args) }));

const { clusterService } = await import("~/lib/services/cluster.service");

describe("clusterService", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    apiFetchMock.mockResolvedValue({ status: "success", data: {} });
  });

  it("updateProfile PATCHes /cluster/account-profile", async () => {
    const payload = { fullName: "Cluster Farmer" };
    await clusterService.updateProfile(payload);
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/account-profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  });

  it("getListings GETs /cluster/listings/get", async () => {
    await clusterService.getListings();
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/listings/get");
  });

  it("getCurrentActivities GETs /cluster/current-activities", async () => {
    await clusterService.getCurrentActivities();
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/current-activities");
  });

  it("getPendingApprovals GETs /cluster/pending-approvals", async () => {
    await clusterService.getPendingApprovals();
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/pending-approvals");
  });

  it("reviewListing PATCHes approval status without a rejection reason", async () => {
    await clusterService.reviewListing("listing_1", "approved");
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/pending-approvals/listing_1", {
      method: "PATCH",
      body: JSON.stringify({ status: "approved" }),
    });
  });

  it("reviewListing includes the rejection reason when rejecting", async () => {
    await clusterService.reviewListing("listing_1", "rejected", "Photos unclear");
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/pending-approvals/listing_1", {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected", rejectionReason: "Photos unclear" }),
    });
  });

  it("getFarmers GETs /cluster/farmers", async () => {
    await clusterService.getFarmers();
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/farmers");
  });

  it("getOrders GETs /cluster/orders", async () => {
    await clusterService.getOrders();
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/orders");
  });

  it("getPayouts GETs /cluster/payouts", async () => {
    await clusterService.getPayouts();
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/payouts");
  });

  it("getDemands GETs /cluster/demands", async () => {
    await clusterService.getDemands();
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/demands");
  });

  it("acceptDemand PATCHes /cluster/demands/:id/accept", async () => {
    await clusterService.acceptDemand("demand_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/demands/demand_1/accept", { method: "PATCH" });
  });

  it("declineDemand PATCHes with an optional reason", async () => {
    await clusterService.declineDemand("demand_1", "Out of stock");
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/demands/demand_1/decline", {
      method: "PATCH",
      body: JSON.stringify({ reason: "Out of stock" }),
    });
  });

  it("markDemandReadyForPickup PATCHes /cluster/demands/:id/ready-for-pickup", async () => {
    await clusterService.markDemandReadyForPickup("demand_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/demands/demand_1/ready-for-pickup", {
      method: "PATCH",
    });
  });

  it("escalateDemandToRider PATCHes with the rider id", async () => {
    await clusterService.escalateDemandToRider("demand_1", "rider_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/demands/demand_1/escalate", {
      method: "PATCH",
      body: JSON.stringify({ riderId: "rider_1" }),
    });
  });

  it("getPendingRiders GETs /cluster/riders/pending", async () => {
    await clusterService.getPendingRiders();
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/riders/pending");
  });

  it("getApprovedRiders GETs /cluster/riders/approved", async () => {
    await clusterService.getApprovedRiders();
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/riders/approved");
  });

  it("reviewRider PATCHes the rider's approval status", async () => {
    await clusterService.reviewRider("rider_1", "approved");
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/riders/rider_1/review", {
      method: "PATCH",
      body: JSON.stringify({ status: "approved" }),
    });
  });

  it("receiveOrder PATCHes /cluster/orders/:id/receive", async () => {
    await clusterService.receiveOrder("order_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/orders/order_1/receive", { method: "PATCH" });
  });

  it("markReadyForPickup PATCHes /cluster/orders/:id/ready-for-pickup", async () => {
    await clusterService.markReadyForPickup("order_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/orders/order_1/ready-for-pickup", {
      method: "PATCH",
    });
  });

  it("escalateToRider PATCHes with the rider id", async () => {
    await clusterService.escalateToRider("order_1", "rider_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/cluster/orders/order_1/escalate", {
      method: "PATCH",
      body: JSON.stringify({ riderId: "rider_1" }),
    });
  });
});
