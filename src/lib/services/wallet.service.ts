import { apiFetch } from "~/lib/api";

// === Types

export type WalletProvisioningStatus = "pending" | "active" | "failed";
export type WalletTransactionType = "transfer_out" | "transfer_in" | "deposit";
export type WalletTransactionStatus = "pending" | "processing" | "completed" | "failed" | "reversed";

export interface WalletBalance {
  accountNumber: string | null;
  accountName: string | null;
  balance: number;
  ledgerBalance: number;
  currency: string;
  provisioningStatus: WalletProvisioningStatus;
}

export interface WalletTransactionRecord {
  id: string;
  reference: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount: number;
  beneficiary_account_number?: string;
  beneficiary_bank_code?: string;
  beneficiary_name?: string;
  narration?: string;
  created_at: string;
}

export interface NameEnquiryResult {
  accountName: string;
  accountNumber: string;
  responseCode: string;
  responseMessage: string;
}

export interface TransferPayload {
  beneficiaryAccountNumber: string;
  beneficiaryBankCode: string;
  beneficiaryName: string;
  amount: number;
  narration?: string;
}

// === Wallet Service

export const walletService = {
  /** Get live wallet balance (provisions the PulseMFB sub-account if BVN has been submitted). */
  getWallet() {
    return apiFetch<{ status: string; data: WalletBalance }>("/wallet");
  },

  /** Get the wallet's transfer history. */
  getTransactions() {
    return apiFetch<{ status: string; data: { transactions: WalletTransactionRecord[] } }>(
      "/wallet/transactions",
    );
  },

  /** Resolve a beneficiary account name before sending a transfer. */
  nameEnquiry(accountNumber: string, bankCode: string) {
    return apiFetch<{ status: string; data: NameEnquiryResult }>("/wallet/name-enquiry", {
      method: "POST",
      body: JSON.stringify({ accountNumber, bankCode }),
    });
  },

  /** Send money out of the wallet. */
  transfer(payload: TransferPayload) {
    return apiFetch<{ status: string; data: WalletTransactionRecord }>("/wallet/transfer", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
