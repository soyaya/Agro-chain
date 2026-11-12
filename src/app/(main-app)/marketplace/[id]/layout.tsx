import type { Metadata } from "next";

const getBackendBase = () =>
  (process.env.BASE_BACKEND_URL ?? "").trim().replace(/\/+$/, "").replace(/\/api$/, "");

interface ListingForMetadata {
  fishType?: string;
  businessName?: string | null;
  clusterFarmerName?: string;
  pricePerKg?: number;
  location?: string;
  state?: string;
  localGovernment?: string;
  ward?: string | null;
  subCommunity?: string | null;
  totalAvailableKg?: number;
  unit?: "kg" | "piece";
  imageUrl?: string | null;
  sizeMinCm?: number | null;
  sizeMaxCm?: number | null;
  weightMinGrams?: number | null;
  weightMaxGrams?: number | null;
  harvestDate?: string | null;
  packaging?: { weightKg?: number | null; quantity?: number }[];
}

function extractListing(payload: unknown): ListingForMetadata | null {
  if (!payload || typeof payload !== "object") return null;
  if ("id" in payload) return payload as ListingForMetadata;
  const r = payload as { listing?: ListingForMetadata; data?: { listing?: ListingForMetadata } | ListingForMetadata };
  const data = r.data as { listing?: ListingForMetadata } | ListingForMetadata | undefined;
  return r.listing ?? (data && "listing" in data ? data.listing : (data as ListingForMetadata)) ?? null;
}

const FALLBACK_IMAGE = "https://res.cloudinary.com/erw7cxay/image/upload/v1788775005/Seedlings.webp";

// A short promotional line per fish type — this is what turns a shared
// listing link into a mini-ad rather than just a product card, which is
// the whole point of the share button for marketing purposes (status
// updates, social posts). Keep each one short: it sits right next to the
// real price/location info in the preview, and social platforms truncate
// long descriptions.
const FISH_TYPE_TAGLINES: Record<string, string> = {
  jumbo: "Big, fresh, and farm-raised — delivered straight to you.",
  table_size: "Fresh off the farm, ready for your pot today.",
  broodstock: "Premium breeding stock from a verified cluster farmer.",
  dried: "Sun-dried and ready to cook — no middlemen, no markup.",
  juveniles: "Healthy seedlings, farm to pond, verified quality.",
  post: "Healthy seedlings, farm to pond, verified quality.",
};
const DEFAULT_TAGLINE = "Farm to you — fresh, verified, and delivered.";

// Dynamic per-listing so sharing a specific listing link (via the share
// icon on the detail page) actually unfurls a rich preview — the exact
// item's photo, fish type, price, and location — on WhatsApp/Twitter/
// Facebook/iMessage, instead of every shared listing showing the same
// generic "Fish Listing" card with no image.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const fallback: Metadata = {
    title: "Listing Details",
    description:
      "View full details of this fish supply listing on Agro-chain — including fish type, available quantity, packaging options, price per kg, delivery options, and seller information.",
    keywords: [
      "catfish listing",
      "buy catfish",
      "catfish price Nigeria",
      "fresh catfish",
      "aquaculture product",
      "fish supply listing",
      "cluster farmer fish",
    ],
    robots: { index: true, follow: true },
    openGraph: {
      title: "Fish Listing – Agro-chain Marketplace",
      description: "Detailed view of a verified cluster farmer's fish supply listing.",
      url: `/marketplace/${id}`,
      type: "website",
      locale: "en_NG",
      images: [{ url: FALLBACK_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Fish Listing – Agro-chain Marketplace",
      description: "Detailed view of a verified cluster farmer's fish supply listing.",
      images: [FALLBACK_IMAGE],
    },
  };

  const base = getBackendBase();
  if (!base) return fallback;

  try {
    const res = await fetch(`${base}/api/marketplace/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return fallback;
    const listing = extractListing(await res.json());
    if (!listing) return fallback;

    const fishLabel = listing.fishType
      ? listing.fishType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Fish";
    const priceLine = listing.pricePerKg
      ? `₦${Number(listing.pricePerKg).toLocaleString()}${listing.unit === "piece" ? " per piece" : " per kg"}`
      : null;
    const communityName = listing.subCommunity || listing.ward || listing.location;
    const locationLine = [communityName, listing.state].filter(Boolean).join(", ");
    const availabilityLine =
      listing.totalAvailableKg != null
        ? `${listing.totalAvailableKg}${listing.unit === "piece" ? " pieces" : "kg"} available`
        : null;
    // Pack weight and biological size/weight range make the description
    // specific to THIS listing rather than just the shared fish-type
    // tagline below — two table-size listings from different farmers will
    // differ here. Pack weight is what a buyer actually shops by (how the
    // product is bagged); size/weight-in-grams is only set for some listings
    // (e.g. seedlings) and is a bonus detail when present.
    const packWeightKg = listing.packaging?.[0]?.weightKg;
    const packLine =
      packWeightKg != null && listing.unit !== "piece" ? `${packWeightKg}kg pack` : null;
    const sizeLine =
      listing.sizeMinCm != null && listing.sizeMaxCm != null
        ? `${listing.sizeMinCm}-${listing.sizeMaxCm}cm`
        : null;
    const weightLine =
      listing.weightMinGrams != null && listing.weightMaxGrams != null
        ? `${listing.weightMinGrams}-${listing.weightMaxGrams}g`
        : null;
    const specLine = [packLine, sizeLine, weightLine].filter(Boolean).join(", ");

    const tagline = (listing.fishType && FISH_TYPE_TAGLINES[listing.fishType]) || DEFAULT_TAGLINE;
    const title = `${fishLabel} – Agro-chain`;
    // Tagline leads the description — this is the "ad" part a buyer sees
    // the instant the preview unfurls — but everything after it (spec,
    // price, availability, location) is pulled straight from this
    // specific listing, so no two listings share the same description.
    const description =
      [tagline, specLine, priceLine, availabilityLine, locationLine && `Located in ${locationLine}`]
        .filter(Boolean)
        .join(" · ") || "Fresh catfish supply from a verified cluster farmer on Agro-chain.";
    const image = listing.imageUrl || FALLBACK_IMAGE;

    return {
      title,
      description,
      keywords: fallback.keywords,
      robots: fallback.robots,
      openGraph: {
        title,
        description,
        url: `/marketplace/${id}`,
        type: "website",
        locale: "en_NG",
        images: [{ url: image, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return fallback;
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
