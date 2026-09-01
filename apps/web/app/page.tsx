import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ChefHat,
  CreditCard,
  Flame,
  IndianRupee,
  Layers,
  Menu as MenuIcon,
  MessageSquare,
  Plus,
  Printer,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Utensils,
  Wallet,
  Activity,
  ArrowRight,
  Split,
  Eye
} from "lucide-react";
import DemoModal from "./components/DemoModal";
import ContactLink from "./components/ContactLink";
import Navbar from "./components/Navbar";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/site-config";
import { demoOrders, demoRestaurant } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SwiftTab — Next-Gen 3D QR Dining & Revenue Engine for Restaurants",
  description:
    "Transform flat menus into interactive 3D visual showcases with auto-generated AI studio food photos, live macro tracking, smart pairing upsells (+20% order value), 1-tap WhatsApp billing, and automated 5-star Google review protection.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SwiftTab — Next-Gen 3D QR Dining & Kitchen Intelligence",
    description:
      "Stunning AI studio food photography, interactive 3D dish cards, real-time macro tracking, and zero commission QR ordering for modern restaurants.",
    url: "https://justswifttab.com",
    siteName: "SwiftTab",
    type: "website",
    images: [{ url: "https://justswifttab.com/logo-full.png", width: 1200, height: 630, alt: "SwiftTab" }],
  },
};

const xFactorFeatures = [
  {
    icon: Sparkles,
    badge: "AI Food Studio & 3D Cards",
    title: "Mouthwatering 3D Interactive Dish Cards",
    description:
      "Turn plain text into magazine-quality studio photography with real-time 3D parallax tilt, dynamic lighting glare, steam particles on sizzling dishes, and chef's provenance stories.",
    impact: "+32% customer engagement vs flat PDF menus",
    color: "from-purple-500/10 to-pink-500/10 border-purple-200"
  },
  {
    icon: Activity,
    badge: "Nutrition & Macro Intelligence",
    title: "Live Calories, Protein & Dietary Filters",
    description:
      "Attract gym-goers, keto diners, and health-conscious guests with instant calories, protein (g), carbs, and allergen transparency, backed by a live table nutrition accumulator.",
    impact: "Captures high-value fitness & diet demographics",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-200"
  },
  {
    icon: Flame,
    badge: "Smart AI Pairing Upsells",
    title: "Intelligent Add-On Suggestions",
    description:
      "Automatically recommend high-margin chef pairings, sides, and signature desserts before checkout with social proof ('84% of guests pair this with Garlic Naan & Cold Coffee').",
    impact: "Proven +18% to +24% increase in Average Order Value",
    color: "from-amber-500/10 to-orange-500/10 border-amber-200"
  },
  {
    icon: Star,
    badge: "Reputation & CRM Engine",
    title: "5-Star Google Review Shield & WhatsApp Bill",
    description:
      "Send itemized digital receipts straight to customer WhatsApp to capture real guest numbers. Route 4–5 star ratings to Google Maps, while capturing 1–3 star complaints privately.",
    impact: "Builds a repeat customer list and protects public ratings",
    color: "from-blue-500/10 to-indigo-500/10 border-blue-200"
  }
];

