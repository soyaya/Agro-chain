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
    canonical: "https://agro-chain-bom-vercel.vercel.app/contact",
  },
  openGraph: {
    type: "website",
    url: "https://agro-chain-bom-vercel.vercel.app/contact",
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
      <section aria-label="Contact Hero" className="bg-green-50 border-b border-gray-border">
        <div className="content-width px-4 py-20 lg:px-25 lg:py-28">
          <div className="max-w-2xl">
            <span className="font-ubuntu text-xs font-semibold tracking-widest text-theme-green-dark uppercase">
              Get In Touch
            </span>
            <h1 className="font-ubuntu mt-4 text-3xl font-bold text-heading-colour lg:text-5xl">
              Get in Touch
            </h1>
            <p className="font-roboto-slab mt-4 text-lg text-text-colour">
              Have a question, partnership inquiry, or need support? We&apos;re here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 - Contact Options */}
      <section aria-label="Contact Options" className="bg-white">
        <div className="content-width px-4 py-16 lg:px-25 lg:py-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <a
              href="https://wa.me/2347012288798"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-4 rounded-2xl border border-gray-border p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <MessageSquare className="h-6 w-6 text-theme-green-dark" />
              </div>
              <h3 className="font-ubuntu font-semibold text-heading-colour">WhatsApp</h3>
              <p className="font-roboto-slab text-sm text-text-colour">
                +234 701 228 8798
                <br />
                Fastest response
              </p>
            </a>

            <a
              href="mailto:shownzy001@gmail.com"
              className="flex flex-col items-center gap-4 rounded-2xl border border-gray-border p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <Mail className="h-6 w-6 text-theme-green-dark" />
              </div>
              <h3 className="font-ubuntu font-semibold text-heading-colour">Email</h3>
              <p className="font-roboto-slab text-sm text-text-colour">
                shownzy001@gmail.com
                <br />
                Reply within 24 hours
              </p>
            </a>

            <a
              href="tel:+2347012288798"
              className="flex flex-col items-center gap-4 rounded-2xl border border-gray-border p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <Phone className="h-6 w-6 text-theme-green-dark" />
              </div>
              <h3 className="font-ubuntu font-semibold text-heading-colour">Phone</h3>
              <p className="font-roboto-slab text-sm text-text-colour">
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
        <div className="content-width px-4 py-16 lg:px-25 lg:py-20">
          <h2 className="font-ubuntu mb-8 text-2xl font-bold text-heading-colour lg:text-3xl">
            Find us here.
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 font-roboto-slab text-text-colour">
              <MapPin className="h-5 w-5 shrink-0 text-theme-green-dark" />
              <span>Kaduna, Nigeria</span>
            </div>
            <div className="flex items-center gap-3 font-roboto-slab text-text-colour">
              <Clock className="h-5 w-5 shrink-0 text-theme-green-dark" />
              <span>Monday – Friday, 9:00 AM – 5:00 PM WAT</span>
            </div>
            <div className="flex items-center gap-3 font-roboto-slab text-text-colour">
              <Globe className="h-5 w-5 shrink-0 text-theme-green-dark" />
              <span>agro-chain.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Social Links */}
      <section aria-label="Social Links" className="bg-white border-b border-gray-border">
        <div className="content-width px-4 py-12 lg:px-25">
          <h2 className="font-ubuntu mb-6 text-xl font-semibold text-heading-colour">
            Follow us
          </h2>
          <ul className="flex flex-wrap items-center gap-4">
            {socialLinks.map(({ label, href, icon: Icon, color }) => (
              <li key={href}>
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 font-ubuntu text-sm text-text-colour transition ${color}`}
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
