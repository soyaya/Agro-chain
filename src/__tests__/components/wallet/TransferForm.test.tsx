import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const getBanksMock = vi.fn();
const nameEnquiryMock = vi.fn();
const transferMock = vi.fn();
vi.mock("~/lib/services/wallet.service", () => ({
  walletService: {
    getBanks: (...args: unknown[]) => getBanksMock(...args),
    nameEnquiry: (...args: unknown[]) => nameEnquiryMock(...args),
    transfer: (...args: unknown[]) => transferMock(...args),
  },
}));

const { TransferForm } = await import("~/components/wallet/TransferForm");
const { toast } = await import("sonner");

const banks = [
  { bankCode: "044", bankName: "Access Bank" },
  { bankCode: "058", bankName: "GTBank" },
];

describe("TransferForm", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    getBanksMock.mockReset().mockResolvedValue({ status: "success", data: { banks } });
    nameEnquiryMock.mockReset();
    transferMock.mockReset();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function fillBankAndAccount(user: ReturnType<typeof userEvent.setup>) {
    const bankSelect = await screen.findByRole("combobox", { name: /bank/i });
    await user.click(bankSelect);
    await user.click(await screen.findByText("GTBank"));

    const accountInput = screen.getByLabelText("Beneficiary Account Number");
    await user.type(accountInput, "0123456789");
  }

  it("loads and lists banks on mount", async () => {
    render(<TransferForm />);
    await waitFor(() => expect(getBanksMock).toHaveBeenCalledTimes(1));
  });

  it("debounces the account-name lookup — fires once 400ms after both fields are complete", async () => {
    nameEnquiryMock.mockResolvedValue({
      status: "success",
      data: { accountName: "John Doe", accountNumber: "0123456789", bankCode: "058", bankName: "GTBank" },
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<TransferForm />);
    await fillBankAndAccount(user);

    // Not called yet — debounce hasn't elapsed.
    expect(nameEnquiryMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(400);

    await waitFor(() => expect(nameEnquiryMock).toHaveBeenCalledWith("0123456789", "058"));
    await waitFor(() =>
      expect(screen.getByLabelText(/Beneficiary Name/)).toHaveValue("John Doe"),
    );
  });

  it("does not trigger name enquiry when the account number is short of 10 digits", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransferForm />);

    const bankSelect = await screen.findByRole("combobox", { name: /bank/i });
    await user.click(bankSelect);
    await user.click(await screen.findByText("GTBank"));

    const accountInput = screen.getByLabelText("Beneficiary Account Number");
    await user.type(accountInput, "12345");

    await vi.advanceTimersByTimeAsync(500);
    expect(nameEnquiryMock).not.toHaveBeenCalled();
  });

  it("strips non-digit characters and caps the account number at 10 digits", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransferForm />);
    const accountInput = screen.getByLabelText("Beneficiary Account Number");
    await user.type(accountInput, "01a2b3456789xyz");
    expect(accountInput).toHaveValue("0123456789");
  });

  it("rejects submit with a toast when the account number is not 10 digits", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransferForm />);

    await user.type(screen.getByLabelText("Beneficiary Account Number"), "123");
    await user.type(screen.getByLabelText(/Beneficiary Name/), "John Doe");
    await user.type(screen.getByLabelText("Amount"), "500");

    await user.click(screen.getByRole("button", { name: /withdraw/i }));

    expect(toast.error).toHaveBeenCalledWith("Account number must be 10 digits.");
    expect(transferMock).not.toHaveBeenCalled();
  });

  it("rejects submit with a toast when no bank is selected", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransferForm />);

    await user.type(screen.getByLabelText("Beneficiary Account Number"), "0123456789");
    await user.type(screen.getByLabelText(/Beneficiary Name/), "John Doe");
    await user.type(screen.getByLabelText("Amount"), "500");

    await user.click(screen.getByRole("button", { name: /withdraw/i }));

    expect(toast.error).toHaveBeenCalledWith("Please select a bank.");
    expect(transferMock).not.toHaveBeenCalled();
  });

  it("rejects submit with a toast when the amount is missing or zero", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransferForm />);
    await fillBankAndAccount(user);
    await user.type(screen.getByLabelText(/Beneficiary Name/), "John Doe");

    await user.click(screen.getByRole("button", { name: /withdraw/i }));

    expect(toast.error).toHaveBeenCalledWith("Enter a valid amount.");
    expect(transferMock).not.toHaveBeenCalled();
  });

  it("submits a valid transfer and resets the form on success", async () => {
    transferMock.mockResolvedValue({ status: "success", data: {} });
    const onSuccess = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<TransferForm onSuccess={onSuccess} />);
    await fillBankAndAccount(user);
    await user.type(screen.getByLabelText(/Beneficiary Name/), "John Doe");
    await user.type(screen.getByLabelText("Amount"), "1000");

    await user.click(screen.getByRole("button", { name: /withdraw/i }));

    await waitFor(() =>
      expect(transferMock).toHaveBeenCalledWith({
        beneficiaryAccountNumber: "0123456789",
        beneficiaryBankCode: "058",
        beneficiaryName: "John Doe",
        amount: 1000,
        narration: undefined,
      }),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Withdrawal initiated."));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByLabelText("Amount")).toHaveValue(""));
  });

  it("shows a toast and does not reset the form when the transfer call fails", async () => {
    transferMock.mockRejectedValue(new Error("Insufficient balance"));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<TransferForm />);
    await fillBankAndAccount(user);
    await user.type(screen.getByLabelText(/Beneficiary Name/), "John Doe");
    await user.type(screen.getByLabelText("Amount"), "1000");

    await user.click(screen.getByRole("button", { name: /withdraw/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Insufficient balance"));
    expect(screen.getByLabelText("Amount")).toHaveValue("1000");
  });
});
