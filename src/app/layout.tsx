import { inter, openSans, ubuntu, robotoSlab } from "./fonts";
import "./globals.css";
import { Toaster } from "sonner";
import { LocationProvider } from "~/lib/location-context";
import { AuthProvider } from "~/lib/auth-context";
import { PlatformSettingsProvider } from "~/context/PlatformSettingsContext";

export const viewport = {
  themeColor: "#1b4332",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  metadataBase: new URL("https://agro-chain.com"),

  title: {
    template: "%s | Agro-chain",
    default: "Agro-chain | Nigeria's Catfish Marketplace",
  },

  description:
    "Agro-chain is a digital marketplace connecting verified catfish farmers and cluster aggregators with bulk buyers across Nigeria. Secure Paystack escrow, admin-set pricing, and coordinated delivery.",

  keywords: [
    "catfish marketplace Nigeria",
    "buy catfish online",
    "fresh catfish supply",
    "catfish farmers Nigeria",
    "bulk catfish buyers",
    "cluster farmers",
    "aquaculture marketplace",
    "Paystack escrow",
    "agro-chain",
    "fish supply chain",
    "catfish fingerlings",
    "table size catfish",
  ],

  authors: [
    { name: "Olorunshogo M. Bamtefa", url: "https://agro-chain.com" },
    { name: "Stephanie Nwankwo", url: "https://agro-chain.com" },
    { name: "David David", url: "https://agro-chain.com" },
  ],

  creator: "Agro-chain",
  publisher: "Agro-chain",

  category: "Agriculture",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://agro-chain.com",
  },

  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://agro-chain.com",
    siteName: "Agro-chain",
    title: "Agro-chain | Nigeria's Catfish Marketplace",
    description:
      "Connecting verified catfish farmers to bulk buyers across Nigeria. Secure Paystack payments, admin-set pricing, full supply chain traceability.",
    images: [
      {
        url: "/images/og-hero.png",
        width: 1200,
        height: 630,
        alt: "Agro-chain - Nigeria's catfish marketplace connecting verified farmers to bulk buyers",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image" as const,
    site: "@AgroChainNG",
    creator: "@AgroChainNG",
    title: "Agro-chain | Nigeria's Catfish Marketplace",
    description:
      "Buy and sell catfish with confidence. Verified farmers, secure Paystack escrow, fair pricing across Nigeria.",
    images: [
      {
        url: "/images/og-hero.png",
        alt: "Agro-chain catfish marketplace",
        width: 1200,
        height: 630,
      },
    ],
  },

  verification: {
    google: "",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent" as const,
    title: "Agro-chain",
    startupImage: "/favicon_io/apple-touch-icon.png",
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${openSans.variable} ${ubuntu.variable} ${robotoSlab.variable} antialiased`}
      >
        <AuthProvider>
          <PlatformSettingsProvider>
            <LocationProvider>
              {children}
              <Toaster position="top-center" richColors closeButton />
            </LocationProvider>
          </PlatformSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
