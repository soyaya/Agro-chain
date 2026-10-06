import { apiFetch } from "~/lib/api";

// === Types

export interface FeedCategory {
  id: string;
  label: string;
  minPelletSizeMm: number;
  maxPelletSizeMm: number;
  // Only present for a cluster/admin caller — see feed.controller.ts's
  // getFeedCategories, which omits these for a buyer/plain-farmer request.
  markupType?: "percentage" | "flat";
  markupValue?: number;
}

export interface FeedListing {
  id: string;
  clusterFarmerId: string;
  clusterFarmerName: string;
  businessName: string | null;
  clusterFarmerContact: string;
  feedCategoryId: string;
  categoryLabel: string;
  minPelletSizeMm: number;
  maxPelletSizeMm: number;
  pelletForm: "floating" | "sinking";
  brandName: string;
  proteinPercent: number | null;
  bagWeightKg: number;
  // The marked-up buyer-facing price — the cluster farmer's own take is
  // never exposed to the frontend at all (see feed.controller.ts).
  pricePerBag: number;
  quantityAvailable: number;
  description: string | null;
  location: string;
  state: string;
  localGovernment: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
}

export interface FeedListingsResponse {
  status: string;
  data: {
    listings: FeedListing[];
    pagination?: { total: number; page: number; limit: number; totalPages: number };
  };
}

export interface FeedListingResponse {
  status: string;
  data: { listing: FeedListing & { images: { image_url: string; is_primary: boolean }[] } };
}

export interface FeedCategoriesResponse {
  status: string;
  data: { categories: FeedCategory[] };
}

export interface FeedFiltersQuery {
  feedCategoryId?: string;
  pelletForm?: "floating" | "sinking";
  brand?: string;
  state?: string;
  lga?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CreateFeedListingPayload {
  feedCategoryId: string;
  pelletForm: "floating" | "sinking";
  brandName: string;
  proteinPercent?: number;
  bagWeightKg: number;
  clusterPricePerBag: number;
  quantityAvailable: number;
  description?: string;
}

// === Feed Service

export const feedService = {
  /** Admin-managed category catalog — the cluster-only create form's dropdown. */
  getFeedCategories(): Promise<FeedCategoriesResponse> {
    return apiFetch<FeedCategoriesResponse>("/feed-categories");
  },

  /** Browse feed listings (public — buyer-facing Feed Hub tab). */
  getFeedListings(filters?: FeedFiltersQuery): Promise<FeedListingsResponse> {
    const params = new URLSearchParams();
    if (filters?.feedCategoryId) params.set("feedCategoryId", filters.feedCategoryId);
    if (filters?.pelletForm) params.set("pelletForm", filters.pelletForm);
    if (filters?.brand) params.set("brand", filters.brand);
    if (filters?.state) params.set("state", filters.state);
    if (filters?.lga) params.set("lga", filters.lga);
    if (filters?.minPrice != null) params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
    if (filters?.page != null) params.set("page", String(filters.page));
    if (filters?.limit != null) params.set("limit", String(filters.limit));

    const query = params.toString();
    return apiFetch<FeedListingsResponse>(query ? `/feed-listings?${query}` : "/feed-listings");
  },

  getFeedListingById(feedListingId: string): Promise<FeedListingResponse> {
    return apiFetch<FeedListingResponse>(`/feed-listings/${feedListingId}`);
  },

  /** Cluster-only — backend rejects any other role with 403. */
  createFeedListing(payload: CreateFeedListingPayload) {
    return apiFetch<{ status: string; message: string; data: { listing: unknown } }>("/feed-listings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
