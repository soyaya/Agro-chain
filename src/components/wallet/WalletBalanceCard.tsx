"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, ShieldAlert, Wallet as WalletIcon } from "lucide-react";
import { ApiError } from "~/lib/api";
import { walletService, type WalletBalance } from "~/lib/services/wallet.service";

type LoadState = "loading" | "ready" | "requires-verification" | "error";

export function WalletBalanceCard({ onWalletLoaded }: { onWalletLoaded?: (wallet: WalletBalance) => void }) {
  const [state, setState] = useState<LoadState>("loading");
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    setErrorMessage(null);
    try {
      const response = await walletService.getWallet();
      setWallet(response.data);
      setState("ready");
      onWalletLoaded?.(response.data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setState("requires-verification");
      } else {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load wallet.");
        setState("error");
      }
    }
  }, [onWalletLoaded]);

  useEffect(() => {
    load();
  }, [load]);

  if (state === "loading") {
    return (
      <div className="flex min-h-[140px] items-center justify-center rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-(--theme-green-dark)" />
      </div>
    );
  }

  if (state === "requires-verification") {
    return (
      <div className="flex flex-col items-start gap-(--space-md) rounded-2xl border border-orange-200 bg-orange-50 p-(--space-xl) shadow-sm">
        <div className="flex items-center gap-(--space-sm)">
          <ShieldAlert className="h-6 w-6 text-orange-600" />
          <h3 className="font-ubuntu text-lg font-semibold text-(--heading-colour)">
            Complete BVN Verification
          </h3>
        </div>
        <p className="font-roboto-slab text-sm text-(--text-colour)">
          You need to verify your identity with your BVN before a wallet can be created for you.
        </p>
        <Link
          href="/verify"
          className="rounded-lg bg-(--theme-green-dark) px-(--space-lg) py-(--space-sm) text-sm font-medium text-white transition-all duration-300 ease-in-out hover:opacity-90"
        >
          Complete Verification
        </Link>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-start gap-(--space-md) rounded-2xl border border-red-200 bg-red-50 p-(--space-xl) shadow-sm">
        <p className="font-roboto-slab text-sm text-(--error-red)">
          {errorMessage || "Something went wrong loading your wallet."}
        </p>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-(--border-input) bg-(--white) px-(--space-lg) py-(--space-sm) text-sm font-medium text-(--text-colour) transition-all duration-300 ease-in-out hover:shadow-sm"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  if (!wallet) return null;

  return (
    <div className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-(--space-md)">
          <div className="rounded-xl bg-green-50 p-(--space-md)">
            <WalletIcon size={24} className="text-(--theme-green-dark)" />
          </div>
          <div>
            <p className="font-roboto-slab text-sm text-gray-500">Wallet Balance</p>
            <p className="font-ubuntu text-3xl font-bold text-(--heading-colour)">
              {wallet.currency} {wallet.balance.toLocaleString()}
            </p>
          </div>
        </div>
        <button
          onClick={load}
          aria-label="Refresh balance"
          className="rounded-lg p-(--space-sm) text-gray-400 transition-all duration-300 ease-in-out hover:bg-gray-50 hover:text-(--theme-green-dark)"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      {wallet.accountNumber && (
        <div className="mt-(--space-lg) flex flex-col gap-1 border-t border-(--border-input) pt-(--space-lg)">
          <p className="font-roboto-slab text-sm text-gray-500">
            Account Number: <span className="font-medium text-(--text-colour)">{wallet.accountNumber}</span>
          </p>
          {wallet.accountName && (
            <p className="font-roboto-slab text-sm text-gray-500">
              Account Name: <span className="font-medium text-(--text-colour)">{wallet.accountName}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
