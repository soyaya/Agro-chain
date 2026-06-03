
import type { NavLink, Object, FAQ, ImpactStat, TestimonialItem, FeatureCard, FishCategory, HowItWorksCard } from "~/types/types";
import {
  HomeIcon, ShoppingCart, HelpCircle, Users, Phone,
  Shield, Tag, Truck, Lock, FileText, Users2, Fish,
  LayoutDashboard, User, Package,
  Users as UsersIcon, Settings,
  CheckSquare, Clock, BarChart3, CreditCard,
  DollarSign, Receipt, Wallet, TrendingUp,
} from "lucide-react";

// === Footer
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
];

export const sideNavLinks: NavLink[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  { label: "How It Works", href: "/how-it-works", icon: HelpCircle },
  { label: "About", href: "/about", icon: Users },
  { label: "Contact", href: "/contact", icon: Phone },
];

export const supportLinks: NavLink[] = [
  { label: "Help center", href: "/contact#help" },
  { label: "Feedback", href: "/contact#feedback" },
  { label: "Tweet Us", href: "/contact#tweet" },
];

export const footer2Links: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy#privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Legal", href: "/privacy" },
  { label: "Site Map", href: "/" },
];

// ============================================
// HOMEPAGE DATA
// ============================================

export const impactStats: ImpactStat[] = [
  { value: "500+", label: "Registered Farmers" },
  { value: "50+", label: "Cluster Farmers" },
  { value: "10,000kg+", label: "Fish Traded Monthly" },
  { value: "6", label: "States Covered" },
];

export const howItWorksCards: HowItWorksCard[] = [
  {
    number: 1,
    icon: Fish,
    title: "Farmer",
    steps: [
      "Register → List supply",
      "Cluster approval",
      "Earn",
    ],
  },
  {
    number: 2,
    icon: Users,
    title: "Cluster Farmer",
    steps: [
      "Aggregate farmers",
      "List on marketplace",
      "Fulfill orders → Get paid",
    ],
  },
  {
    number: 3,
    icon: ShoppingCart,
    title: "Buyer",
    steps: [
      "Browse listings",
      "Add to cart",
      "Pay securely → Confirm delivery",
    ],
  },
];

export const featureCards: FeatureCard[] = [
  {
    icon: Shield,
    title: "Verified Sellers",
    description:
      "All cluster farmers are KYC-verified and approved by admin before they can list.",
  },
  {
    icon: Tag,
    title: "Admin-Set Pricing",
    description:
      "Prices are set platform-wide by admin. No price negotiation, no surprises.",
  },
  {
    icon: Truck,
    title: "Coordinated Logistics",
    description:
      "Cluster farmers handle warehousing and delivery. Buyers choose pickup or delivery at checkout.",
  },
  {
    icon: Lock,
    title: "Secure Escrow",
    description:
      "Payments via Paystack. Funds held until buyer confirms delivery.",
  },
  {
    icon: FileText,
    title: "Traceable Supply",
    description:
      "Every listing is tied to a verified farmer and cluster farmer. Full chain of custody.",
  },
  {
    icon: Users2,
    title: "Demand Matching",
    description:
      "Can't find what you need? Submit a demand and admin assigns the right cluster farmer to fulfill it.",
  },
];

export const fishCategories: FishCategory[] = [
  { key: "catfish", name: "Catfish", description: "Fresh live and processed catfish", fishTypeParam: "catfish" },
  { key: "fingerlings", name: "Fingerlings", description: "Young fish for restocking ponds", fishTypeParam: "fingerlings" },
  { key: "juveniles", name: "Juveniles", description: "Mid-stage catfish ready for grow-out", fishTypeParam: "juveniles" },
  { key: "table_size", name: "Table Size", description: "Market-ready catfish, 1–1.5kg", fishTypeParam: "table_size" },
  { key: "jumbo", name: "Jumbo", description: "Large catfish 2kg and above", fishTypeParam: "jumbo" },
  { key: "parent_stocks", name: "Parent Stocks", description: "Broodstock for breeding programs", fishTypeParam: "parent_stocks" },
];

export const testimonials: TestimonialItem[] = [
  {
    quote:
      "Agro-chain made it easy to list my catfish and get approved within 24 hours. My cluster farmer handles everything after that.",
    name: "Musa A.",
    role: "Catfish Farmer, Kaduna",
  },
  {
    quote:
      "I used to spend days sourcing catfish for my restaurant. Now I order directly from verified cluster farmers and pay securely.",
    name: "Chioma O.",
    role: "Restaurant Owner, Lagos",
  },
  {
    quote:
      "Managing 12 farmers under me was chaotic. Agro-chain gives me one dashboard to approve listings, track orders, and get paid.",
    name: "Ibrahim K.",
    role: "Cluster Farmer, Kano",
  },
];

