import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Purchases",
  description:
    "Manage agricultural input purchases made on credit for your cluster business on Agro-chain. Track order status, payment progress, and outstanding balances.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
