import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Policy",
  description:
    "AgroChain's Platform Policy — how escrow payments, delivery risk, theft, fraud, and fund-loss claims are handled on the marketplace.",
  keywords: [
    "platform policy",
    "marketplace policy",
    "escrow policy",
    "delivery risk",
    "AgroChain policy",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/policy" },
  openGraph: {
    title: "Platform Policy – AgroChain",
    description:
      "How AgroChain protects payments, handles delivery risk, and responds to theft, fraud, or fund-loss claims on the marketplace.",
    url: "/policy",
  },
  twitter: {
    title: "Platform Policy – AgroChain",
    description:
      "AgroChain's Platform Policy — escrow, delivery risk, theft, fraud, and fund-loss claims explained.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
