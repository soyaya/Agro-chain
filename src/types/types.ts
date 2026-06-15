// Icon
import type { LucideIcon } from "lucide-react";

export type Role = "farmer" | "buyer" | "admin";

export interface NavLink {
  label: string;
  href: string;
  icon?: LucideIcon;
  color?: string;
}

export interface Object {
  label: string;
  value: string;
}

// === Landing Page Types

export interface FAQ {
  question: string;
  answer: string;
}

export interface ImpactStat {
  value: string;
  label: string;
}

export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
}

export interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FishCategory {
  key: string;
  name: string;
  description: string;
  fishTypeParam: string;
}

export interface FishCategoryGroup {
  key: string;
  name: string;
  description: string;
  subTypes: { label: string; value: string }[];
  categoryParam: string;
  ctaLabel: string;
  ctaHref: string;
  isSpecialDemand?: boolean;
}

export interface HowItWorksCard {
  number: number;
  icon: LucideIcon;
  title: string;
  steps: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  linkedin: string;
  photo?: string;
}
