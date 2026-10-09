import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/lib/context/CartContext";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Debford — Your Automotive World, All in One Place",
    template: "%s | Debford",
  },
  description:
    "Discover, buy, sell, rent, and auction vehicles. Find trusted automotive professionals, purchase parts, and manage your entire vehicle ownership lifecycle with Debford.",
  keywords: [
    "cars for sale",
    "vehicle marketplace",
    "car rental",
    "vehicle auction",
    "automotive services",
    "car parts",
    "buy car",
    "sell car",
    "debford",
  ],
  authors: [{ name: "Debford" }],
  creator: "Debford",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://debford.com",
    siteName: "Debford",
    title: "Debford — Your Automotive World, All in One Place",
    description:
      "A complete digital ecosystem for the vehicle lifecycle. Discover, buy, sell, rent, bid, own, maintain, and upgrade vehicles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Debford — Your Automotive World, All in One Place",
    description:
      "A complete digital ecosystem for the vehicle lifecycle.",
    creator: "@debford",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Debford",
  },
};

// Moved to generateViewport per Next.js 16 requirements
export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#2563eb",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#06090e] text-slate-100" suppressHydrationWarning>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <div className="flex-1 pb-16 lg:pb-0">
              {children}
            </div>
            <Footer />
            <MobileBottomNav />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
