
import { NavLink, Object } from "~/types/types";
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

import { 
  LayoutDashboard, User, FileText, Package, 
  ShoppingCart, Users as UsersIcon, Settings, 
  CheckSquare, Clock, BarChart3, CreditCard, 
  DollarSign, Receipt, Wallet, TrendingUp
} from 'lucide-react';
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
