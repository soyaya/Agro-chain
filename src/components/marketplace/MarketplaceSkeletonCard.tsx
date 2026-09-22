"use client";

// Skeleton placeholder that matches the exact shape of MarketplaceCard.
// Shown while the backend wakes up (Render cold start) so the page feels
// responsive instead of showing a blank loading spinner.
export function MarketplaceSkeletonCard() {
  return (
    <div className="flex flex-col rounded-3xl border border-(--border-gray) bg-(--white) overflow-hidden animate-pulse">
      {/* Image area */}
      <div className="h-48 w-full bg-gray-200" />

      <div className="flex flex-col gap-3 p-5">
        {/* Fish type + badge */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 rounded-full bg-gray-200" />
          <div className="h-5 w-16 rounded-full bg-gray-200" />
        </div>

        {/* Business name */}
        <div className="h-4 w-36 rounded-full bg-gray-200" />

        {/* Location */}
        <div className="h-4 w-28 rounded-full bg-gray-200" />

        {/* Divider */}
        <div className="h-px w-full bg-gray-100" />

        {/* Price + quantity row */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-20 rounded-full bg-gray-200" />
          <div className="h-4 w-16 rounded-full bg-gray-200" />
        </div>

        {/* Button */}
        <div className="h-10 w-full rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}

export function MarketplaceSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <MarketplaceSkeletonCard key={i} />
      ))}
    </div>
  );
}
