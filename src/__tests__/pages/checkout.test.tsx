// Covers the checkout page's live delivery-fee fetch on selecting "Delivery"
// and the place-order -> auto-pay-with-wallet chain.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}));

const apiFetchMock = vi.fn();
vi.mock("~/lib/api", () => ({ apiFetch: (...args: unknown[]) => apiFetchMock(...args) }));

const payOrderWithWalletMock = vi.fn();
vi.mock("~/lib/services/buyer.service", () => ({
  buyerService: { payOrderWithWallet: (...args: unknown[]) => payOrderWithWalletMock(...args) },
}));

const clearCartMock = vi.fn();
let mockCartItems: Array<Record<string, unknown>> = [];
vi.mock("~/components/marketplace/useCart", () => ({
  useCart: () => ({
    items: mockCartItems,
    subtotal: mockCartItems.reduce((sum, i) => sum + Number(i.totalPrice), 0),
    clearCart: clearCartMock,
  }),
}));

const { default: CheckoutPage } = await import("~/app/(main-app)/marketplace/checkout/page");
const { toast } = await import("sonner");

const cartItem = {
  listingId: "listing_1",
  fishType: "Catfish",
  variant: "Table Size",
  processed: false,
  weightKg: 5,
  quantity: 2,
  pricePerUnit: 1000,
  totalPrice: 2000,
};

describe("Checkout page", () => {
  beforeEach(() => {
    mockCartItems = [{ ...cartItem }];
    apiFetchMock.mockReset();
    payOrderWithWalletMock.mockReset();
    clearCartMock.mockReset();
    pushMock.mockReset();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it("does not fetch a delivery fee while Pickup is selected (the default)", async () => {
    render(<CheckoutPage />);
    expect(screen.getAllByText(/₦2,000/).length).toBeGreaterThan(0); // subtotal + total, pickup is default
    await new Promise((r) => setTimeout(r, 0));
    expect(apiFetchMock).not.toHaveBeenCalledWith(expect.stringContaining("/marketplace/delivery-fee"), undefined);
  });

  it("fetches and displays the live delivery fee when Delivery is selected", async () => {
    apiFetchMock.mockResolvedValue({ data: { deliveryFee: 750 } });
    const user = userEvent.setup();
    render(<CheckoutPage />);

    await user.click(screen.getByRole("button", { name: /delivery/i }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/^\/marketplace\/delivery-fee\?/),
      ),
    );
    const [url] = apiFetchMock.mock.calls[0];
    expect(url).toContain("totalWeightKg=5");
    expect(url).toContain("listingId=listing_1");

    expect(await screen.findByText("₦750")).toBeInTheDocument();
    // Total = subtotal (2000) + delivery fee (750)
    expect(screen.getByText("₦2,750")).toBeInTheDocument();
  });

  it("resets the delivery fee back to 0 when switching back to Pickup", async () => {
    apiFetchMock.mockResolvedValue({ data: { deliveryFee: 750 } });
    const user = userEvent.setup();
    render(<CheckoutPage />);

    await user.click(screen.getByRole("button", { name: /delivery/i }));
    await screen.findByText("₦750");

    await user.click(screen.getByRole("button", { name: /pickup/i }));
    expect(screen.getAllByText("₦0").length).toBeGreaterThan(0);
  });

  it("requires a delivery address of at least 10 characters when Delivery is chosen", async () => {
    apiFetchMock.mockResolvedValue({ data: { deliveryFee: 750 } });
    const user = userEvent.setup();
    render(<CheckoutPage />);

    await user.click(screen.getByRole("button", { name: /delivery/i }));
    await user.click(screen.getByRole("button", { name: /place order/i }));

    expect(toast.error).toHaveBeenCalledWith("Please provide a delivery address");
    expect(apiFetchMock).not.toHaveBeenCalledWith("/marketplace/checkout", expect.anything());

    vi.mocked(toast.error).mockClear();
    await user.type(screen.getByPlaceholderText(/enter delivery address/i), "short");
    await user.click(screen.getByRole("button", { name: /place order/i }));
    expect(toast.error).toHaveBeenCalledWith("Delivery address looks too short");
  });

  it("places the order then auto-pays with wallet and redirects to the order page", async () => {
    apiFetchMock.mockImplementation((path: string) => {
      if (path === "/marketplace/checkout") {
        return Promise.resolve({ data: { order: { id: "order_99", grand_total: 2000 } } });
      }
      return Promise.resolve({ data: {} });
    });
    payOrderWithWalletMock.mockResolvedValue({
      status: "success",
      data: { paymentReference: "ref_1", status: "completed" },
    });

    const user = userEvent.setup();
    render(<CheckoutPage />);
    await user.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith(
        "/marketplace/checkout",
        expect.objectContaining({ method: "POST" }),
      ),
    );
    const [, options] = apiFetchMock.mock.calls.find(([path]) => path === "/marketplace/checkout")!;
    const body = JSON.parse((options as { body: string }).body);
    expect(body.cartItems).toEqual([{ cartItemId: "listing_1-5-Table Size", quantity: 2 }]);
    expect(body.totalAmount).toBe(2000);

    await waitFor(() => expect(clearCartMock).toHaveBeenCalled());
    await waitFor(() => expect(payOrderWithWalletMock).toHaveBeenCalledWith("order_99"));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Payment successful!"));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/buyers-dashboard/orders/order_99"));
  });

  it("still redirects to the order page and surfaces a retry toast when wallet auto-pay fails", async () => {
    apiFetchMock.mockImplementation((path: string) => {
      if (path === "/marketplace/checkout") {
        return Promise.resolve({ data: { order: { id: "order_99", grand_total: 2000 } } });
      }
      return Promise.resolve({ data: {} });
    });
    payOrderWithWalletMock.mockRejectedValue(new Error("Insufficient wallet balance"));

    const user = userEvent.setup();
    render(<CheckoutPage />);
    await user.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Insufficient wallet balance. You can retry payment from your order.",
      ),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/buyers-dashboard/orders/order_99"));
  });

  it("shows an error toast and does not redirect when checkout itself fails", async () => {
    apiFetchMock.mockRejectedValue(new Error("Cart is stale"));
    const user = userEvent.setup();
    render(<CheckoutPage />);
    await user.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Cart is stale"));
    expect(pushMock).not.toHaveBeenCalled();
    expect(payOrderWithWalletMock).not.toHaveBeenCalled();
  });

  it("blocks placing an order with an empty cart", async () => {
    mockCartItems = [];
    const user = userEvent.setup();
    render(<CheckoutPage />);
    await user.click(screen.getByRole("button", { name: /place order/i }));
    expect(toast.error).toHaveBeenCalledWith("Your cart is empty");
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});
