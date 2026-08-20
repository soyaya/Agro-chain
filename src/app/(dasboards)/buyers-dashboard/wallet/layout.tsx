import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet",
  description: "View your Agro-chain wallet balance, transfer funds, and see transaction history.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
