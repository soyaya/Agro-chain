import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description:
    "View and update your cluster farmer profile on Agro-chain. Manage your business name, CAC registration, warehouse location, distribution capacity, and logistics availability.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
