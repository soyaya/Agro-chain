import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review Agro-chain's Terms of Service. Understand the rules governing platform use, transactions, farmer and buyer responsibilities, and liability limitations.",
  keywords: [
    "terms of service",
    "Agro-chain terms",
    "marketplace terms",
    "user agreement",
    "catfish platform policy",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service – Agro-chain",
    description:
      "The terms and conditions that govern your use of the Agro-chain catfish marketplace platform, including payment, delivery, and account policies.",
    url: "/terms",
  },
  twitter: {
    title: "Terms of Service – Agro-chain",
    description:
      "Review Agro-chain's Terms of Service. Understand the rules governing platform use, transactions, and account responsibilities.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
