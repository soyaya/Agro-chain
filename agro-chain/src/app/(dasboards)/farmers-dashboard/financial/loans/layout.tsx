import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Applications",
  description:
    "View and manage your farm loan applications on Agro-chain. Track application status, review approved amounts, interest rates, and repayment schedules.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
