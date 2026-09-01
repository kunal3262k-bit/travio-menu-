import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  Compass,
  CreditCard,
  Eye,
  Flame,
  IndianRupee,
  Layers,
  Lock,
  MessageSquare,
  Percent,
  Plus,
  QrCode,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Split,
  Star,
  TrendingUp,
  Utensils,
  Zap
} from "lucide-react";
import DemoModal from "./components/DemoModal";
import ContactLink from "./components/ContactLink";
import Navbar from "./components/Navbar";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/site-config";
import { demoOrders, demoRestaurant } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SwiftTab — Next-Gen 3D QR Dining & Revenue Platform",
  description:
    "The modern guest ordering and kitchen intelligence platform for restaurants. Auto-generated studio food photography, 3D interactive dishes, live nutrition tracking, smart pairing upsells, and 0% commission direct UPI payments.",
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

const valuePillars = [
  {
    icon: Sparkles,
    tag: "Visual Experience",
    title: "AI Studio Photography & 3D Cards",
    description:
      "Transform plain text into high-resolution commercial studio food photography. Diners tilt and interact with dishes in true 3D perspective with realistic depth, specular lighting, and steam effects.",
    metric: "+32% Diner Engagement",
    subMetric: "vs flat PDF/paper menus"
  },
  {
    icon: Activity,
    tag: "Health & Fitness",
    title: "Real-Time Nutrition & Macro Intelligence",
    description:
      "Cater to fitness enthusiasts, gym-goers, and keto diners with instant calorie counts, protein grams, healthy fats, net carbs, and allergen transparency across every dish.",
    metric: "40% of Urban Diners",
    subMetric: "actively track calories/protein"
  },
  {
    icon: TrendingUp,
    tag: "Revenue Engine",
    title: "Smart Chef Pairing Upsells",
    description:
      "Automatically recommend high-margin sides, artisanal breads, and signature beverages at the point of ordering with social proof ('84% of guests pair this with Garlic Naan').",
    metric: "+18% to +24%",
    subMetric: "higher Average Order Value"
  },
  {
    icon: ShieldCheck,
    tag: "Reputation & CRM",
    title: "Google Review Shield & WhatsApp CRM",
    description:
      "Route 4-5 star ratings directly to Google Maps to surge your public score. Automatically capture 1-3 star feedback privately to WhatsApp to resolve guest complaints instantly.",
    metric: "4.8★ Public Average",
    subMetric: "+ 100% verified guest phone list"
  }
];

const workflowSteps = [
  {
    step: "01",
    title: "60-Second AI Menu Scan",
    description: "Snap a photo of your existing paper menu. Our AI engine extracts items, categories, studio food photos, and macro profiles instantly."
  },
  {
    step: "02",
    title: "Place QR Stands on Tables",
    description: "Deploy high-res QR codes for dine-in tables and car-side drive-in spots. Guests scan with any camera—zero app download required."
  },
  {
    step: "03",
    title: "Interactive 3D Ordering",
    description: "Guests tilt their phones to inspect dishes in 3D, filter by dietary preferences, and customize preparation notes in real time."
  },
  {
    step: "04",
    title: "Instant Kitchen KDS Dispatch",
    description: "Orders flash to the kitchen display screen with clear preparation chimes, table numbers, and item modifiers—eliminating waiter delays."
  },
  {
    step: "05",
    title: "Direct UPI Settlement & Split",
    description: "Guests split bills equally or pay instantly via UPI. 100% of revenue settles directly into your bank with 0% middleman commission."
  },
  {
    step: "06",
    title: "WhatsApp Receipts & Review Boost",
    description: "Customers receive digital itemized receipts on WhatsApp while 5-star diners are routed to elevate your Google Maps rating."
  }
];

const pricingPlans = [
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
    ctaLink: "/register",
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
    ctaLink: "/register",
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
    ctaLink: "/register",
    badge: "Full Power & Reputation"
  }
];

