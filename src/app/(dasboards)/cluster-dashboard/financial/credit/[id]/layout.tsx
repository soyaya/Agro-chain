import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Purchase Details",
  description:
    "View the full breakdown of a credit purchase for your cluster business on Agro-chain - items, supplier details, credit terms, payment schedule, and delivery status.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
