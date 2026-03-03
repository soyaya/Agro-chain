
import { NavLink } from "~/types/types";
import { HomeIcon, Briefcase, ToolCase, Users, Phone } from "lucide-react";

export const navLinks: NavLink[] = [
  { label: "Home", href: "/", },
  { label: "Products", href: "/products" },
  // { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export const sideNavLinks: NavLink[] = [
  { label: "Home", href: "/", icon: HomeIcon, },
  { label: "Products", href: "/products", icon: Briefcase, },
  { label: "How it works", href: "/how-it-works", icon: ToolCase, },
  { label: "About Us", href: "/about", icon: Users, },
  { label: "Contact", href: "/contact", icon: Phone, },
];

import { 
  FacebookIcon, XIcon,
  Instagram, Linkedin,
  MessageCircleCodeIcon, Mail,
} from 'lucide-react';

export const socialLinks: NavLink[] = [
  { 
    label: "Facebook", href: "https://facebook.com/yourpage", 
    icon: FacebookIcon, color: "hover:text-[#1877F2]" 
  }, // Facebook Blue
  { 
    label: "X", href: "https://x.com/Debridgers", 
    icon: XIcon, color: "hover:text-black" 
  }, // X Black
  { 
    label: "Instagram", href: "https://instagram.com/yourhandle", 
    icon: Instagram, color: "hover:text-[#E4405F]" 
  }, // Instagram Pink
  // { 
  //   label: "WhatsApp", href: "https://wa.me/2347012288798", 
  //   icon: Instagram, color: "hover:text-[#25D366]"
  // }, // Whatsapp Green
  { 
    label: "WhatsApp", href: "https://wa.me/2347012288798?text=Hello%20from%20your%20website!", 
    icon: MessageCircleCodeIcon, color: "hover:text-[#25D366]"
  }, // Whatsapp Green
  {
    label: "LinkedIn", href: "https://www.linkedin.com/company/debridger/", 
    icon: Linkedin, color: "hover:text-[#0A66C2]"
  }, // LinkedIn Blue
  { 
    label: "Gmail", href: "mailto:Debridger@yahoo.com", 
    icon: Mail, color: "hover:text-[#EA4335]" 
  }, // Gmail Red
];