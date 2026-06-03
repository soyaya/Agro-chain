import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View orders placed against your fish supply listings.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
