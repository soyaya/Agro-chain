"use client";

import Link from "next/link";
import AppLogo from "./AppLogo";
import type { NavLink } from "~/types/types";
import { PhoneIcon, MailIcon, MapPin } from "lucide-react";

import { socialLinks } from "~/models/models";

const devYear: number = 2024;
const currentYear: number = new Date().getFullYear();

import { navLinks } from "~/models/models";

const supportLinks: NavLink[] = [
  { label: "Help center", href: "/contact#help" },
  { label: "Feedback", href: "/contact#feedback" },
  { label: "Tweet Us", href: "/contact#tweet" },
];

const footer2Links: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy#privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Legal", href: "/privacy" },
  { label: "Site Map", href: "/" },
];

export default function Footer() {
  const displayYear = currentYear > devYear ? `${devYear} - ${currentYear}` : `${devYear}`;

  return (
    <footer className="font-openSans relative">
      <div className="mx-auto grid h-full w-full max-w-7xl gap-8 rounded-lg border-3 border-(--border-gray) px-(--section-px) sm:px-(--section-px-sm) lg:px-(--section-px-lg)">
        {/* Footer 1 */}
        <div className="grid w-full grid-cols-1 gap-8 pt-22 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:pt-28">
          {/* Logo Area */}
          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-2">
              {/* App Logo */}
              <Link href="/" className="flex items-center gap-2">
                <AppLogo />
                {/* <span className="text-2xl lg:text-3xl text-(--debridger-green-dark) font-bold">Debridger</span> */}
              </Link>

              <p className="text-(--text-colour)">Connecting Farms to Global Markets.</p>
            </div>

            {/* Social Links */}
            <ul className="flex items-center gap-3">
              {socialLinks.map(({ label, href, icon: Icon, color }) => {
                return (
                  <li key={href} className="group relative flex flex-col items-center">
                    {/* Label */}
                    <span
                      className={`absolute -top-6 rounded-md bg-(--white)/80 bg-red-900 px-2 py-0.5 text-xs text-black opacity-0 backdrop-blur-sm transition-all duration-300 ease-in-out group-hover:translate-y-[-2px] group-hover:opacity-100 dark:bg-(--black)/50 dark:text-white ${color?.replace("hover:", "")} `}
                    >
                      {label}
                    </span>

                    {/* Icon */}
                    <Link
                      href={href}
                      className={`text-black dark:text-white ${color} " transition-all duration-300 ease-in-out focus:text-(--black)`}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex w-full flex-col gap-4">
            <h4 className="text-xl font-semibold text-(--debridger-green-dark) lg:text-(--text-colour)">
              Quick Link
            </h4>

            <ul className="flex flex-col gap-2">
              {navLinks.map(({ label, href, icon: Icon }) => {
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-2 text-(--text-colour) transition-all duration-300 ease-in-out hover:text-(--heading-colour) focus:text-(--heading-colour) lg:text-lg"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support Links */}
          <div className="flex w-full flex-col gap-4">
            <h4 className="text-xl font-semibold text-(--debridger-green-dark) lg:text-(--text-colour)">
              Support
            </h4>

            <ul className="flex flex-col gap-2">
              {supportLinks.map(({ label, href, icon: Icon }) => {
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-2 text-(--text-colour) transition-all duration-300 ease-in-out hover:text-(--heading-colour) focus:text-(--heading-colour) lg:text-lg"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="flex w-full flex-col gap-4">
            <h4 className="text-xl font-semibold text-(--debridger-green-dark) lg:text-(--text-colour)">
              Contact Us
            </h4>

            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="tel:+2347012288798"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-(--text-colour) transition-all duration-300 ease-in-out hover:text-(--heading-colour) focus:text-(--heading-colour) lg:text-lg"
                >
                  <PhoneIcon className="h-4 w-4" />
                  +234(0)70 1228 8798
                </a>
              </li>

              <li>
                <a
                  href="mailto:shownzy001@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-(--text-colour) transition-all duration-300 ease-in-out hover:text-(--heading-colour) focus:text-(--heading-colour) lg:text-lg"
                >
                  <MailIcon className="h-4 w-4" />
                  shownzy001@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer 2 */}
        <div className="flex flex-col items-center justify-between gap-2 py-2 text-(--text-colour) lg:flex-row">
          <p className="flex items-center gap-1 text-sm lg:text-lg">
            <span>&copy; Copyright </span>
            <span>{displayYear}</span>
            <span>All Rights Reserved</span>
          </p>

          {/* Footer 2 Links: FAQs, Terms of Service and Privacy Policy */}
          <ul className="flex items-center gap-4">
            {footer2Links.map(({ label, href, icon: Icon }) => {
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm hover:text-(--heading-colour) focus:text-(--heading-color) lg:text-lg"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
}
