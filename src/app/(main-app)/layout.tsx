import Header from "~/components/Header";
import Footer from "~/components/Footer";

export const metadata = {
  // metadataBase, title.template, openGraph.siteName, openGraph.locale,
  // twitter.card, twitter.site, twitter.creator are all inherited from root layout

  title: "Agro-chain | Catfish Marketplace for Farmers & Buyers",

  description:
    "Agro-chain is a digital marketplace connecting cluster catfish farmers with verified bulk buyers. We streamline sourcing, secure payments, and coordinate logistics for fresh, traceable supply.",

  keywords: [
    "catfish marketplace",
    "buy catfish",
    "fresh catfish Nigeria",
    "bulk catfish supply",
    "aquaculture marketplace",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    url: "https://agro-chain.com",
    title: "Agro-chain | Catfish Marketplace for Farmers & Buyers in Nigeria",
    description:
      "Connect with verified catfish farmers and bulk buyers on Agro-chain. Fresh, traceable catfish supply with secure payments and coordinated logistics.",
  },

  twitter: {
    title: "Agro-chain | Catfish Marketplace for Farmers & Buyers in Nigeria",
    description:
      "Connect with verified catfish farmers and bulk buyers on Agro-chain. Fresh, traceable catfish supply with secure payments and coordinated logistics.",
  },
};

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="layout-max-width relative min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
