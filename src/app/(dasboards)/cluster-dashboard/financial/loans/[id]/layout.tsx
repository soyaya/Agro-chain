import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Details",
  description:
    "View the full details of a cluster business loan application on Agro-chain — loan type, requested amount, collateral, repayment schedule, and supporting documents.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
