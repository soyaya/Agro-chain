import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Financial Services – Agro-chain",
    default: "Financial Services",
  },
  description:
    "Access financial services for your cluster farming business on Agro-chain. Manage loans, credit purchases, payment history, financial profile, and oversee farmer finances.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
