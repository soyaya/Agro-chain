import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Purchase Details",
  description:
    "View the full breakdown of a credit purchase on Agro-chain — items ordered, supplier details, credit terms, payment schedule, and current delivery status.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
