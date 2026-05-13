import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Purchases",
  description:
    "Track your agricultural input purchases made on credit through Agro-chain. View order status, payment progress, and outstanding balances for seeds, fertilizers, and equipment.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
