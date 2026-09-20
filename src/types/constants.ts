// Constants for AgroChainMarketPlace
// Centralized constants for consistency across the platform

// ============================================
// FISH TYPES
// ============================================
// Catfish growth-stage / product categories a farmer can list. `value` must
// match the backend's FishType Prisma enum exactly.

export interface FishTypeCategory {
  value: "post" | "juveniles" | "jumbo" | "table_size" | "broodstock" | "dried";
  label: string;
  imageUrl: string;
}

// post/juveniles/jumbo are all fingerling-stage seedling sizes, so they
// share the same representative seedlings photo — table_size/broodstock/
// dried are each their own distinct mature/processed category.
const SEEDLINGS_IMAGE_URL = "https://res.cloudinary.com/erw7cxay/image/upload/v1788775005/Seedlings.webp";

export const FISH_TYPE_CATEGORIES: FishTypeCategory[] = [
  {
    value: "post",
    label: "Post Fingerlings",
    imageUrl: SEEDLINGS_IMAGE_URL,
  },
  {
    value: "juveniles",
    label: "Juveniles",
    imageUrl: SEEDLINGS_IMAGE_URL,
  },
  {
    value: "jumbo",
    label: "Jumbo",
    imageUrl: SEEDLINGS_IMAGE_URL,
  },
  {
    value: "table_size",
    label: "Table Size",
    imageUrl: "https://res.cloudinary.com/erw7cxay/image/upload/v1788775005/Table_size.jpg",
  },
  {
    value: "broodstock",
    label: "Broodstock",
    imageUrl: "https://res.cloudinary.com/erw7cxay/image/upload/v1788775005/Broodstock.jpg",
  },
  {
    value: "dried",
    label: "Dried Catfish",
    imageUrl: "https://res.cloudinary.com/erw7cxay/image/upload/v1788775005/Dry_Fish.jpg",
  },
];

export const FISH_TYPE_OPTIONS = FISH_TYPE_CATEGORIES.map(({ value, label }) => ({
  value,
  label,
}));

export const FISH_TYPES = FISH_TYPE_CATEGORIES.map((c) => c.label);

export type FishType = FishTypeCategory["value"];

export const FISH_VARIANTS = ["Dried", "Jumbo", "Table Size", "Broodstock"] as const;

export type FishVariant = typeof FISH_VARIANTS[number];

// Seedling listings (fish_type = "juveniles" | "post" | "jumbo") are sold and
// priced per piece, not per kg — used wherever a listing/cart item's unit
// needs deriving client-side from just its fishType string.
const SEEDLING_FISH_TYPES = ["juveniles", "post", "jumbo"];
export const isSeedlingFishType = (fishType: string) => SEEDLING_FISH_TYPES.includes(fishType);

export const BASE_PRICE_PER_KG_NAIRA = 3500;

// ============================================
// DELIVERY PHOTO CAPTURE GUIDANCE
// ============================================
// The rider/buyer-facing delivery chain of custody is photo-only (no OTP —
// see riders.controller.ts) — a rider photographs the product at pickup and
// again at handoff, and the buyer compares the two before confirming. Photo
// *content* can't be verified server-side, so what actually enforces "the
// weight/size is legible in frame" is this on-screen guidance, keyed off the
// backend's fish_variant enum (dried/jumbo/table_size/broodstock/seedlings —
// same partition Order.fish_variant, Demand.fish_variant, and
// DEMAND_BRACKET_VARIANTS in buyers.controller.ts already use).
const WEIGHED_FISH_VARIANTS = ["dried", "table_size", "broodstock"];
export const isWeighedFishVariant = (fishVariant: string | null | undefined) =>
  !!fishVariant && WEIGHED_FISH_VARIANTS.includes(fishVariant);

export const WEIGHT_VARIANCE_NOTICE =
  "Weight may vary by 1–20g between pickup and delivery — this is normal and does not indicate a wrong or reduced product.";

export function deliveryPhotoGuidance(fishVariant: string | null | undefined): string {
  return isWeighedFishVariant(fishVariant)
    ? `Make sure the scale reading (kg) is clearly visible in the photo. ${WEIGHT_VARIANCE_NOTICE}`
    : "Make sure a ruler or size marker (cm) is clearly visible next to the product in the photo.";
}

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

