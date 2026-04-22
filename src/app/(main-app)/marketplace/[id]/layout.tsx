import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Listing Details",
  description:
    "View full details of this fish supply listing on Agro-chain — including fish type, available quantity, packaging options, price per kg, delivery options, and seller information.",
  keywords: [
    "catfish listing",
    "buy catfish",
    "catfish price Nigeria",
    "fresh catfish",
    "aquaculture product",
    "fish supply listing",
    "cluster farmer fish",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/marketplace" },
  openGraph: {
    title: "Fish Listing – Agro-chain Marketplace",
    description:
      "Detailed view of a verified cluster farmer's fish supply listing. Check pricing, packaging, and delivery options before placing your order.",
    url: "/marketplace",
  },
  twitter: {
    title: "Fish Listing – Agro-chain Marketplace",
    description:
      "View full details of this fish supply listing — pricing, quantity, packaging, and delivery options from a verified cluster farmer.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
