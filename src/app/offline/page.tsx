"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="bg-gray-bg px-section-px flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-theme-green-dark/10 flex h-20 w-20 items-center justify-center rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-theme-green-dark h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3l18 18M8.111 8.111A5.972 5.972 0 006 12c0 3.314 2.686 6 6 6a5.972 5.972 0 003.889-1.111M6.343 6.343A8 8 0 0118 12c0 2.118-.82 4.042-2.172 5.485M1.5 1.5l3.75 3.75M21 12a9 9 0 01-9 9m0 0l-3.75-3.75M12 3a9 9 0 019 9"
            />
          </svg>
        </div>

        <h1 className="font-ubuntu text-heading-colour text-3xl font-bold sm:text-4xl">
          You are offline
        </h1>

        <p className="font-roboto-slab text-text-colour max-w-sm text-base">
          It looks like you have lost your internet connection. Check your
          network and try again.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <button
          onClick={() => window.location.reload()}
          className="font-ubuntu bg-theme-green-dark hover:bg-theme-green-light rounded-full px-6 py-3 text-sm font-semibold text-white transition active:scale-95"
        >
          Try again
        </button>

        <Link
          href="/"
          className="font-ubuntu border-theme-green-dark text-theme-green-dark hover:bg-theme-green-dark rounded-full border px-6 py-3 text-sm font-semibold transition hover:text-white active:scale-95"
        >
          Go home
        </Link>
      </div>

      <p className="font-roboto-slab text-muted-text text-sm">
        Pages you visited before are still available in your cache.
      </p>
    </main>
  );
}
