"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Truck,
  AlertTriangle,
  Wallet,
  Scale,
  Siren,
  Gavel,
} from "lucide-react";
import { FADE_IN_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
      <div className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-8">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link
            href="/"
            className="font-roboto-slab mb-8 inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={FADE_IN_VARIANT} className="mb-12 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <ShieldCheck size={32} className="text-green-600" />
          </div>
          <h1 className="font-ubuntu mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">Platform Policy</h1>
          <p className="font-roboto-slab text-gray-600">Last updated: October 7, 2026</p>
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
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                This Platform Policy explains how AgroChain protects payments, assigns responsibility for
                delivery, and handles claims of theft, fraud, or lost funds on the marketplace. It works
                alongside, and does not replace, our{" "}
                <Link href="/terms" className="text-green-700 underline">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-green-700 underline">
                  Privacy Policy
                </Link>
                . Where this page and those documents overlap, the Terms of Use govern.
              </p>
            </section>

            {/* Role of AgroChain */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Scale size={20} className="text-blue-600" />
                </div>
                <h2 className="font-ubuntu text-2xl font-bold text-gray-900">Our Role as a Marketplace</h2>
              </div>
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                AgroChain is a marketplace and payment-facilitation platform connecting cluster farmers,
                buyers, and independent delivery riders. We are not the seller of any fish or feed listed on
                the platform, and we are not a party to the underlying sale between a farmer and a buyer. We
                provide the escrow, verification, and logistics-coordination infrastructure that makes the
                transaction possible, and we act on the facts available to us (listing records, wallet
                ledgers, OTP verification logs, and delivery evidence) when resolving a dispute.
              </p>
            </section>

            {/* Escrow & Payment Protection */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Wallet size={20} className="text-green-600" />
                </div>
                <h2 className="font-ubuntu text-2xl font-bold text-gray-900">Escrow & Payment Protection</h2>
              </div>
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                A buyer's payment is held in escrow from checkout until delivery is confirmed — it is not
                released to the seller on payment alone. Specifically:
              </p>
              <ul className="font-roboto-slab ml-4 list-inside list-disc space-y-2 text-gray-700">
                <li>Funds are released to the farmer or cluster farmer only after the buyer confirms receipt, or after an unresolved delivery dispute is closed in the seller's favor following our review.</li>
                <li>AgroChain's margin, delivery fee splits, and any cluster incentive are calculated and recorded automatically at settlement — never estimated or negotiated after the fact.</li>
                <li>Wallets are provisioned and funds moved through our licensed payment partners (currently AutoRamp and Pulse MFB). We are not liable for delays, reversals, or errors that originate on a payment partner's own systems and are outside our control, but we will assist you in escalating such issues to the partner.</li>
                <li>A buyer who pays into the wrong account, or sends funds outside the platform's checkout flow (e.g. directly to a seller's personal bank account), forfeits the protection of escrow — AgroChain cannot reverse or guarantee a transaction it did not process.</li>
              </ul>
            </section>

            {/* Delivery & Risk of Loss */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <Truck size={20} className="text-amber-600" />
                </div>
                <h2 className="font-ubuntu text-2xl font-bold text-gray-900">Delivery & Risk of Loss</h2>
              </div>
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                Every order moves through a recorded fulfillment chain — dispatch, cluster handoff (where
                applicable), pickup or rider delivery, and buyer confirmation — with photo evidence captured
                at each handoff point. This chain-of-custody record is the primary evidence used to resolve
                any delivery dispute.
              </p>
              <ul className="font-roboto-slab ml-4 list-inside list-disc space-y-2 text-gray-700">
                <li>Risk of loss or damage in transit sits with whichever party is in physical possession of the goods at that point in the chain, as evidenced by the recorded handoff — not automatically with the buyer or the seller.</li>
                <li>Buyers are expected to inspect goods at the point of pickup or delivery and raise an issue immediately, before confirming receipt. Confirming receipt closes the delivery stage and releases escrow; disputes raised after confirmation are reviewed at our discretion and are harder to substantiate without the original handoff evidence.</li>
                <li>Riders delivering on the platform act as independent contractors, not AgroChain employees. We vet and approve riders through the relevant cluster farmer before they can accept deliveries, and we investigate every loss-in-transit claim against the recorded evidence, but we do not guarantee the conduct of any individual rider beyond that vetting and evidence trail.</li>
                <li>A pickup-fulfillment order (no rider involved) transfers risk to the buyer at the moment of pickup confirmation at the collection point.</li>
              </ul>
            </section>

            {/* Theft, Fraud & Account Security */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <Siren size={20} className="text-(--error-red)" />
                </div>
                <h2 className="font-ubuntu text-2xl font-bold text-gray-900">Theft, Fraud & Account Security</h2>
              </div>
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                Every account on AgroChain is protected by OTP-verified login and, for identity-sensitive
                actions (wallet activation, BVN/CAC verification), a separate verification step with our
                payment partners. You are responsible for keeping your login credentials, OTPs, and device
                access private — AgroChain staff will never ask you for your OTP or password.
              </p>
              <ul className="font-roboto-slab ml-4 list-inside list-disc space-y-2 text-gray-700">
                <li>Report a suspected compromised account, unauthorized transaction, or impersonation attempt to us immediately through Support — the faster a claim is reported, the more effectively we can freeze the affected wallet and investigate before funds move further.</li>
                <li>We actively monitor for fraudulent listings, fake delivery confirmations, and wallet abuse, and we reserve the right to freeze a wallet, suspend a listing, or suspend an account pending investigation of any such report, without prior notice, to protect other users on the platform.</li>
                <li>AgroChain is not liable for losses that result from a user voluntarily sharing their login credentials or OTP with a third party, or from a user transacting outside the platform's verified checkout and escrow flow.</li>
              </ul>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <AlertTriangle size={20} className="text-purple-600" />
                </div>
                <h2 className="font-ubuntu text-2xl font-bold text-gray-900">Dispute Resolution</h2>
              </div>
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                If a delivery, payment, or quality issue arises, contact Support with your order ID as soon
                as possible. We review the wallet ledger, OTP/verification logs, and delivery evidence tied
                to that order, and may request additional information from either party. Our decision on
                whether to release, withhold, or refund escrowed funds is made in good faith based on that
                evidence and is final for the purposes of the platform, without prejudice to either party's
                independent legal rights.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <Lock size={20} className="text-(--error-red)" />
                </div>
                <h2 className="font-ubuntu text-2xl font-bold text-gray-900">Limitation of Liability</h2>
              </div>
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                To the fullest extent permitted by applicable Nigerian law, AgroChain's total liability to
                any user arising from a single transaction is limited to the amount actually held in escrow
                for that transaction. We are not liable for indirect, incidental, or consequential losses
                (including lost profits or business opportunity), for events outside our reasonable control
                (including a payment partner's system failure, network/telecom outage, or an act of a third
                party we do not employ, such as a rider or another user), or for losses arising from a user's
                own breach of this Policy or our Terms of Use.
              </p>
            </section>

            {/* Indemnification */}
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Gavel size={20} className="text-slate-600" />
                </div>
                <h2 className="font-ubuntu text-2xl font-bold text-gray-900">Indemnification</h2>
              </div>
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                You agree to indemnify and hold AgroChain, its officers, and staff harmless from any claim,
                loss, or liability arising from your use of the platform, your listings, your breach of this
                Policy or our Terms of Use, or your violation of any applicable law.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="font-ubuntu mb-4 text-2xl font-bold text-gray-900">Report an Issue</h2>
              <p className="font-roboto-slab mb-4 leading-relaxed text-gray-700">
                For a suspected security issue, lost funds, or a delivery dispute, contact us with your
                order or wallet reference as soon as you notice it:
              </p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <p className="font-roboto-slab text-gray-700">
                  <strong>Email:</strong> support@agrochain.com.ng
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
            <Link href="/terms" className="font-roboto-slab text-sm text-gray-600 transition-colors hover:text-gray-900">
              Terms of Service
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/privacy" className="font-roboto-slab text-sm text-gray-600 transition-colors hover:text-gray-900">
              Privacy Policy
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/support" className="font-roboto-slab text-sm text-gray-600 transition-colors hover:text-gray-900">
              Support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
