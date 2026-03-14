import { inter, openSans } from "./fonts";
import "./globals.css";
import { Toaster } from "sonner";
import { LocationProvider } from "~/lib/location-context";

export const metadata = {
  metadataBase: new URL("https://agro-chain-bom-vercel.vercel.app"),

  title: {
    template: "%s | Agro-chain",
    default: "Agro-chain | Catfish Marketplace for Farmers & Buyers",
  },

  description:
    "Agro-chain is a digital marketplace connecting cluster catfish farmers with verified bulk buyers. We streamline sourcing, secure payments, and coordinate logistics for fresh, traceable supply.",

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
      name: "Agro-chain Team",
      url: "https://agro-chain-bom-vercel.vercel.app/",
    },
  ],

  creator: "Agro-chain Team",
  publisher: "Agro-chain",

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
    locale: "en_NG",
    siteName: "Agro-chain",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Agro-chain platform connecting catfish farmers and bulk buyers with secure payments and coordinated delivery",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@AgroChain",
    creator: "@AgroChain",
    images: {
      url: "/twitter-image.png",
      alt: "Agro-chain catfish marketplace connecting cluster farmers to verified buyers",
    },
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${openSans.variable} antialiased`}>
        <LocationProvider>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </LocationProvider>
      </body>
    </html>
  );
}