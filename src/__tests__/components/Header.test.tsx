import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useAuthMock = vi.fn();
const useCartMock = vi.fn();

vi.mock("~/lib/auth-context", () => ({ useAuth: () => useAuthMock() }));
vi.mock("~/components/marketplace/useCart", () => ({ useCart: () => useCartMock() }));

const Header = (await import("~/components/Header")).default;

describe("Header", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useCartMock.mockReset();
    useCartMock.mockReturnValue({ totalItems: 0 });
  });

  it("shows Login/Register links when logged out", () => {
    useAuthMock.mockReturnValue({ user: null, dashboardType: "buyer", logout: vi.fn() });

    render(<Header />);

    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /dashboard/i })).not.toBeInTheDocument();
  });

  it("shows Dashboard/Logout when logged in, pointing at the role-appropriate dashboard", () => {
    useAuthMock.mockReturnValue({
      user: { id: "u1" },
      dashboardType: "cluster-farmer",
      logout: vi.fn(),
    });

    render(<Header />);

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/cluster-dashboard");
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument();
  });

  it("shows the cart item count badge when the cart has items", () => {
    useAuthMock.mockReturnValue({ user: null, dashboardType: "buyer", logout: vi.fn() });
    useCartMock.mockReturnValue({ totalItems: 3 });

    render(<Header />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByLabelText(/cart, 3 items/i)).toBeInTheDocument();
  });

  it("hides the count badge when the cart is empty", () => {
    useAuthMock.mockReturnValue({ user: null, dashboardType: "buyer", logout: vi.fn() });
    useCartMock.mockReturnValue({ totalItems: 0 });

    render(<Header />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
