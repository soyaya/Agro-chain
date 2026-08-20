"use client";

import { useState } from "react";
import { WalletBalanceCard } from "~/components/wallet/WalletBalanceCard";
import { TransferForm } from "~/components/wallet/TransferForm";
import { TransactionHistoryList } from "~/components/wallet/TransactionHistoryList";
import type { WalletBalance } from "~/lib/services/wallet.service";

/** Self-contained wallet panel: balance, transfer form, transaction history. No props needed. */
export function WalletPanel() {
  const [walletReady, setWalletReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <div>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">Wallet 💳</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Manage your Agro-chain wallet, send money, and track transactions
        </p>
      </div>

      <WalletBalanceCard onWalletLoaded={(wallet: WalletBalance) => setWalletReady(!!wallet.accountNumber)} />

      {walletReady && (
        <div className="grid grid-cols-1 gap-(--gap-lg) lg:grid-cols-2">
          <TransferForm onSuccess={() => setRefreshKey((k) => k + 1)} />
          <TransactionHistoryList refreshKey={refreshKey} />
        </div>
      )}
    </div>
  );
}