export const MIN_SUPPLY_KG = 1;
export const MIN_FARMING_CAPACITY_KG = 500;
export const MIN_YEARS_EXPERIENCE = 0;
export const MAX_YEARS_EXPERIENCE = 50;

// Must match MAX_RESEND_ATTEMPTS in Agro-chain2/src/controllers/auth.controller.ts
export const MAX_OTP_RESEND_ATTEMPTS = 3;

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
// STATUS LABELS & COLORS
// ============================================
// One source of truth for every backend enum value shown to a user, across
// Order.status, Demand.status, PaymentStatus, FulfillmentStage, PayoutStatus,
// WalletTransactionStatus, and ListingStatus (see Agro-chain2/prisma/schema.prisma).
// Values are shared across those enums where the raw string is identical AND
// the meaning is the same in every context it appears (e.g. "pending",
// "cancelled", "processing", "failed", "paid") — none of these enums assign
// conflicting meanings to the same raw string. formatStatus() is the only
// thing that should ever turn a raw status into display text; nothing else
// should call .replace("_", " ") or capitalize() directly.

export const STATUS_LABELS: Record<string, string> = {
  // Order.status
  draft: "Draft",
  payment_pending: "Payment Pending",
  paid: "Paid",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  disputed: "Disputed",
  // Demand.status
  assigned: "Assigned",
  accepted: "Accepted",
  declined: "Declined",
  fulfilled: "Fulfilled",
  // Shared: pending, processing, completed, failed, cancelled, refunded, approved, rejected
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  approved: "Approved",
  rejected: "Rejected",
  reversed: "Reversed",
  // FulfillmentStage
  awaiting_farmer_dispatch: "Awaiting Farmer Dispatch",
  dispatched_to_cluster: "On the Way to Cluster Office",
  at_cluster_office: "At Cluster Office",
  ready_for_pickup: "Ready for Pickup",
  escalated_to_rider: "Escalated to Rider",
  out_for_delivery: "Out for Delivery",
  delivered_awaiting_confirmation: "Delivered — Awaiting Confirmation",
  // ListingStatus
  active: "Active",
  sold: "Sold",
  deleted: "Deleted",
  flagged: "Flagged",
  archived: "Archived",
  expired: "Expired",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  payment_pending: "bg-yellow-100 text-yellow-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  approved: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  fulfilled: "bg-green-100 text-green-800",
  accepted: "bg-green-100 text-green-800",
  active: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  declined: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
  disputed: "bg-red-100 text-red-800",
  flagged: "bg-red-100 text-red-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  escalated_to_rider: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  dispatched_to_cluster: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  delivered_awaiting_confirmation: "bg-blue-100 text-blue-800",
  ready_for_pickup: "bg-blue-100 text-blue-800",
  at_cluster_office: "bg-blue-100 text-blue-800",
  awaiting_farmer_dispatch: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-gray-100 text-gray-800",
  reversed: "bg-gray-100 text-gray-800",
  archived: "bg-gray-100 text-gray-800",
  expired: "bg-gray-100 text-gray-800",
  deleted: "bg-gray-100 text-gray-800",
  sold: "bg-gray-100 text-gray-800",
} as const;

/**
 * Turns a raw backend enum value (snake_case) into display text. Falls back
 * to a title-cased, space-joined version of the raw value for anything not
 * in STATUS_LABELS, so a status added on the backend later never renders as
 * a literal snake_case string with underscores.
 */
export function formatStatus(value: string | null | undefined): string {
  if (!value) return "Unknown";
  if (STATUS_LABELS[value]) return STATUS_LABELS[value];
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function statusColorClass(value: string | null | undefined): string {
  if (!value) return "bg-gray-100 text-gray-800";
  return STATUS_COLORS[value] ?? "bg-gray-100 text-gray-800";
}

// ============================================
// ANIMATION VARIANTS
// ============================================

export const FADE_IN_VARIANT = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const SLIDE_UP_VARIANT = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const SCALE_IN_VARIANT = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const STAGGER_CONTAINER_VARIANT = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
