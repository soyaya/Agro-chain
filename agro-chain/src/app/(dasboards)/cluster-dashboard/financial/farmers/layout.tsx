import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Farmer Finances",
  description:
    "View the financial overview of farmers registered under your cluster on Agro-chain. Monitor individual farmer loan activity, credit usage, and payment performance.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
