"use client";

import Link from "next/link";

interface SecondaryLinkProps {
  href: string;
  label: string;
  className?: string;
}

export default function SecondaryLink({ href, label, className = "" }: SecondaryLinkProps) {
  return (
    <Link
      href={href}
      className={`font-ubuntu flex w-fit items-center gap-2 px-6 py-3 text-xl font-semibold transition-all duration-300 ease-in-out hover:text-white/90 ${className}`}
    >
      <span>{label}</span>
    </Link>
  );
}
