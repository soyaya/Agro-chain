import { describe, it, expect, vi, beforeEach } from "vitest";

const apiFetchMock = vi.fn();
vi.mock("~/lib/api", () => ({ apiFetch: (...args: unknown[]) => apiFetchMock(...args) }));

const { riderService } = await import("~/lib/services/rider.service");

describe("riderService", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    apiFetchMock.mockResolvedValue({ status: "success", data: {} });
  });

  it("getOrders GETs /riders/orders", async () => {
    await riderService.getOrders();
    expect(apiFetchMock).toHaveBeenCalledWith("/riders/orders");
  });

  it("updateProfile PUTs /users/profile with snake_case fields", async () => {
    await riderService.updateProfile({
      fullName: "Rider Rita",
      locationState: "Lagos",
      locationLga: "Ikeja",
      locationAddress: "1 Rider Way",
    });
    expect(apiFetchMock).toHaveBeenCalledWith("/users/profile", {
      method: "PUT",
      body: JSON.stringify({
        full_name: "Rider Rita",
        location_state: "Lagos",
        location_lga: "Ikeja",
        location_address: "1 Rider Way",
      }),
    });
  });

  it("startDelivery POSTs the pickup photoUrl, no OTP", async () => {
    await riderService.startDelivery("order_1", "https://cdn.example/pickup.jpg");
    expect(apiFetchMock).toHaveBeenCalledWith("/riders/orders/order_1/start-delivery", {
      method: "POST",
      body: JSON.stringify({ photoUrl: "https://cdn.example/pickup.jpg" }),
    });
  });

  it("completeHandoff POSTs the handoff photoUrl", async () => {
    await riderService.completeHandoff("order_1", "https://cdn.example/handoff.jpg");
    expect(apiFetchMock).toHaveBeenCalledWith("/riders/orders/order_1/complete-handoff", {
      method: "POST",
      body: JSON.stringify({ photoUrl: "https://cdn.example/handoff.jpg" }),
    });
  });

  it("getDemands GETs /riders/demands", async () => {
    await riderService.getDemands();
    expect(apiFetchMock).toHaveBeenCalledWith("/riders/demands");
  });

  it("startDemandDelivery POSTs the demand's pickup photoUrl", async () => {
    await riderService.startDemandDelivery("demand_1", "https://cdn.example/pickup.jpg");
    expect(apiFetchMock).toHaveBeenCalledWith("/riders/demands/demand_1/start-delivery", {
      method: "POST",
      body: JSON.stringify({ photoUrl: "https://cdn.example/pickup.jpg" }),
    });
  });

  it("completeDemandHandoff POSTs the demand's handoff photoUrl", async () => {
    await riderService.completeDemandHandoff("demand_1", "https://cdn.example/handoff.jpg");
    expect(apiFetchMock).toHaveBeenCalledWith("/riders/demands/demand_1/complete-handoff", {
      method: "POST",
      body: JSON.stringify({ photoUrl: "https://cdn.example/handoff.jpg" }),
    });
  });

  it("getPayouts GETs /riders/payouts", async () => {
    await riderService.getPayouts();
    expect(apiFetchMock).toHaveBeenCalledWith("/riders/payouts");
  });
});
