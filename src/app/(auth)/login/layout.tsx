import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to your Agro-chain account with your phone number. Farmers and buyers access their dashboards securely via OTP verification.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
  openGraph: {
    title: "Log In to Agro-chain",
    description:
      "Access your farmer or buyer dashboard. Enter your phone number to receive a one-time verification code.",
    url: "/login",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
