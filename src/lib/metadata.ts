import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://agrochain.com";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: "%s | AgroChain",
    default: "AgroChain | Digital Fish Supply Marketplace",
  },
  description:
    "AgroChain connects fish farmers with buyers through a digital marketplace. Verified farmers, secure payments, reliable logistics, direct from source.",
  keywords: [
    "AgroChain",
    "fish marketplace",
    "Nigerian fish",
    "catfish",
    "tilapia",
    "fish farmers",
    "fish buyers",
    "aquaculture Nigeria",
    "fish supply chain",
    "cluster farming",
    "agricultural marketplace",
  ],
  authors: [
    {
      name: "AgroChain Team",
      url: baseUrl,
    },
  ],
  creator: "AgroChain Team",
  publisher: "AgroChain",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "AgroChain | Digital Fish Supply Marketplace",
    description:
      "Connect with verified fish farmers and buyers. Secure payments, reliable logistics, direct from source.",
    siteName: "AgroChain",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgroChain - Digital Fish Supply Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AgroChain",
    creator: "@AgroChain",
    title: "AgroChain | Digital Fish Supply Marketplace",
    description:
      "Connect with verified fish farmers and buyers. Secure payments, reliable logistics.",
    images: {
      url: "/twitter-image.png",
      alt: "AgroChain Twitter Card",
    },
  },
};

export const farmerDashboardMetadata: Metadata = {
  title: "Farmer Dashboard",
  description:
    "Manage your farm profile, create supply listings, and track approvals on AgroChain marketplace.",
  openGraph: {
    title: "Farmer Dashboard | AgroChain",
    description:
      "Manage your farm and supply listings on AgroChain marketplace.",
  },
};

export const clusterDashboardMetadata: Metadata = {
  title: "Cluster Farmer Dashboard",
  description:
    "Manage farmers, approve listings, and publish to marketplace as a cluster farmer on AgroChain.",
  openGraph: {
    title: "Cluster Farmer Dashboard | AgroChain",
    description:
      "Aggregate supply and manage farmers on AgroChain marketplace.",
  },
};

export const buyerDashboardMetadata: Metadata = {
  title: "Buyer Dashboard",
  description:
    "Browse marketplace, place orders, and track deliveries on AgroChain fish supply marketplace.",
  openGraph: {
    title: "Buyer Dashboard | AgroChain",
    description: "Browse and purchase fish from verified farmers on AgroChain.",
  },
};

export const adminDashboardMetadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "Platform management, analytics, and cluster farmer verification for AgroChain marketplace.",
  openGraph: {
    title: "Admin Dashboard | AgroChain",
    description: "Manage and monitor AgroChain marketplace platform.",
  },
};

export const marketplaceMetadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse and purchase fresh fish from verified cluster farmers. Catfish, Tilapia, Mackerel and more.",
  keywords: [
    "fish marketplace",
    "buy fish online",
    "catfish for sale",
    "tilapia suppliers",
    "Nigerian fish market",
    "bulk fish purchase",
  ],
  openGraph: {
    title: "Fish Marketplace | AgroChain",
    description:
      "Browse and purchase fresh fish from verified cluster farmers.",
  },
};

export const loginMetadata: Metadata = {
  title: "Login",
  description: "Sign in to your AgroChain account to access your dashboard.",
  openGraph: {
    title: "Login | AgroChain",
    description: "Sign in to your AgroChain account.",
  },
};

export const registerMetadata: Metadata = {
  title: "Create Account",
  description: "Join AgroChain as a farmer or buyer. Start trading fish today.",
  openGraph: {
    title: "Create Account | AgroChain",
    description: "Join AgroChain marketplace as a farmer or buyer.",
  },
};

export const profileMetadata: Metadata = {
  title: "Profile",
  description: "Manage your AgroChain profile information and settings.",
  openGraph: {
    title: "Profile | AgroChain",
    description: "Manage your profile on AgroChain marketplace.",
  },
};

export const listingsMetadata: Metadata = {
  title: "My Listings",
  description:
    "View and manage your fish supply listings on AgroChain marketplace.",
  openGraph: {
    title: "My Listings | AgroChain",
    description: "Manage your supply listings on AgroChain.",
  },
};

export const createListingMetadata: Metadata = {
  title: "Create Listing",
  description: "Create a new fish supply listing on AgroChain marketplace.",
  openGraph: {
    title: "Create Listing | AgroChain",
    description: "List your fish supply on AgroChain marketplace.",
  },
};

export const ordersMetadata: Metadata = {
  title: "My Orders",
  description:
    "Track your fish orders and delivery status on AgroChain marketplace.",
  openGraph: {
    title: "My Orders | AgroChain",
    description: "Track your orders on AgroChain marketplace.",
  },
};

export const pendingApprovalsMetadata: Metadata = {
  title: "Pending Approvals",
  description:
    "Review and approve farmer supply listings as a cluster farmer on AgroChain.",
  openGraph: {
    title: "Pending Approvals | AgroChain",
    description: "Review farmer listings on AgroChain marketplace.",
  },
};
