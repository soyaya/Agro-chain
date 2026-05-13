import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Profile",
  description:
    "View your Agro-chain financial profile. Check your credit score, available credit limit, active loans, risk assessment, and full payment history to understand your financial standing.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
