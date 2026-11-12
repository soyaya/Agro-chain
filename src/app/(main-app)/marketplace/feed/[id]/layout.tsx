import type { Metadata } from "next";

const getBackendBase = () =>
  (process.env.BASE_BACKEND_URL ?? "").trim().replace(/\/+$/, "").replace(/\/api$/, "");

interface FeedListingForMetadata {
  brandName?: string;
  categoryLabel?: string;
  pricePerBag?: number;
  clusterFarmerName?: string;
  businessName?: string | null;
  state?: string;
  location?: string;
  quantityAvailable?: number;
  imageUrl?: string | null;
}

function extractListing(payload: unknown): FeedListingForMetadata | null {
  if (!payload || typeof payload !== "object") return null;
  if ("id" in payload) return payload as FeedListingForMetadata;
  const r = payload as { listing?: FeedListingForMetadata; data?: { listing?: FeedListingForMetadata } | FeedListingForMetadata };
  const data = r.data as { listing?: FeedListingForMetadata } | FeedListingForMetadata | undefined;
  return r.listing ?? (data && "listing" in data ? data.listing : (data as FeedListingForMetadata)) ?? null;
}

const FALLBACK_IMAGE = "https://res.cloudinary.com/erw7cxay/image/upload/v1788775005/Seedlings.webp";

// Same per-listing OG metadata as the fish listing detail page — see that
// layout.tsx for the full rationale.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const fallback: Metadata = {
    title: "Feed Listing",
    description: "View full details of this fish feed listing on Agro-chain's Feed Hub.",
    keywords: ["fish feed", "catfish feed Nigeria", "floating feed", "sinking feed", "aquaculture feed", "feed hub"],
    robots: { index: true, follow: true },
    openGraph: {
      title: "Feed Listing – Agro-chain Feed Hub",
      description: "Detailed view of a fish feed listing from a verified cluster farmer.",
      url: `/marketplace/feed/${id}`,
      type: "website",
      locale: "en_NG",
      images: [{ url: FALLBACK_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Feed Listing – Agro-chain Feed Hub",
      description: "Detailed view of a fish feed listing from a verified cluster farmer.",
      images: [FALLBACK_IMAGE],
    },
  };

  const base = getBackendBase();
  if (!base) return fallback;

  try {
    const res = await fetch(`${base}/api/feed-listings/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return fallback;
    const listing = extractListing(await res.json());
    if (!listing) return fallback;

    const seller = listing.businessName || listing.clusterFarmerName || "a verified cluster farmer";
    const priceLine = listing.pricePerBag ? `₦${Number(listing.pricePerBag).toLocaleString()} per bag` : null;
    const locationLine = [listing.location, listing.state].filter(Boolean).join(", ");
    const availabilityLine = listing.quantityAvailable != null ? `${listing.quantityAvailable} bags available` : null;

    const title = `${listing.brandName ?? listing.categoryLabel ?? "Fish Feed"} from ${seller} – Agro-chain`;
    const description = [priceLine, availabilityLine, locationLine && `Located in ${locationLine}`]
      .filter(Boolean)
      .join(" · ") || "Fish feed supply from a verified cluster farmer on Agro-chain.";
    const image = listing.imageUrl || FALLBACK_IMAGE;

    return {
      title,
      description,
      keywords: fallback.keywords,
      robots: fallback.robots,
      openGraph: {
        title,
        description,
        url: `/marketplace/feed/${id}`,
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
