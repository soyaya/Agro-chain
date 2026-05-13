import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Listing",
  description: "Create a new marketplace listing for your aggregated fish supply on Agro-chain.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
