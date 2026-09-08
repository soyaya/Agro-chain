"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { walletService, type Bank, type WalletBalance } from "~/lib/services/wallet.service";

export function TransferForm({
  wallet,
  onSuccess,
}: {
  wallet?: WalletBalance | null;
  onSuccess?: () => void;
}) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [resolvingName, setResolvingName] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    walletService
      .getBanks()
      .then((response) => setBanks(response.data.banks))
      .catch(() => {
        // Non-fatal — the bank select just stays empty; the user can retry by reopening the form.
      })
      .finally(() => setLoadingBanks(false));
  }, []);

  // Auto-resolve the beneficiary name as soon as both fields are complete,
  // instead of only on blur/select-change — covers pasting an account number,
  // editing it after already picking a bank, or changing the bank after the
  // account number was already typed.
  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) return;
    const timer = setTimeout(() => {
      resolveBeneficiaryName();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountNumber, bankCode]);

  const resolveBeneficiaryName = async () => {
    if (accountNumber.length !== 10 || !bankCode) return;
    setResolvingName(true);
    try {
      const response = await walletService.nameEnquiry(accountNumber, bankCode);
      setBeneficiaryName(response.data.accountName);
    } catch {
      // Non-fatal — the user can still type the beneficiary name in manually.
    } finally {
      setResolvingName(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountNumber.length !== 10) {
      toast.error("Account number must be 10 digits.");
      return;
    }
    if (!bankCode) {
      toast.error("Please select a bank.");
      return;
    }
    if (!beneficiaryName.trim()) {
      toast.error("Beneficiary name is required.");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    setSubmitting(true);
    try {
      await walletService.transfer({
        beneficiaryAccountNumber: accountNumber,
        beneficiaryBankCode: bankCode,
        beneficiaryName,
        amount: parsedAmount,
        narration: narration || undefined,
      });
      toast.success("Withdrawal initiated.");
      setAccountNumber("");
      setBankCode("");
      setBeneficiaryName("");
      setAmount("");
      setNarration("");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Withdrawal failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-(--space-lg) rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
    >
      <div>
        <h2 className="font-ubuntu text-xl font-semibold text-(--heading-colour)">Withdraw to Bank Account</h2>
        <p className="font-roboto-slab mt-1 text-sm text-(--text-colour)">
          Send funds from your wallet to any bank account.
        </p>
        {wallet?.accountNumber && (
          <p className="font-roboto-slab mt-2 rounded-lg bg-gray-50 px-(--space-md) py-(--space-sm) text-sm text-(--text-colour)">
            Withdrawing from:{" "}
            <span className="font-medium">
              {wallet.accountNumber}
              {wallet.accountName ? ` (${wallet.accountName})` : ""}
            </span>{" "}
            — Balance: {wallet.currency} {wallet.balance.toLocaleString()}
          </p>
        )}
      </div>

      <SelectInput
        label={loadingBanks ? "Bank (loading...)" : "Bank"}
        required
        options={banks.map((bank) => ({ label: bank.bankName, value: bank.bankCode }))}
        value={bankCode}
        onValueChange={(value) => {
          setBankCode(value);
          if (accountNumber.length === 10) resolveBeneficiaryName();
        }}
      />

      <DynamicInput
        label="Beneficiary Account Number"
        required
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
        onBlur={resolveBeneficiaryName}
        maxLength={10}
        placeholder="Enter 10-digit account number"
      />

      <DynamicInput
        label={resolvingName ? "Beneficiary Name (resolving...)" : "Beneficiary Name"}
        required
        value={beneficiaryName}
        onChange={(e) => setBeneficiaryName(e.target.value)}
        placeholder="Beneficiary name"
      />

      <DynamicInput
        label="Amount"
        required
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
        placeholder="0.00"
      />

      <DynamicInput
        label="Narration"
        value={narration}
        onChange={(e) => setNarration(e.target.value)}
        placeholder="What's this for?"
      />

      <SubmitPrimaryButton loading={submitting} loadingText="Sending...">
        Withdraw
      </SubmitPrimaryButton>
    </form>
  );
}
