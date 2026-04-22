import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description:
    "View and update your farmer profile on Agro-chain. Edit your farm details, contact information, fish type, and farming capacity. Apply to become a cluster farmer.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
