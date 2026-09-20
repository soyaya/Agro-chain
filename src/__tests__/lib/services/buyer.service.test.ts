import { describe, it, expect, vi, beforeEach } from "vitest";

const apiFetchMock = vi.fn();
vi.mock("~/lib/api", () => ({ apiFetch: (...args: unknown[]) => apiFetchMock(...args) }));

const { buyerService } = await import("~/lib/services/buyer.service");

describe("buyerService", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    apiFetchMock.mockResolvedValue({ status: "success", data: {} });
  });

  it("updateProfile PATCHes /buyers/account-profile with the payload", async () => {
    const payload = { fullName: "Jane Doe", phoneNumber: "08012345678" };
    await buyerService.updateProfile(payload);
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/account-profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  });

  it("createOrder POSTs to /buyers/orders", async () => {
    const payload = { listingId: "listing_1", quantity: 2, weightKg: 5 };
    await buyerService.createOrder(payload);
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });

  it("getOrders GETs /buyers/orders", async () => {
    await buyerService.getOrders();
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/orders");
  });

  it("getOrder GETs /buyers/orders/:id", async () => {
    await buyerService.getOrder("order_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/orders/order_1");
  });

  it("getOrderTracking GETs /buyers/orders/:id/tracking", async () => {
    await buyerService.getOrderTracking("order_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/orders/order_1/tracking");
  });

  it("confirmDelivery PATCHes with the payout delay", async () => {
    await buyerService.confirmDelivery("order_1", "24 hours");
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/orders/order_1/confirm-delivery", {
      method: "PATCH",
      body: JSON.stringify({ payoutDelay: "24 hours" }),
    });
  });

  it("confirmDelivery works without a payout delay", async () => {
    await buyerService.confirmDelivery("order_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/orders/order_1/confirm-delivery", {
      method: "PATCH",
      body: JSON.stringify({ payoutDelay: undefined }),
    });
  });

  it("payOrderWithWallet POSTs to /buyers/orders/:id/pay-with-wallet", async () => {
    await buyerService.payOrderWithWallet("order_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/orders/order_1/pay-with-wallet", {
      method: "POST",
    });
  });

  it("getSavedListings GETs /marketplace/saved", async () => {
    await buyerService.getSavedListings();
    expect(apiFetchMock).toHaveBeenCalledWith("/marketplace/saved");
  });

  it("saveListing POSTs to /marketplace/saved/:id", async () => {
    await buyerService.saveListing("listing_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/marketplace/saved/listing_1", { method: "POST" });
  });

  it("unsaveListing DELETEs /marketplace/saved/:id", async () => {
    await buyerService.unsaveListing("listing_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/marketplace/saved/listing_1", { method: "DELETE" });
  });

  it("getDemandPrices GETs /buyers/demand-prices", async () => {
    await buyerService.getDemandPrices();
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/demand-prices");
  });

  it("getDemands GETs /buyers/demands", async () => {
    await buyerService.getDemands();
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/demands");
  });

  it("createDemand POSTs the demand payload", async () => {
    const payload = {
      fishVariant: "table_size" as const,
      fulfillmentMethod: "pickup" as const,
      locationState: "Lagos",
      locationLga: "Ikeja",
      deliveryAddress: "123 Street",
    };
    await buyerService.createDemand(payload);
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/demands", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });

  it("payDemandWithWallet POSTs to /buyers/demands/:id/pay-with-wallet", async () => {
    await buyerService.payDemandWithWallet("demand_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/demands/demand_1/pay-with-wallet", {
      method: "POST",
    });
  });

  it("getDemand GETs /buyers/demands/:id", async () => {
    await buyerService.getDemand("demand_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/demands/demand_1");
  });

  it("cancelDemand DELETEs /buyers/demands/:id", async () => {
    await buyerService.cancelDemand("demand_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/demands/demand_1", { method: "DELETE" });
  });

  it("getDemandTracking GETs /buyers/demands/:id/tracking", async () => {
    await buyerService.getDemandTracking("demand_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/demands/demand_1/tracking");
  });

  it("confirmDemandReceipt PATCHes /buyers/demands/:id/confirm-receipt", async () => {
    await buyerService.confirmDemandReceipt("demand_1");
    expect(apiFetchMock).toHaveBeenCalledWith("/buyers/demands/demand_1/confirm-receipt", {
      method: "PATCH",
    });
  });
});
