"use client";

import { motion } from "framer-motion";

// Procedurally drawn catfish (no image assets): a body with dorsal fin, a
// tail and three whiskers ("barbels") that each wag on their own timing.
// Decorative only — hidden from assistive tech.

function Catfish({ delay, duration, y, size, flip }: { delay: number; duration: number; y: string; size: number; flip?: boolean }) {
  const from = flip ? "110%" : "-30%";
  const to = flip ? "-30%" : "110%";
  return (
    <motion.svg
      viewBox="0 0 124 48"
      aria-hidden="true"
      className="absolute"
      style={{ bottom: y, width: size, height: size * (48 / 124), scaleX: flip ? -1 : 1 }}
      initial={{ left: from }}
      animate={{ left: to, y: [0, -4, 0, 4, 0] }}
      transition={{
        left: { duration, delay, ease: "linear", repeat: Infinity },
        y: { duration: 2.4, ease: "easeInOut", repeat: Infinity },
      }}
    >
      <g fill="rgba(16, 52, 38, 0.82)">
        {/* Tail wags around the body's rear */}
        <motion.path
          d="M18 24 L4 10 Q7 24 4 38 Z"
          style={{ originX: "18px", originY: "24px" }}
          animate={{ rotate: [-14, 14] }}
          transition={{ duration: 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
        />
        {/* Body */}
        <path d="M114 24 C110 16 98 12 82 12 C58 12 36 16 18 23 L18 25 C36 32 58 36 82 36 C98 36 110 32 114 24 Z" />
        {/* Dorsal fin */}
        <path d="M58 13 Q64 1 78 12 Z" />
        {/* Belly fin */}
        <path d="M60 35 Q66 45 76 36 Z" />
      </g>
      {/* Whiskers */}
      <g stroke="rgba(16, 52, 38, 0.82)" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <motion.path d="M112 26 Q120 30 118 40" animate={{ d: ["M112 26 Q120 30 118 40", "M112 26 Q122 34 114 42", "M112 26 Q120 30 118 40"] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.path d="M112 23 Q122 22 121 12" animate={{ d: ["M112 23 Q122 22 121 12", "M112 23 Q123 18 118 9", "M112 23 Q122 22 121 12"] }} transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }} />
        <motion.path d="M109 28 Q113 38 106 44" animate={{ d: ["M109 28 Q113 38 106 44", "M109 28 Q117 36 112 45", "M109 28 Q113 38 106 44"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
      </g>
      <circle cx="102" cy="20" r="1.8" fill="#fff" />
    </motion.svg>
  );
}

function Bubble({ left, delay, size }: { left: string; delay: number; size: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className="absolute rounded-full border border-white/70 bg-white/20"
      style={{ left, bottom: 4, width: size, height: size }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: -170, opacity: [0, 0.9, 0] }}
      transition={{ duration: 3.6, delay, ease: "easeOut", repeat: Infinity }}
    />
  );
}

export function SwimmingCatfish() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Catfish delay={0} duration={7} y="14%" size={92} />
      <Catfish delay={2.5} duration={9} y="34%" size={60} flip />
      <Bubble left="18%" delay={0} size={7} />
      <Bubble left="42%" delay={1.1} size={5} />
      <Bubble left="66%" delay={0.6} size={8} />
      <Bubble left="84%" delay={1.9} size={5} />
    </div>
  );
}
