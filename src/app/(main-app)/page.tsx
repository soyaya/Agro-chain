import type { Metadata } from "next";
import { Suspense } from "react";
import SectionFAQ from "~/components/SectionFAQ";
import HeroSection from "~/components/landing/HeroSection";
import ImpactStatsSection from "~/components/landing/ImpactStatsSection";
import HowItWorksSection from "~/components/landing/HowItWorksSection";
import FeaturesSection from "~/components/landing/FeaturesSection";
import FishCategoriesSection from "~/components/landing/FishCategoriesSection";
import MarketplacePreviewSection from "~/components/landing/MarketplacePreviewSection";
import TestimonialsSection from "~/components/landing/TestimonialsSection";
import CTABannerSection from "~/components/landing/CTABannerSection";
import { homeFaqs } from "~/models/models";

export const metadata: Metadata = {
  title: "Nigeria's Catfish Marketplace",
  description:
    "Agro-chain connects verified catfish farmers to bulk buyers across Nigeria. Admin-set pricing, Paystack escrow, and coordinated delivery - no middlemen.",
  keywords: [
    "catfish marketplace Nigeria",
    "buy catfish online Nigeria",
    "sell catfish online",
    "fresh catfish supply chain",
    "verified catfish farmers",
    "bulk catfish buyers Nigeria",
    "cluster farmers Nigeria",
    "catfish fingerlings for sale",
    "table size catfish Nigeria",
    "jumbo catfish Nigeria",
    "Paystack catfish payment",
    "catfish escrow payment",
    "agro-chain marketplace",
    "catfish delivery Nigeria",
    "aquaculture Nigeria",
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
    canonical: "https://agro-chain.com",
  },
  openGraph: {
    type: "website",
    url: "https://agro-chain.com",
    title: "Agro-chain | Nigeria's Catfish Marketplace",
    description:
      "Connecting verified catfish farmers to bulk buyers across Nigeria. Admin-set pricing, Paystack escrow, coordinated delivery.",
    images: [
      {
        url: "/images/og-hero.png",
        width: 1200,
        height: 630,
        alt: "Agro-chain - Nigeria's catfish marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agro-chain | Nigeria's Catfish Marketplace",
    description: "Connecting verified catfish farmers to bulk buyers across Nigeria.",
    images: ["/images/og-hero.png"],
  },
};

export default function HomePage() {
  return (
    <div className="layout-max-width">
      <HeroSection />
      <ImpactStatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <FishCategoriesSection />
      <Suspense fallback={null}>
        <MarketplacePreviewSection />
      </Suspense>
      <TestimonialsSection />
      <CTABannerSection />
      <SectionFAQ
        faqs={homeFaqs}
        heading="Simplifying complex farming questions."
        subtext="Can't find your answer? Reach us directly and we'll respond within 24 hours."
        ctaLabel="Contact Support"
        ctaHref="/contact"
      />
    </div>
  );
}
