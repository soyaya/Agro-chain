"use client";

import Image from "next/image";
import { motion, type TargetAndTransition } from "framer-motion";
import { Linkedin } from "lucide-react";
import Link from "next/link";
import { SLOW_STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import type { TeamMember } from "~/types/types";

const CARD_HOVER: TargetAndTransition = {
  y: -6,
  scale: 1.02,
  boxShadow: "var(--card-hover-shadow)",
  transition: { duration: 0.25, ease: "easeOut" },
};

const CARD_TAP: TargetAndTransition = { scale: 0.97, transition: { duration: 0.1 } };

export default function AboutTeamSection() {
  const team: TeamMember[] = [
    {
      name: "David David",
      role: "Founder & Product Manager",
      bio: "Driving the vision and product strategy behind Agro-chain.",
      linkedin: "https://linkedin.com/in/",
      photo: "/team/david.jpg",
    },
    {
      name: "Stephanie Nwankwo",
      role: "Co-founder & Backend Engineer",
      bio: "Architecting the systems and APIs that power the Agro-chain platform.",
      linkedin: "https://linkedin.com/in/",
      photo: "/team/stephanie.jpg",
    },
    {
      name: "Olorunshogo M. Bamtefa",
      role: "Co-founder & Frontend Engineer",
      bio: "Building the digital interface connecting farmers and buyers across Nigeria.",
      linkedin: "https://linkedin.com/in/",
      photo: "/team/olorunshogo.jpg",
    },
  ];

  return (
    <section aria-label="Meet the Team" className="bg-white">
      <div className="section-content-max-width px-section-px sm:px-section-px-sm lg:px-section-px-lg py-section-py sm:py-section-py-sm lg:py-section-py-lg">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="font-ubuntu text-theme-green-dark text-xs font-semibold tracking-widest uppercase">
            Meet the Team
          </span>
          <h2 className="font-ubuntu text-heading-colour text-3xl font-bold lg:text-4xl">
            The people behind Agro-chain.
          </h2>
        </div>

        <motion.div
          variants={SLOW_STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 flex flex-wrap justify-center gap-8"
        >
          {team.map(({ name, role, bio, linkedin, photo }) => (
            <motion.div
              key={name}
              variants={SLIDE_UP_VARIANT}
              whileHover={CARD_HOVER}
              whileTap={CARD_TAP}
              className="border-gray-border flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border bg-white p-6 text-center shadow-sm"
            >
              {/* Headshot */}
              <div className="ring-gray-bg relative h-24 w-24 overflow-hidden rounded-full ring-4">
                {photo ? (
                  <Image
                    src={photo}
                    alt={`${name} headshot`}
                    fill
                    className="object-cover object-top"
                    sizes="96px"
                  />
                ) : (
                  <div className="text-theme-green-dark flex h-full w-full items-center justify-center bg-green-50 text-3xl font-bold">
                    {name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <p className="font-ubuntu text-heading-colour font-bold">{name}</p>
                <p className="font-roboto-slab text-theme-green-dark text-sm font-medium">{role}</p>
              </div>

              <p className="font-roboto-slab text-text-colour text-xs">{bio}</p>

              <Link
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="border-gray-border text-theme-green-dark hover:bg-gray-bg flex items-center gap-1.5 rounded-full border px-4 py-1.5 transition"
                aria-label={`${name} on LinkedIn`}
              >
                <Linkedin className="h-3.5 w-3.5" />
                <span className="font-ubuntu text-xs font-medium">LinkedIn</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
