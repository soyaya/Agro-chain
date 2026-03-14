import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pending Approvals",
  description:
    "Review and approve fish supply listings submitted by farmers in your cluster. Approve, reject, or request changes before listings go live on the Agro-chain marketplace.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