const howItWorks = [
  {
    step: "1",
    title: "Scan & AI Auto-Enrich",
    text: "Upload a photo of your paper menu. Our AI instantly extracts dishes, prices, studio photos, and accurate calorie/macro profiles in under 60 seconds.",
  },
  {
    step: "2",
    title: "Place QR Stands on Tables",
    text: "Print high-res QR codes for your tables and car-side drive-in spots. Guests scan with any phone camera—no app download required.",
  },
  {
    step: "3",
    title: "Guests Experience 3D Menu",
    text: "Diners explore tiltable 3D dish cards, check macros, filter by dietary preferences, and add smart chef pairings in 1 tap.",
  },
  {
    step: "4",
    title: "Orders Flash to Kitchen KDS",
    text: "Orders instantly appear on your kitchen display with audio chimes, item modifiers, and preparation timers—zero waiter delays.",
  },
  {
    step: "5",
    title: "Direct UPI & Table Bill Split",
    text: "Guests split the bill equally or pay directly via their own UPI app. 100% of the money goes straight to your bank with 0% commission.",
  },
  {
    step: "6",
    title: "WhatsApp Bill & 5★ Review Boost",
    text: "Customers receive their digital receipt on WhatsApp and happy diners are routed to leave 5-star reviews on Google Maps.",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    priceInr: "₹2,999",
    priceUsd: "$49",
    period: "/month",
    description: "Essential QR table ordering and real-time kitchen display for cafes and bistros.",
    popular: false,
    features: [
      "Unlimited table QR ordering",
      "Real-time Kitchen Display System (KDS)",
      "Waiter call & bill request screens",
      "On-device 60-second paper menu scanner",
      "Direct UPI & Cash settlement (0% commission)",
      "Customizable categories & sold-out toggles",
      "Live order audio alerts"
    ],
    cta: "Start 3-Day Free Trial",
    badge: "Core Operations"
  },
  {
    name: "Growth",
    priceInr: "₹5,999",
    priceUsd: "$89",
    period: "/month",
    description: "The complete visual dining & revenue engine that drives higher table spend and diner wow-factor.",
    popular: true,
    features: [
      "Everything in Starter, plus:",
      "AI Studio Food Photography Pipeline (150+ dishes)",
      "Interactive 3D Dish Cards with Parallax Tilt & Steam",
      "AI Nutrition & Macro Engine (Calories, Protein, Carbs, Fats)",
      "Dynamic Dietary Filter Bar (High Protein, Keto, Vegan)",
      "Smart Pairing Upsells (+20% Average Order Value)",
      "1-Tap WhatsApp Digital Bill & Phone Capture",
      "Live Table Nutrition Meter for Guests"
    ],
    cta: "Launch Growth Experience",
    badge: "Most Popular — Highest ROI"
  },
  {
    name: "VIP Enterprise",
    priceInr: "₹9,999",
    priceUsd: "$149",
    period: "/month",
    description: "Premium end-to-end dining experience with automated reputation shielding and multi-user bill splitting.",
    popular: false,
    features: [
      "Everything in Growth, plus:",
      "5-Star Google Review Shield (Private manager complaint alerts)",
      "Multi-User Table Bill Splitter with dynamic UPI QR codes",
      "Car-Side Drive-In Ordering with vehicle number tracking",
      "Custom Branded Acrylic QR Table Stands (Kit included)",
      "Advanced Platform Analytics & Dish Reorder Insights",
      "Dedicated 24/7 VIP Phone & WhatsApp Support",
      "Same-Day Custom Menu Digitization Service"
    ],
    cta: "Get VIP Enterprise",
    badge: "Full Power & Reputation"
  }
];

const faqs = [
  {
    q: "How does the AI Studio Food Photography work?",
    a: "When you upload your paper menu or type in dishes, our culinary AI studio engine automatically matches high-resolution, commercial-grade food photography for over 150 popular dishes. You can also generate multi-angle studio shots (front angle, top-down, close-up) or upload your own custom food photos at any time.",
  },
  {
    q: "How accurate is the AI Macro & Nutrition Intelligence?",
    a: "Our nutrition engine uses culinary macro data (calories, protein, healthy fats, net carbs, fiber, and common allergens) tailored for Indian and international cuisines. Restaurant owners can also adjust or override any specific macro values directly in the admin dashboard.",
  },
  {
    q: "Do customers need to download an app?",
    a: "No. The QR code opens directly in any standard phone browser (Safari, Chrome, etc.) in under a second. There is zero friction, no app to install, and no account required for diners.",
  },
  {
    q: "How does the 5-Star Google Review Shield work?",
    a: "When customers tap to leave feedback, diners giving 4 or 5 stars are seamlessly redirected to your restaurant's official Google Maps review page. Guests giving 1 to 3 stars are routed to a private feedback form that instantly notifies the manager via WhatsApp, giving you a chance to resolve the issue before a negative public review is posted.",
  },
  {
    q: "How does payment work? Do you take a commission?",
    a: "SwiftTab charges 0% commission on orders. Customers pay you directly via your restaurant's UPI QR code or in cash. Money goes straight into your bank account without middleman delays.",
  },
  {
    q: "What hardware is required?",
    a: "No proprietary or expensive POS hardware is needed. The kitchen display and staff screens run in any modern web browser on any phone, tablet, or laptop. Kitchen tickets can be printed using your existing standard thermal printer.",
  },
  {
    q: "Is there a long-term contract or lock-in?",
    a: "No contracts and no lock-in. We offer a 3-day risk-free live trial so you can experience the speed, guest excitement, and revenue increase live at your tables. You can cancel at any time with a single click.",
  }
];

