"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  Book,
  Users,
  ChevronDown,
} from "lucide-react";
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";

type SupportOption = {
  icon: typeof MessageCircle;
  title: string;
  description: string;
  action: string;
  color: "blue" | "green" | "purple";
  href: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

export default function SupportPage() {
  const supportOptions: SupportOption[] = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      action: "Start Chat",
      color: "green",
      href: "https://wa.me/2347012288798",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we&apos;ll respond within 24 hours",
      action: "shownzy001@gmail.com",
      color: "green",
      href: "mailto:shownzy001@gmail.com",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us Monday to Friday, 9am - 5pm WAT",
      action: "+234 701 228 8798",
      color: "purple",
      href: "tel:+2347012288798",
    },
  ];

  const faqs: FaqItem[] = [
    {
      question: "How do I create an account?",
      answer:
        "Click on &apos;Get Started&apos; on the homepage and follow the registration process. You&apos;ll need to provide your basic information and choose whether you&apos;re registering as a farmer or buyer.",
    },
    {
      question: "How do I list my products as a farmer?",
      answer:
        "After logging in to your farmer dashboard, navigate to &apos;Listings&apos; and click &apos;Create New Listing&apos;. Fill in the product details, pricing, and availability information.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept bank transfers, card payments, and mobile money. All payments are processed securely through our payment partners.",
    },
    {
      question: "How does delivery work?",
      answer:
        "Delivery options vary by seller. Some cluster farmers offer their own logistics, while others may require buyers to arrange pickup. Details are shown on each listing.",
    },
    {
      question: "What if I have an issue with my order?",
      answer:
        "Contact our support team immediately through any of the channels above. We&apos;ll work with both parties to resolve the issue fairly.",
    },
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const resources = [
    {
      icon: Book,
      title: "User Guide",
      description: "Comprehensive guide to using AgroChain",
    },
    {
      icon: HelpCircle,
      title: "FAQs",
      description: "Answers to commonly asked questions",
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Connect with other users and share experiences",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/"
            className="font-roboto-slab mb-8 inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={FADE_IN_VARIANT}
          className="mb-12 text-center"
        >
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <HelpCircle size={32} className="text-green-600" />
          </div>
          <h1 className="font-ubuntu mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            How Can We Help?
          </h1>
          <p className="font-roboto-slab mx-auto max-w-2xl text-gray-600">
            We&apos;re here to assist you. Choose your preferred way to get in touch with our
            support team.
          </p>
        </motion.div>

        {/* Support Options */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER_VARIANT}
          className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            const colorClasses = {
              blue: "bg-blue-100 text-blue-600",
              green: "bg-green-100 text-green-600",
              purple: "bg-purple-100 text-purple-600",
            };

            return (
              <motion.a
                key={index}
                variants={SLIDE_UP_VARIANT}
                href={option.href}
                target={option.href.startsWith("http") ? "_blank" : undefined}
                rel={option.href.startsWith("http") ? "noreferrer" : undefined}
                className="block rounded-2xl bg-(--white) p-6 shadow-lg transition-shadow hover:shadow-xl"
              >
                <div
                  className={`h-12 w-12 rounded-lg ${colorClasses[option.color as keyof typeof colorClasses]} mb-4 flex items-center justify-center`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="font-ubuntu mb-2 text-xl font-bold text-gray-900">{option.title}</h3>
                <p className="font-roboto-slab mb-4 text-gray-600">{option.description}</p>
                <div className="flex items-center justify-between">
                  <p className="font-roboto-slab text-sm font-medium text-gray-900">
                    {option.action}
                  </p>
                  <ArrowRight size={16} className="text-gray-900" />
                </div>
              </motion.a>
            );
          })}
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={SLIDE_UP_VARIANT}
          className="mb-16 rounded-2xl bg-(--white) p-8 shadow-lg lg:p-12"
        >
          <h2 className="font-ubuntu mb-8 text-center text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              const displayIndex = String(index + 1).padStart(2, "0");

              return (
                <div key={faq.question} className="border-b border-gray-200 pb-6 last:border-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-ubuntu text-lg font-semibold text-gray-500">
                        {displayIndex}
                      </span>
                      <span className="font-ubuntu text-lg font-semibold text-gray-900">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-600 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="font-roboto-slab mt-3 leading-relaxed text-gray-700">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={SLIDE_UP_VARIANT}
          className="mb-16"
        >
          <h2 className="font-ubuntu mb-8 text-center text-3xl font-bold text-gray-900">
            Helpful Resources
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <div
                  key={index}
                  className="cursor-pointer rounded-xl bg-(--white) p-6 shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Icon size={20} className="text-gray-600" />
                  </div>
                  <h3 className="font-ubuntu mb-2 text-lg font-semibold text-gray-900">
                    {resource.title}
                  </h3>
                  <p className="font-roboto-slab text-sm text-gray-600">{resource.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Contact Form CTA */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={FADE_IN_VARIANT}
          className="rounded-2xl bg-linear-to-r from-green-600 to-green-700 p-8 text-center shadow-xl lg:p-12"
        >
          <h2 className="font-ubuntu mb-4 text-3xl font-bold text-white">Still Need Help?</h2>
          <p className="font-roboto-slab mx-auto mb-6 max-w-2xl text-green-50">
            Our support team is ready to assist you with any questions or concerns you may have.
          </p>
          <button className="font-roboto-slab rounded-lg bg-(--white) px-8 py-3 font-semibold text-green-600 transition-colors hover:bg-green-50">
            Contact Support
          </button>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-6">
            <Link
              href="/privacy"
              className="font-roboto-slab text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href="/terms"
              className="font-roboto-slab text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
