import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fish Marketplace",
  description:
    "Browse fresh catfish listings from verified cluster farmers across Nigeria. Filter by state, price, and quantity. Secure ordering with flexible delivery options.",
  keywords: [
    "buy catfish Nigeria",
    "fresh fish marketplace",
    "bulk catfish supply",
    "catfish wholesale Nigeria",
    "fish supply chain",
    "cluster farmer listings",
    "aquaculture marketplace",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/marketplace" },
  openGraph: {
    title: "Fish Marketplace – Agro-chain",
    description:
      "Source fresh catfish directly from verified cluster farmers. Transparent pricing, flexible delivery, and secure payments.",
    url: "/marketplace",
  },
  twitter: {
    title: "Fish Marketplace – Agro-chain",
    description:
      "Browse fresh catfish listings from verified cluster farmers across Nigeria. Secure ordering with flexible delivery options.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
