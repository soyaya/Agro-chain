import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Farmer Profile",
  description:
    "View the full profile of a farmer in your cluster on Agro-chain - including farm details, contact information, fish type, capacity, and financial activity.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
