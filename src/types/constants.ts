// Constants for AgroChainMarketPlace
// Centralized constants for consistency across the platform

// ============================================
// FISH TYPES
// ============================================

export const LIVE_FISH_TYPES = [
  "fingerlings",
  "juveniles",
  "table_size",
  "jumbo",
  "parent_stocks",
] as const;

export type LiveFishType = typeof LIVE_FISH_TYPES[number];

export const PROCESSED_FISH_TYPES = [
  "dried",
  "grilled",
  "peppersoup",
  "peppered",
  "smoked",
] as const;

export type ProcessedFishType = typeof PROCESSED_FISH_TYPES[number];

export const FISH_TYPES = [...LIVE_FISH_TYPES, ...PROCESSED_FISH_TYPES] as const;

export type FishType = typeof FISH_TYPES[number];

// Backwards-compat alias — variant concept is now the same as FishType
export type FishVariant = FishType;

export const FISH_TYPE_LABELS: Record<FishType, string> = {
  fingerlings: "Fingerlings",
  juveniles: "Juveniles",
  table_size: "Table Size",
  jumbo: "Jumbo",
  parent_stocks: "Parent Stocks",
  dried: "Dried",
  grilled: "Grilled",
  peppersoup: "Peppersoup",
  peppered: "Peppered",
  smoked: "Smoked",
};

export const LIVE_FISH_TYPE_LABELS: Record<LiveFishType, string> = {
  fingerlings: "Fingerlings",
  juveniles: "Juveniles",
  table_size: "Table Size",
  jumbo: "Jumbo",
  parent_stocks: "Parent Stocks",
};

export const PROCESSED_FISH_TYPE_LABELS: Record<ProcessedFishType, string> = {
  dried: "Dried",
  grilled: "Grilled",
  peppersoup: "Peppersoup",
  peppered: "Peppered",
  smoked: "Smoked",
};

// Fallback prices used before platform settings are fetched from the backend.
// The admin sets the live values via PATCH /admin/settings/price.
// These are dev-time defaults only - do not rely on them in production logic.
export const FALLBACK_PRICES_PER_KG: Record<FishType, number> = {
  fingerlings: 1200,
  juveniles: 800,
  table_size: 3500,
  jumbo: 5000,
  parent_stocks: 8000,
  dried: 6000,
  grilled: 5500,
  peppersoup: 7000,
  peppered: 6500,
  smoked: 6000,
};

export const BASE_DELIVERY_FEE_NAIRA = 1500;

// ============================================
// NIGERIAN STATES
// ============================================

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export type NigerianState = typeof NIGERIAN_STATES[number];

// ============================================
// BUSINESS TYPES
// ============================================

export const BUSINESS_TYPES = [
  "Restaurant",
  "Hotel",
  "Catering Service",
  "Fish Market",
  "Retail Store",
  "Wholesale Distributor",
  "Food Processing",
  "Export Company",
  "Individual Buyer",
  "Other",
] as const;

export type BusinessType = typeof BUSINESS_TYPES[number];

// ============================================
// DELIVERY OPTIONS
// ============================================

export const DELIVERY_OPTIONS = [
  "Pickup from warehouse",
  "Delivery within state",
  "Delivery nationwide",
  "Express delivery",
] as const;

export type DeliveryOption = typeof DELIVERY_OPTIONS[number];

// ============================================
// PACKAGING WEIGHTS
// ============================================

export const STANDARD_PACKAGING_WEIGHTS = [1, 2, 3, 5, 10, 25, 50] as const;

export type PackagingWeight = typeof STANDARD_PACKAGING_WEIGHTS[number];

// ============================================
// MINIMUM REQUIREMENTS
// ============================================

export const MIN_SUPPLY_KG = 1000;
export const MIN_FARMING_CAPACITY_KG = 500;
export const MIN_YEARS_EXPERIENCE = 0;
export const MAX_YEARS_EXPERIENCE = 50;

// ============================================
// VALIDATION PATTERNS
// ============================================

export const PHONE_REGEX = /^(0|\+234)[789][01]\d{8}$/;
export const CAC_REGEX = /^(RC|BN|IT)\d{6,8}$/;

// ============================================
// FILE UPLOAD
// ============================================

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// ============================================
// PAGINATION
// ============================================

export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96] as const;

// ============================================
// DASHBOARD ROUTES
// ============================================

export const DASHBOARD_ROUTES = {
  FARMER: "/farmer-dashboard",
  CLUSTER_FARMER: "/cluster-dashboard",
  BUYER: "/buyer-dashboard",
  ADMIN: "/admin-dashboard",
} as const;

// ============================================
// STATUS COLORS
// ============================================

export const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
} as const;

// ============================================
// ANIMATION VARIANTS
// ============================================

// Expo-out: snappy start, silky settle — the signature of premium motion
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const FADE_IN_VARIANT = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// Blur-in slide: the hero effect — elements emerge from below the fold
export const SLIDE_UP_VARIANT = {
  hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
};

export const SCALE_IN_VARIANT = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// Spring pop: for stat numbers and icons — feels alive
export const STAT_ITEM_VARIANT = {
  hidden: { opacity: 0, scale: 0.5, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 22 },
  },
};

// Fast stagger: for dense grids (6+ items) — no awkward wait between tiles
export const STAGGER_CONTAINER_VARIANT = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

// Slower stagger: for 3-column feature/testimonial cards — more theatrical
export const SLOW_STAGGER_CONTAINER_VARIANT = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};
