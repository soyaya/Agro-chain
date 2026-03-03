// import Header from "~/components/PageLanding/Header";
// import SubscribeSection from "~/components/PageLanding/SubscribeSection";
// import Footer from "~/components/PageLanding/Footer";

export const metadata = {
  metadataBase: new URL("https://Agro-chain-bom-vercel.vercel.app"),

  title: {
    template: "%s | Agro-chain",
    default: "Agro-chain | Catfish Marketplace for Farmers & Buyers",
  },

  description:
    "Agro-chain is a digital marketplace connecting cluster catfish farmers with verified bulk buyers. We streamline sourcing, secure payments, and coordinate logistics for fresh, traceable supply.",

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
    locale: "en_US",
    siteName: "Agro-chain",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Agro-chain - Premium Nigerian Crops",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@Agro-chain",
    creator: "@Agro-chain",
    images: {
      url: "/twitter-image.png",
      alt: "Agro-chain Twitter Card",
    },
  },
};

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* <Header /> */}
      <main>{children}</main>
      {/* <SubscribeSection />
      <Footer /> */}
    </>
  );
}
