"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
  children: ReactNode;
}

type AuthRouteKey = "authentication" | "register" | "login";

const routeTitleMap: Record<AuthRouteKey, string> = {
  authentication: "Authentication",
  register: "Register",
  login: "Log In",
};

const metadata = {
  metadataBase: new URL("https://debridger-bom-vercel.vercel.app"),

  title: {
    template: "%s | Debridger",
    default: "Debridger | Bridging Farmers to Global Buyers",
  },

  description:
    "Premium Nigerian agricultural products. Verified farmers. Secure payments. Direct from source.",

  authors: [
    {
      name: "Debridger Team",
      url: "https://debridger-bom-vercel.vercel.app/",
    },
  ],

  creator: "Debridger Team",
  publisher: "Debridger",

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

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Debridger",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Debridger - Premium Nigerian Crops",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@Debridger",
    creator: "@Debridger",
    images: {
      url: "/twitter-image.png",
      alt: "Debridger Twitter Card",
    },
  },
};

export default function AuthLayout({ children }: AuthLayoutProps) {
   const pathname = usePathname();

  const title = useMemo(() => {
    if (!pathname) return "Authentication";

    const segments = pathname.split("/").filter(Boolean);

    // If route is just /authentication
    if (segments.length === 1 && segments[0] === "authentication") {
      return routeTitleMap.authentication;
    }

    // If nested like /authentication/register
    const lastSegment = segments[segments.length - 1] as AuthRouteKey;

    return routeTitleMap[lastSegment] ?? "Authentication";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50/40 dark:bg-gray-950/40 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container-max-width px-(--section-px) sm:px-(--section-px-sm) lg:px-(--section-px-lg) py-3 flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ease-in-out duration-300">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg lg:text-xl text-center mx-auto font-semibold tracking-tight">{title}</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full h-full">
        <div className="w-full container-max-width px-(--section-px) py-(--section-py) sm:py-(--section-py-sm) lg:py-(--section-py-lg) sm:px-(--section-px-sm) lg:px-(--section-px-lg)">{children}</div>
      </main>
    </div>
  );
}