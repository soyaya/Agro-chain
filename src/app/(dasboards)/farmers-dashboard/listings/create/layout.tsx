import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Listing",
  description:
    "Create a new fish supply listing on Agro-chain. Specify fish type, harvest date, available quantity, packaging options, and pricing for cluster farmer review.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
