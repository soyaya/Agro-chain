import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Register on Agro-chain as a catfish farmer or bulk buyer. Provide your name, phone number, email, and location to get started.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/register" },
  openGraph: {
    title: "Create Your Agro-chain Account",
    description:
      "Sign up as a farmer to list your supply, or as a buyer to source fresh catfish directly from verified cluster farmers across Nigeria.",
    url: "/register",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
