import { Inter, Open_Sans, Ubuntu, Roboto_Slab } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Self-hosted via next/font so both fonts are available offline (PWA).
export const ubuntu = Ubuntu({
  subsets: ["latin"],
  variable: "--font-ubuntu",
  display: "swap",
  weight: ["300", "400", "500", "700"],
});

export const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});
