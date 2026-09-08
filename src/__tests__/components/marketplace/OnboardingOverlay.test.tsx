import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingOverlay } from "~/components/marketplace/OnboardingOverlay";

const ONBOARDING_KEY = "onboarding-completed";

describe("OnboardingOverlay", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the onboarding carousel on a first-ever visit", async () => {
    render(<OnboardingOverlay />);
    await waitFor(() => expect(screen.getByText("Explore")).toBeInTheDocument());
  });

  it("renders nothing when the onboarding-completed flag is already set", async () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    const { container } = render(<OnboardingOverlay />);

    await waitFor(() => {
      // Give the mount effect a tick to run, then confirm nothing rendered.
      expect(container).toBeEmptyDOMElement();
    });
  });

  it("sets the localStorage flag and dismisses itself once the user reaches 'Get Started'", async () => {
    const user = userEvent.setup();
    render(<OnboardingOverlay />);
    await waitFor(() => expect(screen.getByText("Explore")).toBeInTheDocument());

    // Step 1 -> 2
    await user.click(screen.getByRole("button", { name: /continue to step 2/i }));
    await waitFor(() => expect(screen.getByText("Order It")).toBeInTheDocument());

    // Step 2 -> 3
    await user.click(screen.getByRole("button", { name: /continue to step 3/i }));
    await waitFor(() => expect(screen.getByText("You Got It")).toBeInTheDocument());

    // Step 3 -> dismiss
    await user.click(screen.getByRole("button", { name: /get started/i }));

    expect(localStorage.getItem(ONBOARDING_KEY)).toBe("true");
    await waitFor(() => expect(screen.queryByText("You Got It")).not.toBeInTheDocument());
  });
});
