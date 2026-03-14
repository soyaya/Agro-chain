import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Listings",
  description:
    "Manage your fish supply listings on Agro-chain. Track approval status, view pending and approved listings, and create new supply entries for the marketplace.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
