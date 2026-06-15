import type { Metadata } from "next";
import SectionFAQ from "~/components/SectionFAQ";
import { contactFaqs, socialLinks } from "~/models/models";
import ContactFormSection from "~/components/landing/contact/ContactFormSection";
import { MapPin, Clock, Globe, Phone, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Agro-chain team. WhatsApp, email, or phone - we respond within 24 hours on business days.",
  keywords: [
    "contact agro-chain",
    "agro-chain support",
    "catfish marketplace support Nigeria",
    "agro-chain WhatsApp",
    "catfish platform help",
    "agro-chain partnership",
    "farmer support Nigeria",
    "buyer support catfish",
    "agro-chain phone number",
    "agro-chain email",
    "catfish marketplace contact",
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
    canonical: "https://agro-chain.com/contact",
  },
  openGraph: {
    type: "website",
    url: "https://agro-chain.com/contact",
    title: "Contact Agro-chain | Get in Touch",
    description:
      "Have a question, partnership inquiry, or need support? Reach the Agro-chain team via WhatsApp, email, or phone.",
    images: [
      {
        url: "/images/og-hero.png",
        width: 1200,
        height: 630,
        alt: "Contact Agro-chain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Agro-chain | Get in Touch",
    description:
      "Have a question or need support? We respond within 24 hours on business days.",
    images: ["/images/og-hero.png"],
  },
};

export default function ContactPage() {
  return (
    <div className="layout-max-width">
      {/* Section 1 - Hero */}
      <section
        aria-label="Contact Hero"
        className="border-gray-border bg-green-tint border-b"
      >
        <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
          <div className="max-w-2xl">
            <span className="font-ubuntu text-theme-green-dark text-xs font-semibold tracking-widest uppercase">
              Get In Touch
            </span>
            <h1 className="font-ubuntu text-heading-colour mt-4 text-3xl font-bold lg:text-5xl">
              Get in Touch
            </h1>
            <p className="font-roboto-slab text-text-colour mt-4 text-lg">
              Have a question, partnership inquiry, or need support? We&apos;re
              here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 - Contact Options */}
      <section aria-label="Contact Options" className="bg-white">
        <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <a
              href="https://wa.me/2347012288798"
              target="_blank"
              rel="noopener noreferrer"
              className="border-gray-border flex flex-col items-center gap-4 rounded-2xl border p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="bg-green-tint flex h-12 w-12 items-center justify-center rounded-xl">
                <MessageSquare className="text-theme-green-dark h-6 w-6" />
              </div>
              <h3 className="font-ubuntu text-heading-colour font-semibold">
                WhatsApp
              </h3>
              <p className="font-roboto-slab text-text-colour text-sm">
                +234 701 228 8798
                <br />
                Fastest response
              </p>
            </a>

            <a
              href="mailto:shownzy001@gmail.com"
              className="border-gray-border flex flex-col items-center gap-4 rounded-2xl border p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="bg-green-tint flex h-12 w-12 items-center justify-center rounded-xl">
                <Mail className="text-theme-green-dark h-6 w-6" />
              </div>
              <h3 className="font-ubuntu text-heading-colour font-semibold">
                Email
              </h3>
              <p className="font-roboto-slab text-text-colour text-sm">
                shownzy001@gmail.com
                <br />
                Reply within 24 hours
              </p>
            </a>

            <a
              href="tel:+2347012288798"
              className="border-gray-border flex flex-col items-center gap-4 rounded-2xl border p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="bg-green-tint flex h-12 w-12 items-center justify-center rounded-xl">
                <Phone className="text-theme-green-dark h-6 w-6" />
              </div>
              <h3 className="font-ubuntu text-heading-colour font-semibold">
                Phone
              </h3>
              <p className="font-roboto-slab text-text-colour text-sm">
                +234 701 228 8798
                <br />
                Mon–Fri, 9am–5pm WAT
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Section 3 - Contact Form */}
      <ContactFormSection />

      {/* Section 4 - Office Info */}
      <section aria-label="Office Information" className="bg-gray-bg">
        <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
          <h2 className="font-ubuntu text-heading-colour mb-8 text-2xl font-bold lg:text-3xl">
            Find us here.
          </h2>
          <div className="flex flex-col gap-4">
            <div className="font-roboto-slab text-text-colour flex items-center gap-3">
              <MapPin className="text-theme-green-dark h-5 w-5 shrink-0" />
              <span>Kaduna, Nigeria</span>
            </div>
            <div className="font-roboto-slab text-text-colour flex items-center gap-3">
              <Clock className="text-theme-green-dark h-5 w-5 shrink-0" />
              <span>Monday – Friday, 9:00 AM – 5:00 PM WAT</span>
            </div>
            <div className="font-roboto-slab text-text-colour flex items-center gap-3">
              <Globe className="text-theme-green-dark h-5 w-5 shrink-0" />
              <span>agro-chain.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Social Links */}
      <section
        aria-label="Social Links"
        className="border-gray-border border-b bg-white"
      >
        <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
          <h2 className="font-ubuntu text-heading-colour mb-6 text-xl font-semibold">
            Follow us
          </h2>
          <ul className="flex flex-wrap items-center gap-4">
            {socialLinks.map(({ label, href, icon: Icon, color }) => (
              <li key={href}>
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-ubuntu text-text-colour flex items-center gap-2 text-sm transition ${color}`}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SectionFAQ
        faqs={contactFaqs}
        heading="Common questions before you reach out."
        subtext="Most answers are here. If not, we're one message away."
        ctaLabel="WhatsApp us"
        ctaHref="https://wa.me/2347012288798"
      />
    </div>
  );
}
