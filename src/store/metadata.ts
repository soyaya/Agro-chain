
// Static Metadata Template
import type { Metadata } from "next";
export const metadata: Metadata = {
  metadataBase: new URL("https://debridger-bom-vercel.vercel.app/"),

  title: {
    template: "%s | Debridger",
    default: "Debridger | Bridging Farmers to Sellers",
  },
  description:
    "Debridger connects international buyers with verified Nigerian farmers for premium agricultural products. Secure payments, reliable logistics, direct from source.",
  
  keywords: [
    "Debridger", "sellers", "crops",
    "Nigerian agriculture",
    "export crops Nigeria",
    "buy farm produce Africa",
    "agricultural marketplace",
    "sesame seeds export",
    "cashew nuts Nigeria",
    "cocoa beans export",
    "verified farmers"
  ],

  authors: [{
    name: "Debridger Team", 
    url: "https://debridger-bom-vercel.vercel.app/",
  }],
  creator: "Debridger Team",
  publisher: "Debridger",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://debridger-bom-vercel.vercel.app/",
    title: "Debridger | Bridging Farmers to Global Buyers",
    description: "Source premium Nigerian agricultural products directly from verified farmers. Best prices, secure payments, end-to-end logistics.",
    siteName: "Debridger",
    images: [
      {
        url: "/og-image.png",
        width: 1200,  
        height: 630,
        alt: "Debridger - Connecting Global Buyers to Nigerian Farmers",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@Debridger",
    creator: "@Debridger",
    title: "Debridger | Buy Direct from Nigerian Farmers",
    description: "Premium crops. Verified suppliers. Seamless export logistics.",
    images: {
      url: "/twitter-image.png",
      alt: "Debridger Twitter Card",
    },
  },

  robots : {
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
    canonical: "/"
  },

  // Optional but recommended
  verification: {
    google: "your-google-site-verification-code-here",
  },
};