// ============================================
// FAQ ARRAYS
// ============================================

export const homeFaqs: FAQ[] = [
  {
    question: "Do I need an account to browse the marketplace?",
    answer:
      "No. The marketplace is fully public. You can browse all listings, view prices, and read seller details without logging in. An account is only needed when you add to cart or checkout.",
  },
  {
    question: "How are prices set on Agro-chain?",
    answer:
      "All prices are set platform-wide by admin, not by individual sellers. No price negotiation, no hidden costs, and the same fair price for every buyer.",
  },
  {
    question: "How do I know a seller is genuine?",
    answer:
      "All cluster farmers are KYC-verified and admin-approved before they can list. Every listing is tied to a verified farmer and their cluster farmer. Full chain of custody is visible.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "Payments are processed via Paystack (card and bank transfer). Funds are held in escrow until you confirm delivery, so your money is protected.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery timelines depend on the cluster farmer and your location. Each listing shows the seller's state and warehouse location. Contact details are available after checkout.",
  },
];

export const farmerFaqs: FAQ[] = [
  {
    question: "How long does cluster approval take?",
    answer: "Cluster farmers are expected to review listings within 24–48 hours of submission.",
  },
  {
    question: "What happens if my listing is rejected?",
    answer:
      "Your cluster farmer will include a reason with the rejection. Fix the issue and resubmit; common reasons include inaccurate weight, wrong fish type, or a missing harvest date.",
  },
  {
    question: "Can I list multiple fish types?",
    answer:
      "Yes. You can create separate listings for each fish type you have available. Each listing is reviewed independently.",
  },
  {
    question: "When do I get paid?",
    answer:
      "After a buyer confirms delivery, the payout is released from escrow to your cluster farmer, who distributes to you based on your agreed terms.",
  },
];

export const clusterFarmerFaqs: FAQ[] = [
  {
    question: "How do I apply for cluster farmer status?",
    answer:
      "Submit your CAC certificate, BVN, and warehouse location through the registration flow. Admin reviews applications and approves within 3–5 business days.",
  },
  {
    question: "How are farmers assigned to me?",
    answer:
      "Farmers in your geographic area are automatically assigned to your cluster. You can see and manage all your assigned farmers from your dashboard.",
  },
  {
    question: "When do I receive my payout?",
    answer:
      "Payouts are released after a buyer confirms delivery. The exact timing depends on the escrow delay window selected at listing creation.",
  },
];

export const buyerFaqs: FAQ[] = [
  {
    question: "Do I need an account to browse?",
    answer:
      "No. Browsing, filtering, and viewing listings is fully public. You only need an account to add to cart or checkout.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "Paystack (card or bank transfer). Funds are held in escrow until you confirm delivery.",
  },
  {
    question: "What if my order doesn't arrive?",
    answer:
      "Do not confirm delivery until your order actually arrives and you are satisfied. Escrow funds are only released after your confirmation. Contact support if there is a dispute.",
  },
  {
    question: "Can I order from multiple sellers in one cart?",
    answer:
      "Currently each order is tied to one cluster farmer. For multi-seller orders, place separate orders per seller.",
  },
];

export const aboutFaqs: FAQ[] = [
  {
    question: "What is Agro-chain?",
    answer:
      "Agro-chain is a digital marketplace connecting verified catfish farmers and cluster aggregators with bulk buyers across Nigeria, bringing transparency, fair pricing, and secure payments to a ₦500B+ informal industry.",
  },
  {
    question: "Who is behind Agro-chain?",
    answer:
      "Agro-chain was built by a team that saw how informal catfish trading was hurting both farmers and buyers: opaque prices, unreliable logistics, and unverified sellers. We built the platform to change that.",
  },
  {
    question: "What states does Agro-chain cover?",
    answer:
      "We currently cover 6 states across Nigeria with verified cluster farmers on the ground. We are expanding based on demand; submit a demand request if your state isn't listed yet.",
  },
  {
    question: "Is Agro-chain only for catfish?",
    answer:
      "Currently yes: catfish, fingerlings, juveniles, table size, jumbo, and parent stocks. We chose to go deep on one protein before expanding.",
  },
  {
    question: "How does Agro-chain make money?",
    answer:
      "A small platform fee is applied at checkout. This is included in the admin-set pricing; there are no hidden fees added at payment time.",
  },
];

