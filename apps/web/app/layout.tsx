import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00B87C",
};

export const metadata: Metadata = {
  title: "SwiftTab — Next-Gen QR & Drive-In Dining OS",
  description: "Real-time QR ordering, drive-in car dining, and thermal bill POS platform",
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
