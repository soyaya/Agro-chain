import type { Metadata } from "next";
import Link from "next/link";
import SectionFAQ from "~/components/SectionFAQ";
import HowItWorksRoleTabs from "~/components/landing/how-it-works/HowItWorksRoleTabs";
import { farmerFaqs, clusterFarmerFaqs, buyerFaqs } from "~/models/models";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See how Agro-chain works for farmers, cluster farmers, and buyers. Step-by-step from registration to payout - transparent and straightforward.",
  keywords: [
    "how agro-chain works",
    "catfish farmer registration Nigeria",
    "cluster farmer platform Nigeria",
    "how to sell catfish online Nigeria",
    "how to buy catfish online",
    "catfish marketplace process",
    "Paystack catfish payment Nigeria",
    "catfish escrow payment",
    "catfish listing approval",
    "bulk catfish order process",
    "agro-chain buyer guide",
    "agro-chain farmer guide",
    "catfish supply OTP verification",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://agro-chain-bom-vercel.vercel.app/how-it-works",
  },
  openGraph: {
    type: "website",
    url: "https://agro-chain-bom-vercel.vercel.app/how-it-works",
    title: "How Agro-chain Works | Step-by-Step for Every Role",
    description:
      "Three roles, one platform. See the exact steps for farmers, cluster farmers, and buyers - from signup to payout.",
    images: [
      {
        url: "/images/og-hero.png",
        width: 1200,
        height: 630,
        alt: "How Agro-chain works",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Agro-chain Works | Step-by-Step for Every Role",
    description:
      "Three roles, one platform. Transparent steps for farmers, cluster farmers, and buyers.",
    images: ["/images/og-hero.png"],
  },
};

export default function HowItWorksPage() {
  return (
    <div className="layout-max-width">
      {/* Section 1 - Hero */}
      <section aria-label="How It Works Hero" className="bg-green-50 border-b border-gray-border">
        <div className="content-width px-4 py-20 lg:px-25 lg:py-28">
          <div className="max-w-2xl">
            <span className="font-ubuntu text-xs font-semibold tracking-widest text-theme-green-dark uppercase">
              How It Works
            </span>
            <h1 className="font-ubuntu mt-4 text-3xl font-bold text-heading-colour lg:text-5xl">
              How Agro-chain Works
            </h1>
            <p className="font-roboto-slab mt-4 text-lg text-text-colour">
              A simple, transparent process for every role on the platform.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 - Role Tabs with timelines */}
      <HowItWorksRoleTabs
        farmerFaqs={farmerFaqs}
        clusterFarmerFaqs={clusterFarmerFaqs}
        buyerFaqs={buyerFaqs}
      />

      {/* Section 4 - CTA */}
      <section aria-label="How It Works CTA" className="bg-gray-bg border-t border-gray-border">
        <div className="content-width px-4 py-16 text-center lg:px-25 lg:py-20">
          <h2 className="font-ubuntu mb-6 text-3xl font-bold text-heading-colour lg:text-4xl">
            Ready to get started?
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register?role=farmer"
              className="font-ubuntu rounded-full bg-theme-green-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-theme-green-light"
            >
              I&apos;m a Farmer
            </Link>
            <Link
              href="/register?role=farmer"
              className="font-ubuntu rounded-full border border-theme-green-dark px-6 py-3 text-sm font-semibold text-theme-green-dark transition hover:bg-theme-green-dark hover:text-white"
            >
              I&apos;m a Cluster Farmer
            </Link>
            <Link
              href="/register?role=buyer"
              className="font-ubuntu rounded-full border border-theme-green-dark px-6 py-3 text-sm font-semibold text-theme-green-dark transition hover:bg-theme-green-dark hover:text-white"
            >
              I&apos;m a Buyer
            </Link>
          </div>
        </div>
      </section>

      <SectionFAQ
        faqs={farmerFaqs}
        heading="Questions about the process?"
        subtext="Find answers to the most common questions about how each role works on Agro-chain."
        ctaLabel="Get Started"
        ctaHref="/register"
      />
    </div>
  );
}
