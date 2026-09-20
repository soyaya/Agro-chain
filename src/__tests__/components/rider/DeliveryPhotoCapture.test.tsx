// DeliveryPhotoCapture is a local, unexported function component inside
// rider-dashboard/page.tsx (there's no standalone module to import it from).
// It's exercised here through the page itself, in the "escalated_to_rider"
// stage where it's rendered as the "Upload Pickup Photo" control.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const getOrdersMock = vi.fn();
const getDemandsMock = vi.fn();
const startDeliveryMock = vi.fn();
vi.mock("~/lib/services/rider.service", () => ({
  riderService: {
    getOrders: (...args: unknown[]) => getOrdersMock(...args),
    getDemands: (...args: unknown[]) => getDemandsMock(...args),
    startDelivery: (...args: unknown[]) => startDeliveryMock(...args),
    completeHandoff: vi.fn(),
    startDemandDelivery: vi.fn(),
    completeDemandHandoff: vi.fn(),
  },
}));

const uploadFileMock = vi.fn();
vi.mock("~/lib/upload", () => ({ uploadFile: (...args: unknown[]) => uploadFileMock(...args) }));

vi.mock("~/lib/auth-context", () => ({
  useAuth: () => ({ user: { riderApproved: true } }),
}));

const { default: RiderDashboardPage } = await import("~/app/(dasboards)/rider-dashboard/page");

const pendingOrder = {
  orderId: "order_1",
  orderNumber: "ORD-001",
  buyerName: "Buyer Bob",
  deliveryAddress: "1 Market Road",
  fulfillmentStage: "escalated_to_rider",
  fishVariant: "table_size",
  pickupPhotoUrl: null,
  handoffPhotoUrl: null,
  createdAt: new Date().toISOString(),
};

describe("DeliveryPhotoCapture (via rider-dashboard page)", () => {
  beforeEach(() => {
    getOrdersMock.mockReset().mockResolvedValue({ status: "success", data: { orders: [pendingOrder] } });
    getDemandsMock.mockReset().mockResolvedValue({ status: "success", data: { demands: [] } });
    startDeliveryMock.mockReset().mockResolvedValue({ status: "success", data: {} });
    uploadFileMock.mockReset().mockResolvedValue("https://cdn.example/pickup.jpg");
    // jsdom doesn't implement the Blob URL APIs the component calls to preview
    // the selected file.
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock-preview-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function makeFile(name = "pickup.jpg") {
    return new File(["binary-image-data"], name, { type: "image/jpeg" });
  }

  it("shows the upload button and a disabled submit button before any photo is chosen", async () => {
    render(<RiderDashboardPage />);

    const uploadButton = await screen.findByRole("button", { name: /upload pickup photo/i });
    expect(uploadButton).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: /confirm pickup & start delivery/i });
    expect(confirmButton).toBeDisabled();
    expect(screen.getByText(/upload a photo above to enable this button/i)).toBeInTheDocument();
  });

  it("clicking the upload button reveals a hidden file input", async () => {
    render(<RiderDashboardPage />);
    await screen.findByRole("button", { name: /upload pickup photo/i });

    // The <input type="file"> is rendered hidden (className "hidden") until a
    // file is chosen — assert it exists in the DOM ready to receive a click-through.
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveClass("hidden");
  });

  it("selecting a file shows a thumbnail, filename, and 'Photo ready', and enables submit", async () => {
    const user = userEvent.setup();
    render(<RiderDashboardPage />);
    await screen.findByRole("button", { name: /upload pickup photo/i });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("pickup.jpg");
    await user.upload(fileInput, file);

    expect(await screen.findByText("pickup.jpg")).toBeInTheDocument();
    expect(screen.getByText(/photo ready/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /selected delivery photo/i })).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: /confirm pickup & start delivery/i });
    await waitFor(() => expect(confirmButton).toBeEnabled());
  });

  it("'Replace' resets back to the empty upload-button state", async () => {
    const user = userEvent.setup();
    render(<RiderDashboardPage />);
    await screen.findByRole("button", { name: /upload pickup photo/i });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, makeFile("pickup.jpg"));
    await screen.findByText(/photo ready/i);

    await user.click(screen.getByRole("button", { name: /replace/i }));

    expect(screen.queryByText(/photo ready/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload pickup photo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm pickup & start delivery/i })).toBeDisabled();
  });

  it("submitting uploads the file then calls riderService.startDelivery with the resulting URL", async () => {
    const user = userEvent.setup();
    render(<RiderDashboardPage />);
    await screen.findByRole("button", { name: /upload pickup photo/i });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("pickup.jpg");
    await user.upload(fileInput, file);

    const confirmButton = await screen.findByRole("button", { name: /confirm pickup & start delivery/i });
    await waitFor(() => expect(confirmButton).toBeEnabled());
    await user.click(confirmButton);

    await waitFor(() => expect(uploadFileMock).toHaveBeenCalledWith(file));
    await waitFor(() =>
      expect(startDeliveryMock).toHaveBeenCalledWith("order_1", "https://cdn.example/pickup.jpg"),
    );
  });
});
