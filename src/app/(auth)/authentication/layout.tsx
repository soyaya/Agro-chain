import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Join Agro-chain as a catfish farmer or verified buyer. Select your role to register or log in to the platform.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/authentication" },
  openGraph: {
    title: "Get Started on Agro-chain",
    description:
      "Are you a catfish farmer or a bulk buyer? Choose your role and join Nigeria's leading fish supply marketplace.",
    url: "/authentication",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
