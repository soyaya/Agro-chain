import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Farmer Profile",
  description: "View the full profile of a farmer in your cluster on Agro-chain.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
