import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Cluster Dashboard – Agro-chain",
    default: "Cluster Dashboard – Agro-chain",
  },
  description:
    "Manage your cluster farming operations on Agro-chain. Oversee registered farmers, approve supply listings, manage marketplace entries, and access financial services.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
