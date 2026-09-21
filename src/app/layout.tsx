import { inter, openSans } from "./fonts";
import "./globals.css";
import { Toaster } from "sonner";
import { LocationProvider } from "~/lib/location-context";
import { AuthProvider } from "~/lib/auth-context";

export const metadata = {
  metadataBase: new URL("https://agro-chain-bom-vercel.vercel.app"),

  title: {
    template: "%s | AgroChain",
    default: "AgroChain | Catfish Marketplace for Farmers & Buyers",
  },

  description:
    "AgroChain is a digital marketplace connecting cluster catfish farmers with verified bulk buyers. We streamline sourcing, secure payments, and coordinate logistics for fresh, traceable supply.",

  keywords: [
    "catfish",
    "marketplace",
    "farmers",
    "buyers",
    "Nigeria",
    "aquaculture",
    "supply chain",
  ],

  authors: [
    {
      name: "AgroChain Team",
      url: "https://agro-chain-bom-vercel.vercel.app/",
    },
  ],

  creator: "AgroChain Team",
  publisher: "AgroChain",

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

  // PWA / Apple meta
  appleWebApp: {
    capable: true,
    title: "AgroChain",
    statusBarStyle: "default",
  },

  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "AgroChain",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgroChain platform connecting catfish farmers and bulk buyers with secure payments and coordinated delivery",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@AgroChain",
    creator: "@AgroChain",
    images: {
      url: "/twitter-image.png",
      alt: "AgroChain catfish marketplace connecting cluster farmers to verified buyers",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA theme color — matches manifest.ts */}
        <meta name="theme-color" content="#1a5c1a" />

        {/* Apple/iOS PWA tags — Safari ignores the web manifest for these */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AgroChain" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />

        {/* Splash screen color for Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="AgroChain" />
      </head>
      <body className={`${inter.variable} ${openSans.variable} antialiased`}>
        <AuthProvider>
          <LocationProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
