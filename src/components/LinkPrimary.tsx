"use client";

import Link from "next/link";

interface PrimaryLinkProps {
  href: string;
  label: string;
  className?: string;
}

export default function PrimaryLink({
  href,
  label,
  className = "",
}: PrimaryLinkProps) {
  return (
    <Link
      href={href}
      className={`font-ubuntu from-debridger-green-light to-debridger-green-dark w-fit gap-2 rounded-full bg-linear-to-r px-6 py-3 text-center text-xl font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:opacity-90 ${className}`}
    >
      <span>{label}</span>
    </Link>
  );
}
