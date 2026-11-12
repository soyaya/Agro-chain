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
  totalAvailableKg?: number;
  unit?: "kg" | "piece";
  imageUrl?: string | null;
}

function extractListing(payload: unknown): ListingForMetadata | null {
  if (!payload || typeof payload !== "object") return null;
  if ("id" in payload) return payload as ListingForMetadata;
  const r = payload as { listing?: ListingForMetadata; data?: { listing?: ListingForMetadata } | ListingForMetadata };
  const data = r.data as { listing?: ListingForMetadata } | ListingForMetadata | undefined;
  return r.listing ?? (data && "listing" in data ? data.listing : (data as ListingForMetadata)) ?? null;
}

const FALLBACK_IMAGE = "https://res.cloudinary.com/erw7cxay/image/upload/v1788775005/Seedlings.webp";

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
    const seller = listing.businessName || listing.clusterFarmerName || "a verified cluster farmer";
    const priceLine = listing.pricePerKg
      ? `₦${Number(listing.pricePerKg).toLocaleString()}${listing.unit === "piece" ? " per piece" : " per kg"}`
      : null;
    const locationLine = [listing.location, listing.state].filter(Boolean).join(", ");
    const availabilityLine =
      listing.totalAvailableKg != null
        ? `${listing.totalAvailableKg}${listing.unit === "piece" ? " pieces" : "kg"} available`
        : null;

    const title = `${fishLabel} from ${seller} – Agro-chain`;
    const description = [priceLine, availabilityLine, locationLine && `Located in ${locationLine}`]
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