export default function Home() {
  const phoneItems = [
    demoRestaurant.categories[0].items[0],
    demoRestaurant.categories[0].items[1],
    demoRestaurant.categories[1].items[0],
  ];
  const previewOrder = demoOrders[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "SwiftTab",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Next-Gen 3D QR Table Ordering, AI Studio Food Photography, Macro Intelligence, and Kitchen Display System for modern restaurants.",
            offers: { "@type": "Offer", price: "5999", priceCurrency: "INR", description: "Growth Monthly subscription" },
          }),
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-purple-500/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-300 shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              <span>AI Studio Photography · 3D Cards · Macro Tracking · 0% Commission</span>
            </div>

            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl">
              Turn Flat Menus Into an <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                Unforgettable 3D Dining Experience.
              </span>
            </h1>

            <p className="text-lg leading-relaxed text-slate-300 max-w-2xl font-medium">
              Command higher table spends, eliminate ordering mistakes, and wow your diners with auto-generated studio food photos, live nutrition tracking, smart AI pairings (+20% average order value), 1-tap WhatsApp billing, and automated 5-star Google review protection.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/register"
                className="rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 px-8 py-4 text-center text-lg font-black text-white shadow-xl shadow-purple-600/25 transition-all hover:scale-[1.02] hover:shadow-purple-600/40 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Launch Your 3D Menu</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <DemoModal />
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>60s AI Menu Import</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>+22% Table Spend</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>5★ Review Shield</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>0% Commission</span>
              </div>
            </div>
          </div>

          {/* Interactive Phone & Visual Preview */}
          <div className="lg:col-span-5 relative">
            <ProductPreview phoneItems={phoneItems} previewOrder={previewOrder} />
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="border-y border-slate-800 bg-slate-900/60 py-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none md:grid md:grid-cols-6 md:gap-4 md:pb-0 text-center">
            {[
              { title: "AI Food Studio", desc: "150+ HD dishes" },
              { title: "3D Parallax Cards", desc: "Interactive depth" },
              { title: "Live Macro Meter", desc: "Calories & protein" },
              { title: "Smart Upsells", desc: "+20% order value" },
              { title: "WhatsApp CRM", desc: "1-tap bill capture" },
              { title: "Google Shield", desc: "Automated 5★ reviews" }
            ].map((f, i) => (
              <div key={f.title} className="flex-1 shrink-0 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <p className="text-xs font-black text-white">{f.title}</p>
                <p className="text-[11px] text-purple-300 font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 4 X-Factors Showcase */}
      <section id="features" className="py-24 px-6 relative bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400">The SwiftTab Advantage</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Four High-Impact X-Factors That Drive Measurable ROI
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Move beyond basic commodity QR code menus. SwiftTab gives restaurant owners a state-of-the-art visual engine that commands higher ticket sizes and diner loyalty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {xFactorFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.title}
                  className={`rounded-3xl border p-8 bg-gradient-to-br ${feat.color} bg-slate-900/80 backdrop-blur-xl relative overflow-hidden transition hover:border-slate-600 flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-purple-300 border border-purple-500/30">
                        {feat.badge}
                      </span>
                      <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-white">{feat.title}</h3>
                    <p className="text-slate-300 leading-relaxed text-sm sm:text-base font-normal">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">ROI Impact:</span>
                    <span className="text-xs font-semibold text-slate-300">{feat.impact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works (6 Steps) */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Instant Setup</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              From Printed Paper Menu to Live 3D Dining in 6 Steps
            </h2>
            <p className="text-slate-400 text-base">
              No hardware purchases, no IT specialists. Your restaurant can go live in 10 minutes.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 relative group hover:border-purple-500/40 transition-colors">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-purple-950 border border-purple-500/40 text-base font-black text-purple-300">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiered Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-slate-950 relative">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400">Transparent ROI Pricing</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Plans Built to Pay for Themselves on Day 1
            </h2>
            <p className="text-slate-400 text-base">
              Zero commission on your revenue. Flat, transparent monthly pricing with a 3-day risk-free live trial guarantee.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 items-stretch">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                  tier.popular
                    ? "bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/40 border-2 border-purple-500 shadow-2xl shadow-purple-500/20 scale-[1.03]"
                    : "bg-slate-900/70 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                    {tier.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{tier.name}</span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-white">{tier.priceInr}</span>
                      <span className="text-sm font-semibold text-slate-400">{tier.period}</span>
                      <span className="text-xs font-medium text-slate-500">({tier.priceUsd})</span>
                    </div>
                    <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">{tier.description}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Included Features:</p>
                    <ul className="space-y-2.5">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                  <Link
                    href="/register"
                    className={`block w-full py-4 text-center text-sm font-black rounded-2xl transition-all ${
                      tier.popular
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-lg hover:brightness-110"
                        : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                  <p className="mt-2 text-center text-[11px] text-slate-500">
                    3-Day money-back live trial · Cancel anytime
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Risk Free Trial Box */}
          <div className="mt-12 max-w-3xl mx-auto rounded-3xl bg-slate-900 border border-purple-500/30 p-6 text-center space-y-2">
            <h4 className="text-lg font-black text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>3-Day Risk-Free Live Trial Guarantee</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Test SwiftTab live at your tables for 3 full days. If you don&apos;t see faster ordering and happier guests, receive a complete refund. No contracts, zero hassle.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-slate-900/40 border-t border-slate-800">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Got Questions?</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition hover:border-purple-500/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-white marker:hidden">
                  <span>{faq.q}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple-950 text-purple-300 transition group-open:rotate-45">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-slate-300 text-sm border-t border-slate-800/80 pt-3 font-normal">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final Action CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Experience the Future of Restaurant Dining Today
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Join modern restaurants elevating their guest experience and earning more on every table.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 px-8 py-4 text-lg font-black text-white shadow-xl hover:scale-105 transition-all"
            >
              Get Started Now
            </Link>
            <DemoModal />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-12 text-slate-400">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo-icon.png" alt="SwiftTab" width={179} height={166} className="h-10 w-auto" />
                <span className="text-xl font-bold tracking-tight text-white">SwiftTab</span>
              </Link>
              <p className="mt-3 max-w-xs text-xs sm:text-sm leading-6 text-slate-400">
                Next-Gen 3D QR Table Ordering, AI Studio Photography & Kitchen Display Intelligence for modern restaurants.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Product</p>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm font-semibold">
                <li>
                  <Link href="/demo" className="hover:text-purple-400">
                    Live 3D Customer Menu Demo
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-purple-400">
                    X-Factor Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-purple-400">
                    Tiered Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-purple-400">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Restaurant</p>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm font-semibold">
                <li>
                  <Link href="/register" className="hover:text-purple-400">
                    Create Restaurant Account
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-purple-400">
                    Restaurant Staff / Admin Login
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-purple-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-purple-400">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-900 pt-6 text-center text-xs text-slate-500">
            © 2026 SwiftTab (justswifttab.com). Next-Gen Restaurant Dining & Operations Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductPreview({
  phoneItems,
  previewOrder,
}: {
  phoneItems: typeof demoRestaurant.categories[number]["items"];
  previewOrder: (typeof demoOrders)[number];
}) {
  const phoneTotalPaise = phoneItems.reduce((sum, item) => sum + item.pricePaise, 0);
  return (
    <div className="relative">
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-5 lg:gap-6">
        {/* Customer phone mockup */}
        <div className="col-span-1 sm:col-span-3 rounded-[2rem] border-4 border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Table {demoRestaurant.tableNumber}
              </p>
              <h3 className="text-base font-black text-white">{demoRestaurant.name}</h3>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-purple-900/60 border border-purple-500/30 text-[10px] font-bold text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>3D Active</span>
            </div>
          </div>

          <div className="space-y-2.5 py-1">
            {phoneItems.map((item) => (
              <div key={item.id} className="grid grid-cols-[60px_1fr] gap-3 rounded-2xl bg-slate-800/80 p-2.5 border border-slate-700/60 items-center">
                <div className="relative h-16 w-15 overflow-hidden rounded-xl bg-slate-700">
                  <Image
                    src={item.imageUrl || ""}
                    alt={item.name}
                    fill
                    sizes="60px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center space-y-0.5">
                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                  <p className="text-xs font-mono font-bold text-purple-300">{formatMoney(item.pricePaise)}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400">
                      🔥 {item.calories || 480} kcal
                    </span>
                    <span className="text-[10px] font-bold text-purple-300">
                      💪 {item.proteinGrams || 22}g P
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-500/30 p-3 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <Activity className="h-3.5 w-3.5 text-emerald-400" /> Live Table Nutrition
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">1,330 kcal · 60g P</span>
            </div>
            <div className="mt-2 rounded-xl bg-white px-3 py-2 text-center text-xs font-black text-slate-950 shadow">
              Proceed to Table Order ({formatMoney(phoneTotalPaise)})
            </div>
          </div>
        </div>

        {/* Live Kitchen KDS Ticket mockup */}
        <div className="hidden sm:block sm:col-span-2 space-y-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black text-white">Live Kitchen KDS</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400">Active</span>
            </div>
            <p className="text-[11px] font-bold text-purple-300">Table #{previewOrder.table} · #{previewOrder.orderNumber}</p>
            <div className="space-y-1 text-xs text-slate-300">
              {previewOrder.items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>{i.quantity}x {i.name}</span>
                  <span className="text-slate-400 font-mono">Kitchen</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
