import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SectionFAQ from "~/components/SectionFAQ";
import { aboutFaqs } from "~/models/models";
import AboutValuesSection from "~/components/landing/about/AboutValuesSection";
import AboutTeamSection from "~/components/landing/about/AboutTeamSection";
import AboutStatsSection from "~/components/landing/about/AboutStatsSection";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Agro-chain - the team building digital infrastructure for Nigeria's ₦500B catfish industry. Our mission, story, and values.",
  keywords: [
    "about agro-chain",
    "agro-chain team Nigeria",
    "catfish industry Nigeria",
    "Nigeria aquaculture startup",
    "catfish supply chain transparency",
    "digital agriculture Nigeria",
    "agri-tech Nigeria",
    "catfish farming platform",
    "verified catfish supply",
    "Nigeria food supply chain",
    "agro-chain founders",
    "catfish marketplace mission",
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
    canonical: "https://agro-chain.com/about",
  },
  openGraph: {
    type: "website",
    url: "https://agro-chain.com/about",
    title: "About Agro-chain | Building Nigeria's Catfish Infrastructure",
    description:
      "We're building the digital infrastructure for Nigeria's ₦500B+ catfish industry - transparent, secure, and fair for every participant.",
    images: [
      {
        url: "/images/og-hero.png",
        width: 1200,
        height: 630,
        alt: "About Agro-chain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Agro-chain | Building Nigeria's Catfish Infrastructure",
    description:
      "Meet the team building transparent, secure infrastructure for Nigeria's catfish supply chain.",
    images: ["/images/og-hero.png"],
  },
};

export default function AboutPage() {
  return (
    <div className="layout-max-width">
      {/* Section 1: Hero */}
      <section aria-label="About Hero" className="border-gray-border border-b bg-green-50">
        <div className="content-width px-4 py-20 lg:px-25 lg:py-28">
          <div className="border-theme-green-dark max-w-3xl border-l-4 pl-6">
            <span className="font-ubuntu text-theme-green-dark text-xs font-semibold tracking-widest uppercase">
              About Agro-chain
            </span>
            <h1 className="font-ubuntu text-heading-colour mt-4 text-3xl font-bold lg:text-5xl">
              We&apos;re Building the Infrastructure for Nigeria&apos;s Catfish Industry.
            </h1>
            <p className="font-roboto-slab text-text-colour mt-6 text-lg">
              Agro-chain is a digital marketplace that connects verified catfish farmers and cluster
              aggregators with bulk buyers - bringing transparency, security, and efficiency to a
              ₦500B+ industry.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Our Story */}
      <section aria-label="Our Story" className="bg-white">
        <div className="content-width px-4 py-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-25 lg:py-25">
          <div className="flex flex-col gap-6">
            <span className="font-ubuntu text-theme-green-dark text-xs font-semibold tracking-widest uppercase">
              Our Story
            </span>
            <h2 className="font-ubuntu text-heading-colour text-3xl font-bold lg:text-4xl">
              Built to solve a real problem.
            </h2>
            <div className="font-roboto-slab text-text-colour flex flex-col gap-4 text-lg">
              <p>
                Nigeria produces over 300,000 metric tonnes of catfish annually, yet most
                transactions happen informally - through phone calls, cash payments, and unverified
                middlemen. Prices are opaque. Logistics are unreliable. Farmers get underpaid.
                Buyers get inconsistent quality.
              </p>
              <p>
                Agro-chain was built to change that. We created a three-sided marketplace where
                individual farmers list their supply, cluster farmers aggregate and verify it, and
                buyers purchase with confidence - backed by Paystack escrow and full order tracking.
              </p>
            </div>
          </div>
          <div className="relative mt-10 h-80 overflow-hidden rounded-2xl lg:mt-0 lg:h-full lg:min-h-100">
            <Image
              src="/Home_Image_1/Home_1.webp"
              alt="Agro-chain farm operations"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Our Values */}
      <AboutValuesSection />

      {/* Section 4: Impact Numbers */}
      <AboutStatsSection />

      {/* Section 5: Meet the Team */}
      <AboutTeamSection />

      {/* Section 6: CTA */}
      <section aria-label="About CTA" className="bg-white">
        <div className="content-width flex flex-col items-center gap-6 px-4 py-16 text-center lg:px-25 lg:py-20">
          <h2 className="font-ubuntu text-heading-colour text-3xl font-bold lg:text-4xl">
            Want to be part of this?
          </h2>
          <p className="font-roboto-slab text-text-colour max-w-xl text-lg">
            Join as a farmer, cluster farmer, or buyer today.
          </p>
          <Link
            href="/register"
            className="font-ubuntu bg-theme-green-dark hover:bg-theme-green-light rounded-full px-8 py-3 text-sm font-semibold text-white transition"
          >
            Get Started →
          </Link>
        </div>
      </section>

      <SectionFAQ
        faqs={aboutFaqs}
        heading="Questions about Agro-chain?"
        subtext="Learn more about our mission, team, and platform."
        ctaLabel="Learn more about us"
        ctaHref="/contact"
      />
    </div>
  );
}
