import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Farmer Dashboard – Agro-chain",
    default: "Farmer Dashboard – Agro-chain",
  },
  description:
    "Manage your fish farm on Agro-chain. View your supply listings, track financial services, apply for loans, and update your farmer profile.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
