import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Details",
  description: "View the full details of your catfish order on Agro-chain.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
