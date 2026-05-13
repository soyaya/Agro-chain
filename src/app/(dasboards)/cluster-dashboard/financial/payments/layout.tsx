import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment History",
  description:
    "Review your cluster business payment history on Agro-chain. Track loan repayments, credit purchase payments, upcoming due dates, and payment status across all obligations.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
