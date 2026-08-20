"use client";

import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, Receipt, XCircle } from "lucide-react";
import { walletService, type WalletTransactionRecord, type WalletTransactionStatus } from "~/lib/services/wallet.service";

const STATUS_CONFIG: Record<WalletTransactionStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  completed: { label: "Completed", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
  pending: { label: "Pending", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
  processing: { label: "Processing", color: "text-blue-600", bgColor: "bg-blue-100", icon: Clock },
  failed: { label: "Failed", color: "text-red-600", bgColor: "bg-red-100", icon: XCircle },
  reversed: { label: "Reversed", color: "text-orange-600", bgColor: "bg-orange-100", icon: XCircle },
};

export function TransactionHistoryList({ refreshKey }: { refreshKey?: number }) {
  const [transactions, setTransactions] = useState<WalletTransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    walletService
      .getTransactions()
      .then((response) => {
        if (!cancelled) setTransactions(response.data.transactions);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm">
      <h2 className="mb-(--space-lg) font-ubuntu text-xl font-semibold text-(--heading-colour)">
        Transaction History
      </h2>

      {loading ? (
        <p className="font-roboto-slab text-sm text-gray-500">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-(--space-xl) text-center">
          <Receipt size={48} className="mb-(--space-md) text-gray-300" />
          <p className="font-roboto-slab text-gray-500">No transactions yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-(--space-md)">
          {transactions.map((tx) => {
            const statusConfig = STATUS_CONFIG[tx.status];
            const StatusIcon = statusConfig.icon;
            const DirectionIcon = tx.type === "transfer_out" ? ArrowUpRight : ArrowDownLeft;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-(--border-input) p-(--space-lg) transition-all duration-300 ease-in-out hover:shadow-md"
              >
                <div className="flex items-center gap-(--space-lg)">
                  <div className={`rounded-xl p-(--space-md) ${statusConfig.bgColor}`}>
                    <StatusIcon size={20} className={statusConfig.color} />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1 font-ubuntu text-base font-semibold text-(--heading-colour)">
                      <DirectionIcon size={16} />
                      {tx.beneficiary_name || tx.reference}
                    </div>
                    <p className="font-roboto-slab text-sm text-gray-600">
                      {tx.reference} • {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="mb-1 font-ubuntu text-lg font-bold text-(--heading-colour)">
                    ₦{tx.amount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
