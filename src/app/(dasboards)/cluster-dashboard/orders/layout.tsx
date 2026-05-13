import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description:
    "Review and manage incoming buyer orders on Agro-chain. Accept or reject orders, update fulfillment status, and confirm delivery completion.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
