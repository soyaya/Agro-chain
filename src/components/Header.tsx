"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppLogo from "./AppLogo";
import { X, Menu, BellIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import SecondaryLink from "./LinkSecondary";
import PrimaryLink from "./LinkPrimary";
import { AnimatePresence, motion, Variants } from "framer-motion";

import { navLinks, sideNavLinks } from "~/models/models";

export default function Header() {
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Animation variants
  const sidebarVariants: Variants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      },
    },
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants: Variants = {
    open: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <header className="border-border/40 font-inter sticky top-0 left-0 z-50 w-full border-b bg-linear-to-b from-navbar-bg to-navbar-bg/10 backdrop-blur-sm supports-backdrop-filter:bg-navbar-bg/60">
        <div className="px-section-px sm:px-section-px-sm lg:px-section-px-lg mx-auto flex h-(--navbar-h) w-full max-w-7xl items-center justify-between gap-2">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <AppLogo />
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden items-center gap-2 lg:flex px-4 py-2">
            <ul className="flex items-center gap-2 rounded-full">
              {navLinks.map(({ label, href, icon: Icon }) => {
                const isActive = pathname == href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`font-inter flex items-center gap-2 px-4 py-2 transition-all duration-300 ease-in-out hover:opacity-90 ${
                        isActive
                          ? "bg-transparent text-white font-semibold"
                          : "text-white/80 font-medium hover:text-white"
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right: Icons */}
          <div className="relative flex items-center gap-1 text-white sm:gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </div>

          {/* Desktop Authentication Links */}
          <div className="relative hidden items-center gap-2 lg:flex">
            <SecondaryLink href="/login" label="Log In" className="border-white text-white" />

            <PrimaryLink href="/register" label="Get Started" />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-0 z-40 bg-(--black)/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar Content */}
            <motion.aside
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 left-0 z-50 h-full w-full transform bg-(--white) shadow-lg transition-all duration-300 ease-in-out sm:w-1/2 lg:hidden lg:w-1/3"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={sidebarRef}
                className="flex h-full flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex h-full flex-col gap-4">
                  {/* Header */}
                  <div className="flex h-(--navbar-h) w-full items-center justify-between gap-4 p-3 backdrop-blur-sm">
                    <div className="relative flex items-center gap-2">
                      <Link
                        href="/"
                        className="flex items-center gap-2"
                        onClick={() => {
                          setIsSidebarOpen(false);
                          console.log(isSidebarOpen);
                        }}
                      >
                        <AppLogo />
                      </Link>

                      <span className="relative">
                        <BellIcon className="text-text-colour h-6 w-6 text-lg" />
                        <span className="absolute -top-2 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] p-1 text-sm text-white shadow-md">
                          2
                        </span>
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      className="text-text-colour flex w-fit items-center justify-center text-xl font-bold transition-all duration-300 ease-in-out hover:cursor-pointer hover:text-(--input-error-red)"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        console.log(isSidebarOpen);
                      }}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Navigation Links */}
                  <nav className="w-full p-4">
                    <ul className="grid w-full grid-cols-1 gap-6">
                      {sideNavLinks.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                          <li key={href}>
                            <Link
                              href={href}
                              className={`${
                                isActive
                                  ? "group text-heading-colour bg-[#E8EEE9]"
                                  : "text-text-colour hover:bg-[#E8EEE9]"
                              } border-gray-border flex items-center gap-4 border-b p-4 text-xl`}
                              onClick={() => setIsSidebarOpen(false)}
                            >
                              {Icon && (
                                <Icon
                                  className={`h-5 w-5 text-(--debridger-green-dark) transition-all duration-300 ease-in-out ${isActive ? "fill-current" : "group-hover:fill-current"}`}
                                />
                              )}
                              <span>{label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* Authentication Links */}
                  {/* This will disappear when user sign in and the user and notification icon will show */}
                  <div className="flex flex-wrap items-center gap-4 p-4">
                    <SecondaryLink href="/login" label="Log In" className="" />

                    <PrimaryLink href="/register" label="Get Started" />
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
