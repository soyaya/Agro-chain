// Page-level coverage for the rider dashboard's delivery state machine:
// escalated_to_rider -> out_for_delivery -> delivered_awaiting_confirmation -> completed.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const getOrdersMock = vi.fn();
const getDemandsMock = vi.fn();
const startDeliveryMock = vi.fn();
const completeHandoffMock = vi.fn();
vi.mock("~/lib/services/rider.service", () => ({
  riderService: {
    getOrders: (...args: unknown[]) => getOrdersMock(...args),
    getDemands: (...args: unknown[]) => getDemandsMock(...args),
    startDelivery: (...args: unknown[]) => startDeliveryMock(...args),
    completeHandoff: (...args: unknown[]) => completeHandoffMock(...args),
    startDemandDelivery: vi.fn(),
    completeDemandHandoff: vi.fn(),
  },
}));

const uploadFileMock = vi.fn();
vi.mock("~/lib/upload", () => ({ uploadFile: (...args: unknown[]) => uploadFileMock(...args) }));

let mockUser: { riderApproved: boolean } | null = { riderApproved: true };
vi.mock("~/lib/auth-context", () => ({
  useAuth: () => ({ user: mockUser }),
}));

const { default: RiderDashboardPage } = await import("~/app/(dasboards)/rider-dashboard/page");
const { toast } = await import("sonner");

function order(overrides: Record<string, unknown> = {}) {
  return {
    orderId: "order_1",
    orderNumber: "ORD-001",
    buyerName: "Buyer Bob",
    deliveryAddress: "1 Market Road",
    fulfillmentStage: "escalated_to_rider",
    fishVariant: "table_size",
    pickupPhotoUrl: null,
    handoffPhotoUrl: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("RiderDashboardPage — delivery state transitions", () => {
  beforeEach(() => {
    mockUser = { riderApproved: true };
    getOrdersMock.mockReset();
    getDemandsMock.mockReset().mockResolvedValue({ status: "success", data: { demands: [] } });
    startDeliveryMock.mockReset().mockResolvedValue({ status: "success", data: {} });
    completeHandoffMock.mockReset().mockResolvedValue({ status: "success", data: {} });
    uploadFileMock.mockReset().mockResolvedValue("https://cdn.example/photo.jpg");
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock-preview-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an empty state when there are no assigned deliveries", async () => {
    getOrdersMock.mockResolvedValue({ status: "success", data: { orders: [] } });
    render(<RiderDashboardPage />);
    expect(await screen.findByText(/no deliveries assigned/i)).toBeInTheDocument();
  });

  it("shows the pending-approval banner when the rider is not yet approved", async () => {
    mockUser = { riderApproved: false };
    getOrdersMock.mockResolvedValue({ status: "success", data: { orders: [] } });
    render(<RiderDashboardPage />);
    expect(
      await screen.findByText(/awaiting approval from a cluster farmer/i),
    ).toBeInTheDocument();
  });

  it("shows a surfaced error with a retry action when loading fails", async () => {
    getOrdersMock.mockRejectedValue(new Error("Network down"));
    getDemandsMock.mockResolvedValue({ status: "success", data: { demands: [] } });
    render(<RiderDashboardPage />);
    expect(await screen.findByText("Network down")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("escalated_to_rider: uploading a pickup photo and confirming calls startDelivery and reloads", async () => {
    getOrdersMock
      .mockResolvedValueOnce({ status: "success", data: { orders: [order()] } })
      .mockResolvedValueOnce({
        status: "success",
        data: { orders: [order({ fulfillmentStage: "out_for_delivery" })] },
      });
    const user = userEvent.setup();
    render(<RiderDashboardPage />);

    await screen.findByRole("button", { name: /upload pickup photo/i });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, new File(["x"], "pickup.jpg", { type: "image/jpeg" }));

    const confirmButton = await screen.findByRole("button", { name: /confirm pickup & start delivery/i });
    await waitFor(() => expect(confirmButton).toBeEnabled());
    await user.click(confirmButton);

    await waitFor(() =>
      expect(startDeliveryMock).toHaveBeenCalledWith("order_1", "https://cdn.example/photo.jpg"),
    );
    await waitFor(() => expect(getOrdersMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(/out for delivery/i)).toBeInTheDocument();
  });

  it("out_for_delivery: uploading a handoff photo and completing calls completeHandoff and reloads", async () => {
    getOrdersMock
      .mockResolvedValueOnce({
        status: "success",
        data: { orders: [order({ fulfillmentStage: "out_for_delivery" })] },
      })
      .mockResolvedValueOnce({
        status: "success",
        data: { orders: [order({ fulfillmentStage: "delivered_awaiting_confirmation" })] },
      });
    const user = userEvent.setup();
    render(<RiderDashboardPage />);

    await screen.findByRole("button", { name: /upload handoff photo/i });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, new File(["x"], "handoff.jpg", { type: "image/jpeg" }));

    const completeButton = await screen.findByRole("button", { name: /complete handoff/i });
    await waitFor(() => expect(completeButton).toBeEnabled());
    await user.click(completeButton);

    await waitFor(() =>
      expect(completeHandoffMock).toHaveBeenCalledWith("order_1", "https://cdn.example/photo.jpg"),
    );
    const matches = await screen.findAllByText(/awaiting buyer confirmation/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("delivered_awaiting_confirmation: shows a passive waiting message, no action buttons", async () => {
    getOrdersMock.mockResolvedValue({
      status: "success",
      data: { orders: [order({ fulfillmentStage: "delivered_awaiting_confirmation" })] },
    });
    render(<RiderDashboardPage />);
    const matches = await screen.findAllByText(/delivered — awaiting buyer confirmation/i);
    expect(matches.length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /upload/i })).not.toBeInTheDocument();
  });

  it("completed: shows the completed state", async () => {
    getOrdersMock.mockResolvedValue({
      status: "success",
      data: { orders: [order({ fulfillmentStage: "completed" })] },
    });
    render(<RiderDashboardPage />);
    const matches = await screen.findAllByText("Completed");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("surfaces a toast and does not advance state when startDelivery fails", async () => {
    getOrdersMock.mockResolvedValue({ status: "success", data: { orders: [order()] } });
    startDeliveryMock.mockRejectedValue(new Error("Server rejected the photo"));
    const user = userEvent.setup();
    render(<RiderDashboardPage />);

    await screen.findByRole("button", { name: /upload pickup photo/i });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, new File(["x"], "pickup.jpg", { type: "image/jpeg" }));
    const confirmButton = await screen.findByRole("button", { name: /confirm pickup & start delivery/i });
    await waitFor(() => expect(confirmButton).toBeEnabled());
    await user.click(confirmButton);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Server rejected the photo"));
    // Still on the same stage — only the one initial getOrders call.
    expect(getOrdersMock).toHaveBeenCalledTimes(1);
  });
});
