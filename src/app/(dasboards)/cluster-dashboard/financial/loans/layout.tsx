import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Applications",
  description:
    "Track your cluster business loan applications on Agro-chain. Review application status, approved amounts, interest rates, and repayment terms for all active loans.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
