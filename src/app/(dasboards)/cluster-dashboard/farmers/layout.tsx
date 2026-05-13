import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Farmers",
  description: "View and manage the farmers registered under your cluster on Agro-chain.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
