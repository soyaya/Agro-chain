import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with your Agro-chain account. Contact our support team via live chat, email, or phone. Browse FAQs covering registration, listings, payments, and delivery.",
  keywords: [
    "Agro-chain support",
    "help centre",
    "contact Agro-chain",
    "catfish marketplace help",
    "customer support Nigeria",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/support" },
  openGraph: {
    title: "Support Centre – Agro-chain",
    description:
      "Need help? Reach the Agro-chain support team through live chat, email, or phone. Find answers to common questions about orders, payments, and listings.",
    url: "/support",
  },
  twitter: {
    title: "Support Centre – Agro-chain",
    description:
      "Get help with your Agro-chain account. Contact our support team via live chat, email, or phone. Browse FAQs covering registration, listings, and payments.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
