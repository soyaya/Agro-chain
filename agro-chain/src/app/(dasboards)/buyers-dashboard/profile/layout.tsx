import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and update your Agro-chain buyer profile and account settings.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
