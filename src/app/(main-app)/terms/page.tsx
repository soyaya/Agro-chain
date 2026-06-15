"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertCircle,
  Scale,
} from "lucide-react";
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/"
            className="font-roboto-slab text-text-colour hover:text-heading-colour mb-8 inline-flex items-center gap-2 text-sm transition-colors"
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
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Scale size={32} className="text-blue-600" />
          </div>
          <h1 className="font-ubuntu text-heading-colour mb-4 text-4xl font-bold lg:text-5xl">
            Terms of Service
          </h1>
          <p className="font-roboto-slab text-text-colour">
            Last updated: March 10, 2026
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={SLIDE_UP_VARIANT}
          className="rounded-2xl bg-(--white) p-8 shadow-lg lg:p-12"
        >
          <div className="prose prose-gray max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="font-ubuntu text-heading-colour mb-4 text-2xl font-bold">
                Agreement to Terms
              </h2>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                By accessing and using AgroChain, you accept and agree to be
                bound by the terms and provision of this agreement. If you do
                not agree to these terms, please do not use our platform.
              </p>
            </section>

            {/* Use of Platform */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-green-tint flex h-10 w-10 items-center justify-center rounded-lg">
                  <CheckCircle size={20} className="text-theme-green-dark" />
                </div>
                <h2 className="font-ubuntu text-heading-colour text-2xl font-bold">
                  Use of Platform
                </h2>
              </div>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                You agree to use AgroChain only for lawful purposes and in
                accordance with these Terms. You agree not to:
              </p>
              <ul className="font-roboto-slab text-text-colour-2 ml-4 list-inside list-disc space-y-2">
                <li>
                  Use the platform in any way that violates any applicable law
                  or regulation
                </li>
                <li>
                  Engage in any conduct that restricts or inhibits anyone&apos;s
                  use of the platform
                </li>
                <li>
                  Impersonate or attempt to impersonate another user or person
                </li>
                <li>
                  Use the platform to transmit any advertising or promotional
                  material
                </li>
                <li>
                  Interfere with or disrupt the platform or servers or networks
                </li>
                <li>
                  Attempt to gain unauthorized access to any portion of the
                  platform
                </li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <FileText size={20} className="text-purple-600" />
                </div>
                <h2 className="font-ubuntu text-heading-colour text-2xl font-bold">
                  User Accounts
                </h2>
              </div>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                When you create an account with us, you must provide accurate,
                complete, and current information. You are responsible for:
              </p>
              <ul className="font-roboto-slab text-text-colour-2 ml-4 list-inside list-disc space-y-2">
                <li>
                  Maintaining the confidentiality of your account and password
                </li>
                <li>Restricting access to your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            {/* Transactions */}
            <section className="mb-8">
              <h2 className="font-ubuntu text-heading-colour mb-4 text-2xl font-bold">
                Transactions and Payments
              </h2>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                All transactions conducted through AgroChain are subject to the
                following terms:
              </p>
              <ul className="font-roboto-slab text-text-colour-2 ml-4 list-inside list-disc space-y-2">
                <li>Prices are subject to change without notice</li>
                <li>Payment must be made in full before delivery</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Refunds are subject to our refund policy</li>
                <li>You are responsible for any applicable taxes</li>
              </ul>
            </section>

            {/* Farmer and Buyer Responsibilities */}
            <section className="mb-8">
              <h2 className="font-ubuntu text-heading-colour mb-4 text-2xl font-bold">
                Farmer and Buyer Responsibilities
              </h2>

              <h3 className="font-ubuntu text-heading-colour mt-6 mb-3 text-xl font-semibold">
                Farmers
              </h3>
              <ul className="font-roboto-slab text-text-colour-2 ml-4 list-inside list-disc space-y-2">
                <li>
                  Provide accurate information about products and availability
                </li>
                <li>Ensure product quality meets stated standards</li>
                <li>Fulfill orders in a timely manner</li>
                <li>Maintain proper documentation and certifications</li>
              </ul>

              <h3 className="font-ubuntu text-heading-colour mt-6 mb-3 text-xl font-semibold">
                Buyers
              </h3>
              <ul className="font-roboto-slab text-text-colour-2 ml-4 list-inside list-disc space-y-2">
                <li>Make payments promptly as agreed</li>
                <li>Provide accurate delivery information</li>
                <li>Inspect products upon delivery</li>
                <li>Report any issues within the specified timeframe</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <AlertCircle size={20} className="text-error-red" />
                </div>
                <h2 className="font-ubuntu text-heading-colour text-2xl font-bold">
                  Limitation of Liability
                </h2>
              </div>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                AgroChain acts as a marketplace platform connecting farmers and
                buyers. We are not responsible for:
              </p>
              <ul className="font-roboto-slab text-text-colour-2 ml-4 list-inside list-disc space-y-2">
                <li>The quality, safety, or legality of products listed</li>
                <li>The accuracy of listings or user information</li>
                <li>The ability of farmers to complete transactions</li>
                <li>The ability of buyers to pay for products</li>
                <li>Disputes between users</li>
              </ul>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="font-ubuntu text-heading-colour mb-4 text-2xl font-bold">
                Termination
              </h2>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                We may terminate or suspend your account and access to the
                platform immediately, without prior notice or liability, for any
                reason, including breach of these Terms. Upon termination, your
                right to use the platform will immediately cease.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="font-ubuntu text-heading-colour mb-4 text-2xl font-bold">
                Changes to Terms
              </h2>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                We reserve the right to modify or replace these Terms at any
                time. We will provide notice of any material changes by posting
                the new Terms on this page. Your continued use of the platform
                after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Contact Us */}
            <section className="mb-8">
              <h2 className="font-ubuntu text-heading-colour mb-4 text-2xl font-bold">
                Contact Us
              </h2>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <div className="border-gray-border bg-gray-bg rounded-lg border p-6">
                <p className="font-roboto-slab text-text-colour-2">
                  <strong>Email:</strong> legal@agrochain.com
                </p>
                <p className="font-roboto-slab text-text-colour-2 mt-2">
                  <strong>Phone:</strong> +234 800 000 0000
                </p>
              </div>
            </section>
          </div>
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
              className="font-roboto-slab text-text-colour hover:text-heading-colour text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-muted-text">•</span>
            <Link
              href="/support"
              className="font-roboto-slab text-text-colour hover:text-heading-colour text-sm transition-colors"
            >
              Support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
