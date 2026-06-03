import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Details",
  description:
    "View full details of your farm loan application on Agro-chain - including loan type, requested amount, farm collateral, repayment terms, and uploaded documents.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
