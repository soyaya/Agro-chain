"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, ChevronDown } from "lucide-react";
import {
  FADE_IN_VARIANT,
  STAGGER_CONTAINER_VARIANT,
  SLIDE_UP_VARIANT,
} from "~/types/constants";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubjectSelect(subject: Subject) {
    setForm((prev) => ({ ...prev, subject }));
    setDropdownOpen(false);
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
      <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
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
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1,
                  }}
                >
                  <CheckCircle2 className="text-theme-green-dark h-16 w-16" />
                </motion.div>
                <h2 className="font-ubuntu text-heading-colour text-2xl font-bold">
                  Message sent!
                </h2>
                <p className="font-roboto-slab text-text-colour">
                  We&apos;ll get back to you within 24 hours on business days.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="font-ubuntu text-theme-green-dark mt-2 cursor-default text-sm font-medium underline underline-offset-4 transition-all duration-300 ease-in-out hover:cursor-pointer hover:opacity-75"
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
                  className="font-ubuntu text-heading-colour mb-8 text-2xl font-bold lg:text-3xl"
                >
                  Send us a message.
                </motion.h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <motion.div
                    variants={SLIDE_UP_VARIANT}
                    className="flex flex-col gap-1.5"
                  >
                    <label
                      className="font-ubuntu text-heading-colour text-sm font-medium"
                      htmlFor="fullName"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={form.fullName}
                      onChange={handleChange}
                      className="border-input-border font-roboto-slab text-heading-colour placeholder:text-text-input focus:border-theme-green-dark rounded-2xl border bg-white px-4 py-3 text-sm focus:outline-none"
                      placeholder="Your full name"
                    />
                  </motion.div>

                  <motion.div
                    variants={SLIDE_UP_VARIANT}
                    className="flex flex-col gap-1.5"
                  >
                    <label
                      className="font-ubuntu text-heading-colour text-sm font-medium"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="border-input-border font-roboto-slab text-heading-colour placeholder:text-text-input focus:border-theme-green-dark rounded-2xl border bg-white px-4 py-3 text-sm focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </motion.div>

                  <motion.div
                    variants={SLIDE_UP_VARIANT}
                    className="relative z-10 flex flex-col gap-1.5"
                  >
                    <label className="font-ubuntu text-heading-colour text-sm font-medium">
                      Subject
                    </label>
                    <div ref={dropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className={`font-roboto-slab flex w-full cursor-default items-center justify-between rounded-2xl border bg-white px-4 py-3 text-sm transition-all duration-300 ease-in-out hover:cursor-pointer focus:outline-none ${
                          dropdownOpen
                            ? "border-theme-green-dark"
                            : "border-input-border"
                        } ${form.subject ? "text-heading-colour" : "text-text-input"}`}
                      >
                        <span>{form.subject || "Select a subject"}</span>
                        <motion.span
                          animate={{ rotate: dropdownOpen ? 180 : 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <ChevronDown className="text-text-input h-4 w-4" />
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                            exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
                            transition={{
                              duration: 0.18,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            style={{ transformOrigin: "top" }}
                            className="border-input-border absolute top-[calc(100%+6px)] right-0 left-0 z-20 overflow-hidden rounded-2xl border bg-white shadow-lg"
                          >
                            {subjects.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleSubjectSelect(s)}
                                className={`font-roboto-slab hover:bg-gray-bg w-full cursor-default px-4 py-3 text-left text-sm transition-all duration-300 ease-in-out hover:cursor-pointer ${
                                  form.subject === s
                                    ? "text-theme-green-dark font-medium"
                                    : "text-heading-colour"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={SLIDE_UP_VARIANT}
                    className="flex flex-col gap-1.5"
                  >
                    <label
                      className="font-ubuntu text-heading-colour text-sm font-medium"
                      htmlFor="message"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      className="border-input-border font-roboto-slab text-heading-colour placeholder:text-text-input focus:border-theme-green-dark rounded-2xl border bg-white px-4 py-3 text-sm focus:outline-none"
                      placeholder="How can we help you?"
                    />
                  </motion.div>

                  <motion.button
                    variants={SLIDE_UP_VARIANT}
                    type="submit"
                    disabled={sending}
                    className="font-ubuntu bg-theme-green-dark hover:bg-theme-green-light cursor-default self-start rounded-full px-8 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:cursor-pointer disabled:opacity-60"
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
