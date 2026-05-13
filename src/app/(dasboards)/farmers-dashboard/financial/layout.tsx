import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Financial Services – Agro-chain",
    default: "Financial Services",
  },
  description:
    "Access financial services on Agro-chain. Apply for farm loans, purchase agricultural inputs on credit, track payment history, and view your financial profile and credit score.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