const faqs = [
  {
    q: "How does the AI Studio Food Photography work?",
    a: "When you upload your paper menu or type in dishes, our culinary studio engine automatically matches high-resolution, commercial-grade food photography for over 150 popular dishes. You can also generate multi-angle studio shots (front angle, top-down, close-up) or upload your own custom food photos at any time.",
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
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
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
              "The high-performance dining & revenue platform for modern restaurants. 3D interactive menus, macro tracking, KDS, and 0% commission QR ordering.",
            offers: { "@type": "Offer", price: "5999", priceCurrency: "INR", description: "Growth Monthly subscription" },
          }),
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 border-b border-white/[0.06]">
        {/* Subtle Architectural Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Subtle Emerald Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Refined Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.1] px-4 py-1.5 text-xs font-semibold text-slate-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                <span>Next-Gen Dining Engine</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 font-bold">0% Commission</span>
              </div>

              {/* Authority Headline */}
              <h1 className="text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-6xl">
                The High-Performance <br className="hidden sm:inline" />
                <span className="text-white">Dining & Revenue Platform </span>
                <span className="text-emerald-400">for Restaurants.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl font-normal">
                Replace flat paper menus with interactive 3D dish showcases, real-time calorie and protein intelligence, smart pairing upsells, and 1-tap WhatsApp digital bills — built to maximize table spend and kitchen speed.
              </p>

              {/* CTA Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/register"
                  className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 text-center text-base font-black shadow-xl shadow-emerald-500/15 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Start 3-Day Risk-Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <DemoModal />
              </div>

              {/* Enterprise Trust Metric Bar */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.08]">
                <div>
                  <span className="block text-xl font-black text-white font-mono">+22%</span>
                  <span className="text-xs text-slate-400">Table Spend</span>
                </div>
                <div>
                  <span className="block text-xl font-black text-white font-mono">60s</span>
                  <span className="text-xs text-slate-400">AI Menu Setup</span>
                </div>
                <div>
                  <span className="block text-xl font-black text-white font-mono">0%</span>
                  <span className="text-xs text-slate-400">Commission</span>
                </div>
                <div>
                  <span className="block text-xl font-black text-white font-mono">4.8★</span>
                  <span className="text-xs text-slate-400">Review Shield</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Product Mockup */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-[#0D111A] border border-white/[0.12] p-4 shadow-2xl overflow-hidden backdrop-blur-xl">
                {/* Window Control Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">justswifttab.com/demo</span>
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">Live Table 4</span>
                </div>

                {/* 3D Dish Showcase Preview Widget */}
                <div className="py-4 space-y-3">
                  <div className="relative h-56 rounded-2xl overflow-hidden bg-gradient-to-b from-[#131824] to-[#0D111A] flex items-center justify-center border border-white/[0.08] group cursor-pointer">
                    <div className="relative w-44 h-44 rounded-full p-2 bg-white/[0.06] border border-white/[0.15] shadow-2xl transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-700">
                      <Image
                        src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=85"
                        alt="Tandoori Paneer Tikka"
                        fill
                        className="object-cover rounded-full p-1"
                      />
                      <div className="absolute -top-1 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black">
                        🔥 Sizzler
                      </div>
                    </div>

                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" /> 3D Floating Plate
                      </span>
                      <span className="px-2 py-1 rounded-md bg-emerald-950/80 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        💪 24g Protein
                      </span>
                    </div>
                  </div>

                  {/* Item Details Preview */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">Clay Oven Paneer Tikka</h4>
                      <p className="text-xs text-slate-400">🔥 380 kcal · 🥑 16g Fat · 🍚 12g Carbs</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-emerald-400 text-base">₹340</span>
                      <span className="block text-[10px] text-slate-400 font-semibold">+ GST</span>
                    </div>
                  </div>

                  {/* Smart Upsell Preview Banner */}
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-300 text-[11px]">84% pair with <strong>Butter Garlic Naan</strong></span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400">+₹80</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    <span>Open Full Interactive Customer Menu</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Value Pillars (Bento Grid) */}
      <section className="py-20 lg:py-28 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Built for Measurable ROI</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              Four High-Ticket Capabilities That Drive Higher Table Spend.
            </h2>
            <p className="text-slate-400 text-base mt-3">
              SwiftTab transforms ordering from a basic administrative utility into an active revenue generator.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {valuePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-[#0D111A] border border-white/[0.08] p-8 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-emerald-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                        {pillar.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{pillar.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-300">{pillar.description}</p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-emerald-400 font-mono">{pillar.metric}</span>
                      <span className="block text-xs text-slate-400 mt-0.5">{pillar.subMetric}</span>
                    </div>
                    <Link
                      href="/demo"
                      className="text-xs font-bold text-slate-400 group-hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      <span>Explore Feature</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6-Step Workflow Process */}
      <section className="py-20 lg:py-28 border-b border-white/[0.06] bg-[#0A0D14]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Streamlined Operations</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              From Scan to Kitchen in 6 Seconds.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Zero hardware complexity. Set up in minutes on any tablet, phone, or laptop browser.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#0D111A] border border-white/[0.06] p-6 relative hover:border-white/[0.15] transition-all"
              >
                <span className="font-mono text-3xl font-black text-emerald-500/30 mb-3 block">
                  {step.step}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Economics / ROI Comparison Matrix */}
      <section className="py-20 lg:py-28 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl bg-gradient-to-b from-[#0E131F] to-[#090D16] border border-white/[0.1] p-8 sm:p-12">
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">The Financial Arithmetic</span>
              <h2 className="text-3xl font-black text-white mt-2">
                Why Restaurant Owners Save ₹1.2 Lakhs Every Month.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2">
                Compare direct dine-in table ordering with third-party delivery aggregators and old-fashioned paper menus.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.1] text-xs font-bold text-slate-400 uppercase">
                    <th className="pb-4">Feature / Metric</th>
                    <th className="pb-4 text-emerald-400">SwiftTab Growth</th>
                    <th className="pb-4 text-slate-400">Food Aggregators</th>
                    <th className="pb-4 text-slate-400">Laminated Paper Menus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  <tr>
                    <td className="py-4 font-bold text-white">Order Commission</td>
                    <td className="py-4 text-emerald-400 font-bold">0% (Zero)</td>
                    <td className="py-4 text-red-400">22% – 28% per order</td>
                    <td className="py-4">0%</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white">Visual Presentation</td>
                    <td className="py-4 text-emerald-400 font-bold">Interactive 3D + Studio Photos</td>
                    <td className="py-4">Flat 2D thumbnail</td>
                    <td className="py-4">Plain printed text</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white">Live Macro & Calorie Tracking</td>
                    <td className="py-4 text-emerald-400 font-bold">✓ Real-time calculation</td>
                    <td className="py-4 text-slate-500">✗ None</td>
                    <td className="py-4 text-slate-500">✗ None</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white">Average Order Value Upsell</td>
                    <td className="py-4 text-emerald-400 font-bold">+18% to +24%</td>
                    <td className="py-4">Aggregator keeps customer</td>
                    <td className="py-4">0% (Relies on waiter)</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white">Customer Phone & WhatsApp CRM</td>
                    <td className="py-4 text-emerald-400 font-bold">✓ 100% Restaurant Owned</td>
                    <td className="py-4 text-red-400">✗ Masked phone numbers</td>
                    <td className="py-4 text-slate-500">✗ Paper feedback forms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Tiered Pricing */}
      <section id="pricing" className="py-20 lg:py-28 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Transparent Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              Simple, High-ROI Retainers.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Zero setup fees. Zero commission on orders. 3-day risk-free live trial on all plans.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 items-stretch">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#0E1422] border-2 border-emerald-500/80 shadow-2xl relative scale-105 z-10"
                    : "bg-[#0D111A] border border-white/[0.08]"
                }`}
              >
                <div>
                  {plan.popular && (
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider mb-4">
                      {plan.badge}
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="my-6 pb-6 border-b border-white/[0.08]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white font-mono">{plan.priceInr}</span>
                      <span className="text-sm text-slate-400 font-normal">{plan.period}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono mt-0.5 block">or {plan.priceUsd} USD</span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.ctaLink}
                  className={`w-full py-3.5 px-4 rounded-xl text-center text-sm font-bold transition-all ${
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                      : "bg-white/[0.06] hover:bg-white/[0.12] text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 border-b border-white/[0.06] bg-[#0A0D14]">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Questions & Answers</span>
            <h2 className="text-3xl font-black text-white mt-2">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#0D111A] border border-white/[0.06] p-6 hover:border-white/[0.12] transition-colors"
              >
                <h3 className="text-base font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#06080C] text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">SwiftTab</span>
            <span>— Next-Gen 3D QR Dining & Kitchen Intelligence</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <ContactLink className="hover:text-white transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
