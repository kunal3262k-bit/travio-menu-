import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = "https://justswifttab.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00B87C",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SwiftTab — QR Table Ordering & Kitchen Display for Indian Restaurants",
    template: "%s | SwiftTab",
  },
  description:
    "SwiftTab lets customers order from their phone by scanning a QR code on the table. Orders reach your kitchen in real time. Staff stay in control of service and UPI or cash payment. No customer app, no per-order commission.",
  keywords: [
    "QR ordering system for restaurants",
    "restaurant QR menu",
    "QR table ordering",
    "restaurant ordering system India",
    "restaurant KDS",
    "restaurant self ordering",
    "waiter ordering system",
    "drive-in ordering",
    "car-side ordering",
    "restaurant software Delhi NCR",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "SwiftTab — QR Table Ordering & Kitchen Display",
    description:
      "Customers scan a QR code and order from their own phone. Orders reach the kitchen in real time. No customer app, no per-order commission.",
    url: SITE_URL,
    siteName: "SwiftTab",
    locale: "en_IN",
    type: "website",
    images: [{ url: `${SITE_URL}/logo-full.png`, width: 1200, height: 630, alt: "SwiftTab" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftTab — QR Table Ordering & Kitchen Display",
    description:
      "Customers scan a QR code and order from their own phone. Orders reach the kitchen in real time. No customer app, no per-order commission.",
    images: [`${SITE_URL}/logo-full.png`],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "SwiftTab",
    statusBarStyle: "default",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/logo-icon.png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/logo-icon.png",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
