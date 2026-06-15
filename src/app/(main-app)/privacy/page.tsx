"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react";
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

export default function PrivacyPage() {
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
          <div className="bg-green-tint mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full">
            <Shield size={32} className="text-theme-green-dark" />
          </div>
          <h1 className="font-ubuntu text-heading-colour mb-4 text-4xl font-bold lg:text-5xl">
            Privacy Policy
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
                Introduction
              </h2>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                Welcome to AgroChain. We respect your privacy and are committed
                to protecting your personal data. This privacy policy will
                inform you about how we look after your personal data when you
                visit our platform and tell you about your privacy rights and
                how the law protects you.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <h2 className="font-ubuntu text-heading-colour text-2xl font-bold">
                  Information We Collect
                </h2>
              </div>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                We collect and process the following types of information:
              </p>
              <ul className="font-roboto-slab text-text-colour-2 ml-4 list-inside list-disc space-y-2">
                <li>
                  Personal identification information (name, email, phone
                  number)
                </li>
                <li>
                  Business information (farm details, company name, business
                  type)
                </li>
                <li>
                  Location data (state, local government area, delivery address)
                </li>
                <li>Transaction data (orders, payments, listings)</li>
                <li>
                  Technical data (IP address, browser type, device information)
                </li>
                <li>Usage data (how you interact with our platform)</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Eye size={20} className="text-purple-600" />
                </div>
                <h2 className="font-ubuntu text-heading-colour text-2xl font-bold">
                  How We Use Your Information
                </h2>
              </div>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                We use your personal data for the following purposes:
              </p>
              <ul className="font-roboto-slab text-text-colour-2 ml-4 list-inside list-disc space-y-2">
                <li>To register you as a new user and manage your account</li>
                <li>To process and deliver your orders</li>
                <li>To manage payments, fees, and charges</li>
                <li>
                  To communicate with you about your account and transactions
                </li>
                <li>To improve our platform and services</li>
                <li>To ensure platform security and prevent fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-green-tint flex h-10 w-10 items-center justify-center rounded-lg">
                  <Lock size={20} className="text-theme-green-dark" />
                </div>
                <h2 className="font-ubuntu text-heading-colour text-2xl font-bold">
                  Data Security
                </h2>
              </div>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                We have implemented appropriate security measures to prevent
                your personal data from being accidentally lost, used, or
                accessed in an unauthorized way. We limit access to your
                personal data to those employees, agents, contractors, and other
                third parties who have a business need to know.
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="font-ubuntu text-heading-colour mb-4 text-2xl font-bold">
                Your Rights
              </h2>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                Under data protection laws, you have rights including:
              </p>
              <ul className="font-roboto-slab text-text-colour-2 ml-4 list-inside list-disc space-y-2">
                <li>The right to access your personal data</li>
                <li>The right to correct inaccurate data</li>
                <li>The right to request deletion of your data</li>
                <li>The right to object to processing of your data</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
            </section>

            {/* Contact Us */}
            <section className="mb-8">
              <h2 className="font-ubuntu text-heading-colour mb-4 text-2xl font-bold">
                Contact Us
              </h2>
              <p className="font-roboto-slab text-text-colour-2 mb-4 leading-relaxed">
                If you have any questions about this privacy policy or our
                privacy practices, please contact us at:
              </p>
              <div className="border-gray-border bg-gray-bg rounded-lg border p-6">
                <p className="font-roboto-slab text-text-colour-2">
                  <strong>Email:</strong> privacy@agrochain.com
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
              href="/terms"
              className="font-roboto-slab text-text-colour hover:text-heading-colour text-sm transition-colors"
            >
              Terms of Service
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
