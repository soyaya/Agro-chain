import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "~/lib/auth-context";
import { authService } from "~/lib/services/auth.service";
import { ApiError } from "~/lib/api";

// A stale `current_user` routing cookie (read by proxy.ts middleware to decide
// whether to bounce /login and /register to the dashboard) must not survive a
// 401 from /auth/me — otherwise a dead session traps the user on an empty
// dashboard with no way back to /login or /register. See auth-context.tsx.

const routerReplace = vi.fn();
let mockPathname = "/buyers-dashboard";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ replace: routerReplace }),
}));

vi.mock("~/lib/services/auth.service", () => ({
  authService: {
    getMe: vi.fn(),
  },
}));

function TestConsumer() {
  const { user, isLoading } = useAuth();
  return <div data-testid="state">{isLoading ? "loading" : user ? "authed" : "anonymous"}</div>;
}

function setCookie(value: string) {
  document.cookie = value;
}

function clearAllCookies() {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
  });
}

describe("AuthProvider — stale session cookie handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllCookies();
    mockPathname = "/buyers-dashboard";
  });

  it("clears the current_user cookie when /auth/me returns 401", async () => {
    setCookie("current_user=" + encodeURIComponent(JSON.stringify({ role: "buyer" })));
    vi.mocked(authService.getMe).mockRejectedValue(new ApiError("Unauthorized", 401));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("anonymous"));

    expect(document.cookie).not.toContain("current_user=%7B");
  });

  it("redirects to /login when a stale session is detected on a dashboard route", async () => {
    setCookie("current_user=" + encodeURIComponent(JSON.stringify({ role: "buyer" })));
    mockPathname = "/buyers-dashboard/orders";
    vi.mocked(authService.getMe).mockRejectedValue(new ApiError("Unauthorized", 401));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/login"));
  });

  it("does not redirect when a valid session loads successfully", async () => {
    mockPathname = "/buyers-dashboard";
    vi.mocked(authService.getMe).mockResolvedValue({
      data: {
        user: {
          id: "u1",
          full_name: "Live Test Buyer",
          phone_number: "08011110005",
          email: "buyer@agrochain.live",
          role: "buyer",
          is_cluster_farmer: false,
          profile_completed: true,
          must_set_password: false,
          verification_status: "verified",
          cluster_approved: false,
          location_state: "Kaduna",
          location_lga: "Kaduna North",
          location_address: "Kaduna North",
          is_active: true,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      },
    } as never);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("authed"));
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("redirects a cluster farmer off the farmer dashboard onto their own — a role change mid-session (e.g. cluster application approval) doesn't retroactively fix the URL they're already on", async () => {
    mockPathname = "/farmers-dashboard";
    vi.mocked(authService.getMe).mockResolvedValue({
      data: {
        user: {
          id: "u2",
          full_name: "David Sunday David",
          phone_number: "08011110006",
          email: "david@agrochain.live",
          role: "cluster",
          is_cluster_farmer: true,
          profile_completed: true,
          must_set_password: false,
          verification_status: "verified",
          cluster_approved: true,
          location_state: "Kaduna",
          location_lga: "Chikun",
          location_address: "Chikun",
          is_active: true,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      },
    } as never);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/cluster-dashboard"));
  });

  it("does not redirect on a non-dashboard route (e.g. /register) even with a stale session", async () => {
    setCookie("current_user=" + encodeURIComponent(JSON.stringify({ role: "buyer" })));
    mockPathname = "/register";
    vi.mocked(authService.getMe).mockRejectedValue(new ApiError("Unauthorized", 401));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("anonymous"));
    expect(routerReplace).not.toHaveBeenCalled();
  });
});
