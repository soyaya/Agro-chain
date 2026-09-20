// Covers the buyer order-detail page's delivery-photo rendering and the
// Confirm Pickup/Delivery button's gating on order.fulfillmentStage.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "order_1" }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}));

const getOrderMock = vi.fn();
const getOrderTrackingMock = vi.fn();
const confirmDeliveryMock = vi.fn();
const payOrderWithWalletMock = vi.fn();
vi.mock("~/lib/services/buyer.service", () => ({
  buyerService: {
    getOrder: (...args: unknown[]) => getOrderMock(...args),
    getOrderTracking: (...args: unknown[]) => getOrderTrackingMock(...args),
    confirmDelivery: (...args: unknown[]) => confirmDeliveryMock(...args),
    payOrderWithWallet: (...args: unknown[]) => payOrderWithWalletMock(...args),
  },
}));

const { default: OrderDetailsPage } = await import(
  "~/app/(dasboards)/buyers-dashboard/orders/[id]/page"
);
const { toast } = await import("sonner");

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order_1",
    orderNumber: "ORD-001",
    buyerId: "buyer_1",
    clusterFarmerId: "cluster_1",
    clusterFarmerName: "Cluster Co",
    clusterFarmerContact: null,
    warehouseLocation: null,
    listingFishType: "Catfish",
    fishVariant: "table_size",
    pickupPhotoUrl: null,
    handoffPhotoUrl: null,
    items: [
      {
        fishType: "Catfish",
        variant: "Table Size",
        processed: false,
        weightKg: 5,
        quantity: 2,
        pricePerUnit: 1000,
        totalPrice: 2000,
      },
    ],
    quantity: 2,
    weightKg: 5,
    totalAmount: 2000,
    deliveryFee: 0,
    grandTotal: 2000,
    deliveryType: null,
    deliveryAddress: "1 Buyer Street",
    fulfillmentMethod: "delivery",
    fulfillmentStage: "awaiting_farmer_dispatch",
    assignedRiderId: null,
    status: "processing",
    paymentStatus: "paid",
    walletPaymentStatus: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("Buyer order detail page", () => {
  beforeEach(() => {
    getOrderMock.mockReset();
    getOrderTrackingMock.mockReset().mockResolvedValue({ status: "success", data: { tracking: [] } });
    confirmDeliveryMock.mockReset().mockResolvedValue({ status: "success", data: {} });
    payOrderWithWalletMock.mockReset();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it("renders pickup and handoff photos as <img> tags when present", async () => {
    getOrderMock.mockResolvedValue({
      status: "success",
      data: {
        order: makeOrder({
          pickupPhotoUrl: "https://cdn.example/pickup.jpg",
          handoffPhotoUrl: "https://cdn.example/handoff.jpg",
        }),
      },
    });
    render(<OrderDetailsPage />);

    const pickupImg = await screen.findByAltText("Product at pickup");
    expect(pickupImg).toHaveAttribute("src", "https://cdn.example/pickup.jpg");
    const handoffImg = screen.getByAltText("Product at handoff");
    expect(handoffImg).toHaveAttribute("src", "https://cdn.example/handoff.jpg");
  });

  it("shows placeholder text instead of an <img> when a photo hasn't been taken yet", async () => {
    getOrderMock.mockResolvedValue({
      status: "success",
      data: { order: makeOrder({ pickupPhotoUrl: "https://cdn.example/pickup.jpg", handoffPhotoUrl: null }) },
    });
    render(<OrderDetailsPage />);

    await screen.findByAltText("Product at pickup");
    expect(screen.queryByAltText("Product at handoff")).not.toBeInTheDocument();
    expect(screen.getByText(/not delivered yet/i)).toBeInTheDocument();
  });

  it("does not render the Delivery Photos section at all when neither photo exists", async () => {
    getOrderMock.mockResolvedValue({ status: "success", data: { order: makeOrder() } });
    render(<OrderDetailsPage />);
    await screen.findByText("Order ORD-001");
    expect(screen.queryByText("Delivery Photos")).not.toBeInTheDocument();
  });

  it.each([
    ["awaiting_farmer_dispatch", false],
    ["dispatched_to_cluster", false],
    ["at_cluster_office", false],
    ["ready_for_pickup", true],
    ["escalated_to_rider", false],
    ["out_for_delivery", false],
    ["delivered_awaiting_confirmation", true],
    ["completed", false],
  ])("Confirm button visibility for stage %s is %s", async (stage, shouldShow) => {
    getOrderMock.mockResolvedValue({ status: "success", data: { order: makeOrder({ fulfillmentStage: stage }) } });
    render(<OrderDetailsPage />);
    await screen.findByText("Order ORD-001");

    const confirmButton = screen.queryByRole("button", { name: /confirm (pickup|delivery)/i });
    if (shouldShow) {
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).toBeEnabled();
    } else {
      expect(confirmButton).not.toBeInTheDocument();
    }
  });

  it("clicking Confirm Delivery calls buyerService.confirmDelivery with the selected payout window", async () => {
    getOrderMock.mockResolvedValue({
      status: "success",
      data: { order: makeOrder({ fulfillmentStage: "delivered_awaiting_confirmation" }) },
    });
    const user = userEvent.setup();
    render(<OrderDetailsPage />);

    await screen.findByText("Order ORD-001");
    await user.click(screen.getByRole("button", { name: "1 hour" }));
    await user.click(screen.getByRole("button", { name: /confirm delivery/i }));

    await waitFor(() => expect(confirmDeliveryMock).toHaveBeenCalledWith("order_1", "1 hour"));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("shows Pay Now when unpaid and calls payOrderWithWallet on click", async () => {
    getOrderMock.mockResolvedValue({
      status: "success",
      data: { order: makeOrder({ paymentStatus: "pending", walletPaymentStatus: null }) },
    });
    payOrderWithWalletMock.mockResolvedValue({
      status: "success",
      message: "ok",
      data: { paymentReference: "ref_1", status: "completed" },
    });
    const user = userEvent.setup();
    render(<OrderDetailsPage />);

    const payButton = await screen.findByRole("button", { name: /pay now/i });
    await user.click(payButton);

    await waitFor(() => expect(payOrderWithWalletMock).toHaveBeenCalledWith("order_1"));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Payment successful!"));
  });

  it("hides the pay button while a wallet transfer is processing", async () => {
    getOrderMock.mockResolvedValue({
      status: "success",
      data: { order: makeOrder({ paymentStatus: "pending", walletPaymentStatus: "processing" }) },
    });
    render(<OrderDetailsPage />);
    await screen.findByText("Order ORD-001");
    expect(screen.queryByRole("button", { name: /pay now/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry payment/i })).not.toBeInTheDocument();
  });

  it("shows Retry Payment when a previous wallet transfer failed", async () => {
    getOrderMock.mockResolvedValue({
      status: "success",
      data: { order: makeOrder({ paymentStatus: "pending", walletPaymentStatus: "failed" }) },
    });
    render(<OrderDetailsPage />);
    expect(await screen.findByRole("button", { name: /retry payment/i })).toBeInTheDocument();
  });
});
