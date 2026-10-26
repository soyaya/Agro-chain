"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Trash2, Mail, Clock } from "lucide-react";
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
      <div className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-8">
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
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Trash2 size={32} className="text-red-600" />
          </div>
          <h1 className="font-ubuntu mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Data Deletion Instructions
          </h1>
          <p className="font-roboto-slab text-gray-600">Last updated: October 15, 2026</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={SLIDE_UP_VARIANT}
          className="rounded-2xl bg-(--white) p-8 shadow-lg lg:p-12"
        >
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                You can request deletion of any personal data Agro-chain holds about you, including
                data collected through our website, our Facebook Page, Messenger, or WhatsApp
                Business integrations.
              </p>
            </section>

            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <h2 className="font-ubuntu text-2xl font-bold text-gray-900">
                  How to Request Deletion
                </h2>
              </div>
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                Send an email to <strong>privacy@agrochain.com</strong> with the subject line
                &quot;Data Deletion Request&quot;, including:
              </p>
              <ul className="font-roboto-slab ml-4 list-inside list-disc space-y-2 text-gray-700">
                <li>Your full name</li>
                <li>The email address, phone number, or Facebook/WhatsApp contact you used with us</li>
                <li>Confirmation that you want all associated personal data deleted</li>
              </ul>
              <p className="font-roboto-slab mt-4 leading-relaxed text-gray-700">
                Alternatively, if you reached us through Facebook Messenger or WhatsApp, you can send
                a message to that same conversation asking us to delete your data, and reference this
                page.
              </p>
            </section>

            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Clock size={20} className="text-green-600" />
                </div>
                <h2 className="font-ubuntu text-2xl font-bold text-gray-900">What Happens Next</h2>
              </div>
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                We will confirm your request and delete your personal data within 30 days, except
                where we are required by law to retain certain records (for example, transaction
                records needed for tax or regulatory compliance). We will tell you if any data must
                be retained and why.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-ubuntu mb-4 text-2xl font-bold text-gray-900">Contact Us</h2>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <p className="font-roboto-slab text-gray-700">
                  <strong>Email:</strong> privacy@agrochain.com
                </p>
                <p className="font-roboto-slab mt-2 text-gray-700">
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
