import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Identity",
  description:
    "Complete your Agro-chain identity verification. Submit your BVN to unlock full platform access and build trust with buyers and farmers.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/verify-identity" },
  openGraph: {
    title: "Verify Your Identity – Agro-chain",
    description:
      "Secure your account with BVN verification. Identity checks help maintain a trusted marketplace for all catfish farmers and buyers.",
    url: "/verify-identity",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
