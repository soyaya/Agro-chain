"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

const subjects = [
  "General Inquiry",
  "Partnership",
  "Farmer Support",
  "Buyer Support",
  "Technical Issue",
] as const;

type Subject = (typeof subjects)[number];

interface ContactFormData {
  fullName: string;
  email: string;
  subject: Subject | "";
  message: string;
}

export default function ContactFormSection() {
  const [form, setForm] = useState<ContactFormData>({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    console.log("Contact form submission:", form);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ fullName: "", email: "", subject: "", message: "" });
    setSending(false);
    setSent(true);
  }

  return (
    <section aria-label="Contact Form" className="bg-gray-bg">
      <div className="content-width px-4 py-16 lg:px-25 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-5 py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              >
                <CheckCircle2 className="h-16 w-16 text-theme-green-dark" />
              </motion.div>
              <h2 className="font-ubuntu text-2xl font-bold text-heading-colour">
                Message sent!
              </h2>
              <p className="font-roboto-slab text-text-colour">
                We'll get back to you within 24 hours on business days.
              </p>
              <button
                onClick={() => setSent(false)}
                className="font-ubuntu mt-2 text-sm font-medium text-theme-green-dark underline underline-offset-4 transition hover:opacity-75"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={STAGGER_CONTAINER_VARIANT}
              initial="hidden"
              animate="visible"
            >
          <motion.h2
            variants={FADE_IN_VARIANT}
            className="font-ubuntu mb-8 text-2xl font-bold text-heading-colour lg:text-3xl"
          >
            Send us a message.
          </motion.h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <motion.div variants={SLIDE_UP_VARIANT} className="flex flex-col gap-1.5">
              <label className="font-ubuntu text-sm font-medium text-heading-colour" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                className="rounded-2xl border border-input-border bg-white px-4 py-3 font-roboto-slab text-sm text-heading-colour placeholder:text-text-input focus:border-theme-green-dark focus:outline-none"
                placeholder="Your full name"
              />
            </motion.div>

            <motion.div variants={SLIDE_UP_VARIANT} className="flex flex-col gap-1.5">
              <label className="font-ubuntu text-sm font-medium text-heading-colour" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="rounded-2xl border border-input-border bg-white px-4 py-3 font-roboto-slab text-sm text-heading-colour placeholder:text-text-input focus:border-theme-green-dark focus:outline-none"
                placeholder="you@example.com"
              />
            </motion.div>

            <motion.div variants={SLIDE_UP_VARIANT} className="flex flex-col gap-1.5">
              <label className="font-ubuntu text-sm font-medium text-heading-colour" htmlFor="subject">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={form.subject}
                onChange={handleChange}
                className="rounded-2xl border border-input-border bg-white px-4 py-3 font-roboto-slab text-sm text-heading-colour focus:border-theme-green-dark focus:outline-none"
              >
                <option value="" disabled>
                  Select a subject
                </option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div variants={SLIDE_UP_VARIANT} className="flex flex-col gap-1.5">
              <label className="font-ubuntu text-sm font-medium text-heading-colour" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                className="rounded-2xl border border-input-border bg-white px-4 py-3 font-roboto-slab text-sm text-heading-colour placeholder:text-text-input focus:border-theme-green-dark focus:outline-none"
                placeholder="How can we help you?"
              />
            </motion.div>

            <motion.button
              variants={SLIDE_UP_VARIANT}
              type="submit"
              disabled={sending}
              className="font-ubuntu self-start rounded-full bg-theme-green-dark px-8 py-3 text-sm font-semibold text-white transition hover:bg-theme-green-light disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Message"}
            </motion.button>
          </form>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
