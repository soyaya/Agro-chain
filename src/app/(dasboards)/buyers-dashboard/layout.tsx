import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Buyer Dashboard – Agro-chain",
    default: "Buyer Dashboard",
  },
  description:
    "Manage your Agro-chain buyer account. Browse listings, track orders, view saved items, and update your profile.",
  robots: { index: false, follow: false },
};

export default function BuyersDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
