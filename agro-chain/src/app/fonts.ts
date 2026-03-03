
import { Inter, Open_Sans } from "next/font/google";

// Inter font
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", 
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Open Sans font
export const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});