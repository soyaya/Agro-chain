"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  SLOW_STAGGER_CONTAINER_VARIANT,
  SLIDE_UP_VARIANT,
} from "~/types/constants";
import { MarketplaceCard } from "~/components/marketplace/MarketplaceCard";
import type { MarketplaceListing } from "~/types/index";

export default function MarketplacePreviewSection() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketplace?limit=3")
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.data ?? []);
        setListings(items.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && listings.length === 0) return null;

  return (
    <section aria-label="Marketplace Preview" className="bg-white">
      <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="font-ubuntu text-theme-green-dark text-xs font-semibold tracking-widest uppercase">
            Live Marketplace
          </span>
          <h2 className="font-ubuntu text-heading-colour text-3xl font-bold lg:text-4xl">
            Fresh Supply, Available Now.
          </h2>
          <p className="font-roboto-slab text-text-colour max-w-xl text-lg">
            Browse verified listings from cluster farmers across Nigeria.
          </p>
        </div>

        {/* Cards */}
        <motion.div
          variants={SLOW_STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={SLIDE_UP_VARIANT}
                  className="bg-gray-bg h-64 animate-pulse rounded-2xl"
                  aria-hidden="true"
                />
              ))
            : listings.map((listing) => (
                <motion.div key={listing.id} variants={SLIDE_UP_VARIANT}>
                  <MarketplaceCard listing={listing} />
                </motion.div>
              ))}
        </motion.div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/marketplace"
            className="font-ubuntu border-theme-green-dark text-theme-green-dark hover:bg-theme-green-dark rounded-full border px-8 py-3 text-sm font-semibold transition hover:text-white active:scale-95"
          >
            View All Listings →
          </Link>
        </div>
      </div>
    </section>
  );
}
