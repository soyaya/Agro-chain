import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read Agro-chain's Privacy Policy. Learn how we collect, use, and protect your personal data, including your rights under Nigerian data protection law.",
  keywords: [
    "privacy policy",
    "data protection Nigeria",
    "Agro-chain privacy",
    "personal data",
    "NDPR compliance",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy – Agro-chain",
    description:
      "Understand how Agro-chain handles your personal information, transaction data, and business details. Your privacy is our priority.",
    url: "/privacy",
  },
  twitter: {
    title: "Privacy Policy – Agro-chain",
    description:
      "Read Agro-chain's Privacy Policy. Learn how we collect, use, and protect your personal data under Nigerian data protection law.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
