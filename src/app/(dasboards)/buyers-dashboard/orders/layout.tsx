import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description: "View and manage all your catfish orders on Agro-chain.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
