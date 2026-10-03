import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { Inter } from "next/font/google";
import { VisitorTracker } from "@/src/shared/ui/analytics/VisitorTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = "https://justswifttab.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05070B",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SwiftTab Auto — The Detailing Studio Operating System",
    template: "%s | SwiftTab Auto",
  },
  description:
    "The modern shop floor OS for auto detailing, PPF, and ceramic coating studios. 60-second digital defect intake, live bay dispatch board, 1-tap photo-backed upsells, and zero POS disruption.",
  keywords: [
    "auto detailing software",
    "detailing studio management",
    "PPF shop management software",
    "paint protection film studio software",
    "ceramic coating work order app",
    "vehicle defect intake software",
    "digital defect inspection shield",
    "shop floor bay dispatch board",
    "live detailing kanban board",
    "detailing upsell system",
    "car detailing inspection app",
    "window tint shop software",
    "automotive reconditioning software",
    "detailing shop CRM",
    "XPEL installer workflow software",
  ],
  authors: [{ name: "SwiftTab Technologies", url: SITE_URL }],
  creator: "SwiftTab Auto",
  publisher: "SwiftTab Auto",
  category: "Business Technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    canonical: SITE_URL,
  },
  openGraph: {
    title: "SwiftTab Auto — The Detailing Studio Operating System",
    description:
      "Eliminate walkaround defect disputes, automate shop floor bay dispatch, and unlock +$420/car in photo-backed upsells for high-end auto detailing & PPF studios.",
    url: SITE_URL,
    siteName: "SwiftTab Auto",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo-icon.png`,
        width: 1200,
        height: 630,
        alt: "SwiftTab Auto — The Detailing Studio Operating System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftTab Auto — The Detailing Studio Operating System",
    description:
      "Eliminate walkaround defect disputes, automate shop floor bay dispatch, and unlock +$420/car in photo-backed upsells.",
    images: [`${SITE_URL}/logo-icon.png`],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "SwiftTab Auto",
    statusBarStyle: "black-translucent",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "geo.region": "US",
    "geo.placename": "United States",
    "target-audience": "Automotive Detailing Studios, PPF Installers, Ceramic Coating Specialists, Window Tint Shops",
    "application-name": "SwiftTab Auto",
    "coverage": "Worldwide",
    "distribution": "Global",
    "rating": "General",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-icon.png", type: "image/png", sizes: "48x48 96x96 192x192" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/logo-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://justswifttab.com/#software",
      "name": "SwiftTab Auto",
      "operatingSystem": "Web, iOS, Android, macOS, Windows",
      "applicationCategory": "BusinessApplication",
      "applicationSubCategory": "Automotive Detailing & PPF Shop Operating System",
      "url": "https://justswifttab.com",
      "description":
        "The modern shop floor OS for auto detailing, PPF, and ceramic coating studios. Features 60-second digital defect intake, live bay dispatch board, 1-tap photo-backed upsells, and digital client authorization signatures.",
      "softwareVersion": "2.4.0",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "79",
        "highPrice": "299",
        "offerCount": "3",
        "offers": [
          {
            "@type": "Offer",
            "name": "Starter Studio",
            "price": "79",
            "priceCurrency": "USD",
            "billingDuration": "P1M",
            "description": "Up to 3 service bays, 60-second digital defect shield, mobile client sign-off.",
          },
          {
            "@type": "Offer",
            "name": "Growth Studio",
            "price": "149",
            "priceCurrency": "USD",
            "billingDuration": "P1M",
            "description": "Up to 8 service bays, live dispatch board, 1-tap photo upsells, VIP digital dossier.",
          },
          {
            "@type": "Offer",
            "name": "VIP Enterprise",
            "price": "299",
            "priceCurrency": "USD",
            "billingDuration": "P1M",
            "description": "Unlimited bays, multi-location support, custom branded white-label client portal.",
          },
        ],
      },
      "featureList": [
        "60-Second Digital Defect Walkaround Shield with Touch Canvas Signature",
        "Real-Time Live Bay Kanban Dispatch Board",
        "1-Tap Mobile Photo-Backed Upsell Engine via SMS",
        "VIP Vehicle Digital Dossier & Warranty Certificate",
        "Zero POS Disruption — Works Alongside Existing Credit Card Terminals",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://justswifttab.com/#organization",
      "name": "SwiftTab Auto",
      "url": "https://justswifttab.com",
      "logo": "https://justswifttab.com/logo-icon.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Support",
        "email": "support@justswifttab.com",
        "availableLanguage": ["English"],
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://justswifttab.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is SwiftTab Auto?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "SwiftTab Auto is a dedicated shop floor operating system designed specifically for high-end automotive detailing, Paint Protection Film (PPF), ceramic coating, and window tint studios. It digitizes vehicle intake inspections, coordinates shop floor bay workflows, and drives incremental upsell revenue without replacing your existing POS.",
          },
        },
        {
          "@type": "Question",
          "name": "How does the 60-Second Digital Defect Shield protect detailing studios?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "During vehicle drop-off, technicians use any phone or tablet to tap vehicle panels, photo-document pre-existing scratches, rock chips, dents, and paint depth gauge readings. The vehicle owner signs digitally on the screen, creating an immutable time-stamped inspection record that eliminates customer damage disputes.",
          },
        },
        {
          "@type": "Question",
          "name": "Does SwiftTab Auto require changing my point of sale (POS) or payment processor?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "No. SwiftTab Auto operates strictly as a shop floor execution OS. You keep your existing payment terminal, Stripe, Square, Clover, or merchant processor without paying per-order commissions or processing fees.",
          },
        },
        {
          "@type": "Question",
          "name": "How does the 1-Tap Photo Upsell Engine work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "When a technician uncovers severe paint swirls, rock chips, or interior staining during prep, they snap a photo and select a recommended treatment (e.g. Stage 2 Paint Correction or Windshield PPF). The customer receives an instant mobile approval link with high-resolution photo proof and 1-tap approval, unlocking +$420 per car on average.",
          },
        },
        {
          "@type": "Question",
          "name": "What film and coating brands are compatible with SwiftTab Auto?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "SwiftTab Auto is brand-agnostic and seamlessly integrates into studio workflows utilizing XPEL, 3M, STEK, SunTek, Gyeon Quartz, Modesta, Ceramic Pro, and Kamikaze Collection products.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo-icon.png" type="image/png" sizes="48x48 96x96 192x192" />
        <link rel="apple-touch-icon" href="/logo-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#05070B] text-zinc-100 selection:bg-amber-500/20 selection:text-amber-200">
        <VisitorTracker />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
