"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "~/types/constants";

const values = [
  {
    title: "Transparency",
    body: "Every price is set by admin. Every listing is tied to a verified farmer. No hidden fees, no price manipulation.",
    image: "/Home_Image_1/Home_1.webp",
    imageAlt: "Marketplace pricing screenshot",
  },
  {
    title: "Trust",
    body: "Cluster farmers are KYC-verified and admin-approved before they can list. Buyers pay into escrow, not directly to sellers.",
    image: "/Home_Image_1/Home_1.webp",
    imageAlt: "Admin dashboard screenshot",
  },
  {
    title: "Traceability",
    body: "Every order has a full chain of custody, from the individual farmer who grew the fish to the cluster farmer who shipped it.",
    image: "/Home_Image_1/Home_1.webp",
    imageAlt: "Order tracking screenshot",
  },
  {
    title: "Fair Pricing",
    body: "Admin sets platform-wide prices per fish type. Farmers don't compete on price; they compete on quality and availability.",
    image: "/Home_Image_1/Home_1.webp",
    imageAlt: "Settings and pricing screenshot",
  },
];

export default function AboutValuesSection() {
  return (
    <section aria-label="Our Values" className="bg-gray-bg">
      <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="font-ubuntu text-theme-green-dark text-xs font-semibold tracking-widest uppercase">
            Our Values
          </span>
          <h2 className="font-ubuntu text-heading-colour text-3xl font-bold lg:text-4xl">
            What we stand for.
          </h2>
        </div>

        <div className="mt-16 flex flex-col gap-20">
          {values.map(({ title, body, image, imageAlt }, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={title}
                className={`flex flex-col items-center gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 ${
                  isEven ? "" : "lg:[&>*:first-child]:order-2"
                }`}
              >
                {/* Text — slides in from the leading side */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -40 : 40, filter: "blur(4px)" }}
                  whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
                  className="flex flex-col gap-4"
                >
                  <h3 className="font-ubuntu text-heading-colour text-2xl font-bold">{title}</h3>
                  <p className="font-roboto-slab text-text-colour text-lg">{body}</p>
                </motion.div>

                {/* Image — scales in from opposite side */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 40 : -40, scale: 0.96 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.75, ease: EASE_OUT_EXPO, delay: 0.08 }}
                  className="relative h-64 w-full overflow-hidden rounded-2xl lg:h-80"
                >
                  <Image
                    src={image}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
