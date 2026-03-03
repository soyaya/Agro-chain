
"use client";

import Link from "next/link";

interface PrimaryLinkProps {
  href: string;
  label: string;
  className?: string;
}

export default function PrimaryLink({ href, label, className = "", }: PrimaryLinkProps) {
  return (
    <Link
      href={href}
      className={`font-inter gap-2 w-fit text-white text-center text-xl font-semibold bg-linear-to-r from-(--debridger-green-light) to-(--debridger-green-dark) hover:opacity-90 px-6 py-3 rounded-full shadow-md transition-all duration-300 ease-in-out ${className}`}
    >
      <span>{label}</span>
    </Link>
  );
}


