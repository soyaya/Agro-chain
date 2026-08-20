"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { NIGERIAN_BANK_CODES } from "~/lib/constants/bankCodes";
import { walletService } from "~/lib/services/wallet.service";

export function TransferForm({ onSuccess }: { onSuccess?: () => void }) {
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [resolvingName, setResolvingName] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      toast.success("Transfer initiated.");
      setAccountNumber("");
      setBankCode("");
      setBeneficiaryName("");
      setAmount("");
      setNarration("");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transfer failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-(--space-lg) rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
    >
      <h2 className="font-ubuntu text-xl font-semibold text-(--heading-colour)">Send Money</h2>

      <SelectInput
        label="Bank"
        required
        options={NIGERIAN_BANK_CODES}
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
        Send Money
      </SubmitPrimaryButton>
    </form>
  );
}
