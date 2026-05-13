// Icon
import type { LucideIcon } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  icon?: LucideIcon;
  color?: string;
};

export interface Object {
  label: string;
  value: string;
}