export const contactFaqs: FAQ[] = [
  {
    question: "How quickly will you respond to my message?",
    answer:
      "We respond to all inquiries within 24 hours on business days (Monday–Friday, 9am–5pm WAT). WhatsApp messages are typically faster.",
  },
  {
    question: "I'm a buyer and my order has a problem. Who do I contact?",
    answer:
      "Contact us via WhatsApp (+234 701 228 8798) for the fastest response on order issues. Include your order ID and a brief description of the problem.",
  },
  {
    question: "I'm a farmer and want to join the platform. What do I do?",
    answer:
      "Register at /register?role=farmer. After registration you'll be assigned to a cluster farmer in your area. They will guide you through your first listing.",
  },
  {
    question: "I want to partner with Agro-chain as an organisation or logistics provider.",
    answer:
      "Send a partnership inquiry through the contact form selecting \"Partnership\" as the subject. Our team will review and respond within 2–3 business days.",
  },
  {
    question: "Is there a phone number I can call?",
    answer:
      "Yes, call +234 701 228 8798, available Monday to Friday, 9am to 5pm WAT. WhatsApp is preferred for faster support.",
  },
];

export const supportFaqs: FAQ[] = [
  ...homeFaqs,
  ...farmerFaqs.slice(0, 2),
  ...buyerFaqs.slice(0, 2),
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

export const kadunaLga: Object[] = [
  { label: "Birnin Gwari", value: "birnin-gwari" },
  { label: "Chikun", value: "chikun" },
  { label: "Giwa", value: "giwa" },
  { label: "Igabi", value: "igabi" },
  { label: "Ikara", value: "ikara" },
  { label: "Jaba", value: "jaba" },
  { label: "Jema'a", value: "jemaa" },
  { label: "Kachia", value: "kachia" },
  { label: "Kaduna North", value: "kaduna-north" },
  { label: "Kaduna South", value: "kaduna-south" },
  { label: "Kagarko", value: "kagarko" },
  { label: "Kajuru", value: "kajuru" },
  { label: "Kaura", value: "kaura" },
  { label: "Kauru", value: "kauru" },
  { label: "Kubau", value: "kubau" },
  { label: "Kudan", value: "kudan" },
  { label: "Lere", value: "lere" },
  { label: "Makarfi", value: "makarfi" },
  { label: "Sabon Gari", value: "sabon-gari" },
  { label: "Sanga", value: "sanga" },
  { label: "Soba", value: "soba" },
  { label: "Zangon Kataf", value: "zangon-kataf" },
  { label: "Zaria", value: "zaria" }
];


// ============================================
// DASHBOARD NAVIGATION
// ============================================

import type { DashboardConfig, EnhancedDashboardConfig } from '~/types/index';

export const farmerDashboardConfig: EnhancedDashboardConfig = {
  title: "Farmer Dashboard",
  description: "Manage your farm and supply listings",
  navLinks: [
    { label: "Dashboard", href: "/farmers-dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/farmers-dashboard/profile", icon: User },
    { label: "My Listings", href: "/farmers-dashboard/listings", icon: FileText },
    { label: "Create Listing", href: "/farmers-dashboard/listings/create", icon: Package },
  ],
  financialServices: {
    enabled: true,
    loanServices: {
      applicationEnabled: true,
      trackingEnabled: true,
      historyEnabled: true,
    },
    creditServices: {
      purchaseEnabled: true,
      catalogEnabled: true,
      paymentTrackingEnabled: true,
    },
  },
};

export const clusterFarmerDashboardConfig: EnhancedDashboardConfig = {
  title: "Cluster Farmer Dashboard",
  description: "Manage farmers and marketplace listings",
  navLinks: [
    { label: "Dashboard", href: "/cluster-dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/cluster-dashboard/profile", icon: User },
    { label: "Pending Approvals", href: "/cluster-dashboard/pending-approvals", icon: Clock },
    { label: "Orders", href: "/cluster-dashboard/orders", icon: Package },
    { label: "My Listings", href: "/cluster-dashboard/listings", icon: FileText },
    { label: "Farmers", href: "/cluster-dashboard/farmers", icon: UsersIcon },
  ],
  financialServices: {
    enabled: true,
    loanServices: {
      applicationEnabled: true,
      trackingEnabled: true,
      historyEnabled: true,
    },
    creditServices: {
      purchaseEnabled: true,
      catalogEnabled: true,
      paymentTrackingEnabled: true,
    },
  },
};

export const buyerDashboardConfig: DashboardConfig = {
  title: "Buyer Dashboard",
  description: "Browse marketplace and manage orders",
  navLinks: [
    { label: "Dashboard", href: "/buyers-dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/buyers-dashboard/profile", icon: User },
    { label: "Marketplace", href: "/marketplace", icon: ShoppingCart },
    { label: "My Orders", href: "/buyers-dashboard/orders", icon: Package },
    { label: "My Demands", href: "/buyers-dashboard/demands", icon: FileText },
    { label: "Saved Listings", href: "/buyers-dashboard/saved", icon: CheckSquare },
  ],
};

export const adminDashboardConfig: DashboardConfig = {
  title: "Admin Dashboard",
  description: "Platform management and analytics",
  navLinks: [
    { label: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
    { label: "Analytics", href: "/admin-dashboard/analytics", icon: BarChart3 },
    { label: "Farmers", href: "/admin-dashboard/farmers", icon: UsersIcon },
    { label: "Cluster Applications", href: "/admin-dashboard/applications", icon: CheckSquare },
    { label: "Listings", href: "/admin-dashboard/listings", icon: FileText },
    { label: "Demands", href: "/admin-dashboard/demands", icon: Receipt },
    { label: "Orders", href: "/admin-dashboard/orders", icon: Package },
    { label: "Settings", href: "/admin-dashboard/settings", icon: Settings },
  ],
};

// ============================================
// ENHANCED FARMER DASHBOARD CONFIGURATIONS
// ============================================

export const enhancedFarmerDashboardConfig: EnhancedDashboardConfig = {
  title: "Farmer Dashboard",
  description: "Manage your farm and supply listings",
  navLinks: [
    { label: "Dashboard", href: "/farmers-dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/farmers-dashboard/profile", icon: User },
    { label: "My Listings", href: "/farmers-dashboard/listings", icon: FileText },
    { label: "Create Listing", href: "/farmers-dashboard/listings/create", icon: Package },
    // Financial Services Navigation
    {
      label: "Financial Services",
      href: "/farmers-dashboard/financial",
      icon: CreditCard,
      submenu: [
        { label: "Loan Applications", href: "/farmers-dashboard/financial/loans", icon: DollarSign },
        { label: "Credit Purchases", href: "/farmers-dashboard/financial/credit", icon: ShoppingCart },
        { label: "Payment History", href: "/farmers-dashboard/financial/payments", icon: Receipt },
        { label: "Financial Profile", href: "/farmers-dashboard/financial/profile", icon: TrendingUp },
      ]
    },
  ],
  financialServices: {
    enabled: true,
    loanServices: {
      applicationEnabled: true,
      trackingEnabled: true,
      historyEnabled: true,
    },
    creditServices: {
      purchaseEnabled: true,
      catalogEnabled: true,
      paymentTrackingEnabled: true,
    },
  },
};

export const enhancedClusterFarmerDashboardConfig: EnhancedDashboardConfig = {
  title: "Cluster Farmer Dashboard",
  description: "Manage farmers and marketplace listings",
  navLinks: [
    { label: "Dashboard", href: "/cluster-dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/cluster-dashboard/profile", icon: User },
    { label: "Pending Approvals", href: "/cluster-dashboard/pending-approvals", icon: Clock },
    { label: "Demands", href: "/cluster-dashboard/demands", icon: Receipt },
    { label: "Orders", href: "/cluster-dashboard/orders", icon: Package },
    { label: "My Listings", href: "/cluster-dashboard/listings", icon: FileText },
    { label: "Farmers", href: "/cluster-dashboard/farmers", icon: UsersIcon },
    // Financial Services Navigation
    {
      label: "Financial Services",
      href: "/cluster-dashboard/financial",
      icon: CreditCard,
      submenu: [
        { label: "Loan Applications", href: "/cluster-dashboard/financial/loans", icon: DollarSign },
        { label: "Credit Purchases", href: "/cluster-dashboard/financial/credit", icon: ShoppingCart },
        { label: "Payment History", href: "/cluster-dashboard/financial/payments", icon: Receipt },
        { label: "Financial Profile", href: "/cluster-dashboard/financial/profile", icon: TrendingUp },
        { label: "Farmer Finances", href: "/cluster-dashboard/financial/farmers", icon: Wallet },
      ]
    },
  ],
  financialServices: {
    enabled: true,
    loanServices: {
      applicationEnabled: true,
      trackingEnabled: true,
      historyEnabled: true,
    },
    creditServices: {
      purchaseEnabled: true,
      catalogEnabled: true,
      paymentTrackingEnabled: true,
    },
  },
};
