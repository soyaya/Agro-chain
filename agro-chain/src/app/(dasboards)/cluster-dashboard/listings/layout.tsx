import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Listings",
  description:
    "Manage your marketplace fish supply listings on Agro-chain. Track listing approval status, set pricing per kg, configure delivery options, and control marketplace visibility.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
