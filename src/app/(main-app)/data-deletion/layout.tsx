import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Deletion Instructions",
  description:
    "How to request deletion of your personal data from Agro-chain, including data shared via Facebook, Instagram, or WhatsApp integrations.",
  keywords: [
    "data deletion",
    "delete my data",
    "Agro-chain data deletion",
    "account deletion Nigeria",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/data-deletion" },
  openGraph: {
    title: "Data Deletion Instructions – Agro-chain",
    description: "Step-by-step instructions for requesting deletion of your personal data from Agro-chain.",
    url: "/data-deletion",
  },
  twitter: {
    title: "Data Deletion Instructions – Agro-chain",
    description: "Step-by-step instructions for requesting deletion of your personal data from Agro-chain.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
