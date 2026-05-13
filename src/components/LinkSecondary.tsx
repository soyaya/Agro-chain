"use client";

import Link from "next/link";

interface SecondaryLinkProps {
  href: string;
  label: string;
  className?: string;
}

export default function SecondaryLink({ href, label, className = "", }: SecondaryLinkProps) {

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-6 py-3 text-xl transition-all duration-300 ease-in-out border rounded-full font-inter w-fit hover:opacity-90 hover:shadow-md ${className}`}
    >
      <span>{label}</span>
    </Link>
  );
}

// Add border-
// Add bg-
// Add text
