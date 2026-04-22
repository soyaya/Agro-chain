import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Listings",
  description: "Browse your saved catfish supply listings on Agro-chain.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
