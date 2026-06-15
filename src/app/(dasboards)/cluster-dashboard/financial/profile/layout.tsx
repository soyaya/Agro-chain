import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Profile",
  description:
    "View and manage your cluster's financial profile on Agro-chain.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
