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
  Clock,
  Compass,
  CreditCard,
  Eye,
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
  Zap,
  Check
} from "lucide-react";
import DemoModal from "./components/DemoModal";
import ContactLink from "./components/ContactLink";
import Navbar from "./components/Navbar";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "SwiftTab — Next-Gen 3D QR Dining & Revenue Platform",
  description:
    "The modern guest ordering and kitchen intelligence platform for restaurants. High-resolution studio food photography, 3D interactive dishes, live nutrition tracking, smart pairing upsells, and 0% commission direct UPI payments.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SwiftTab — Next-Gen 3D QR Dining & Kitchen Intelligence",
    description:
      "Stunning studio food photography, interactive 3D dish showcases, real-time macro tracking, and zero commission QR ordering for modern restaurants.",
    url: "https://justswifttab.com",
    siteName: "SwiftTab",
    type: "website",
    images: [{ url: "https://justswifttab.com/logo-full.png", width: 1200, height: 630, alt: "SwiftTab" }],
  },
};

const valuePillars = [
  {
    icon: Sparkles,
    tag: "Visual Dining Experience",
    title: "Studio Photography & 3D Cards",
    description:
      "Transform plain text items into high-resolution studio food photography. Diners tilt and interact with dishes in true 3D perspective with realistic depth, specular lighting, and steam effects.",
    metric: "+32% Diner Engagement",
    subMetric: "vs flat paper or PDF menus"
  },
  {
    icon: Activity,
    tag: "Nutrition & Health",
    title: "Real-Time Nutrition & Macro Intelligence",
    description:
      "Cater to health-conscious diners and fitness enthusiasts with instant calorie counts, protein grams, healthy fats, net carbs, and allergen transparency across every dish.",
    metric: "40% of Urban Diners",
    subMetric: "actively track calories & protein"
  },
  {
    icon: TrendingUp,
    tag: "Revenue Engine",
    title: "Smart Chef Pairing Upsells",
    description:
      "Automatically recommend high-margin sides, artisanal breads, and signature beverages at the exact point of ordering with context-aware social proof.",
    metric: "+18% to +24%",
    subMetric: "higher Average Order Value"
  },
  {
    icon: ShieldCheck,
    tag: "Reputation & CRM",
    title: "Google Review Shield & WhatsApp CRM",
    description:
      "Seamlessly route 5-star ratings to Google Maps to surge public rankings. Automatically capture 1-3 star feedback privately to WhatsApp to resolve guest complaints instantly.",
    metric: "4.8 / 5.0 Public Rating",
    subMetric: "+ 100% verified guest contact list"
  }
];

const workflowSteps = [
  {
    step: "01",
    title: "60-Second Menu Digitization",
    description: "Upload a photo of your current paper menu. Our intelligence engine extracts items, categories, photography, and macro profiles instantly."
  },
  {
    step: "02",
    title: "Deploy QR Stands on Tables",
    description: "Place high-resolution acrylic QR stands across dine-in tables and car-side spots. Guests scan with any camera—zero app download required."
  },
  {
    step: "03",
    title: "Interactive 3D Ordering",
    description: "Guests tilt their phones to inspect dishes in 3D, filter by dietary preferences, and customize preparation notes in real time."
  },
  {
    step: "04",
    title: "Instant Kitchen KDS Dispatch",
    description: "Orders flash immediately to kitchen display screens with clear preparation chimes, table numbers, and item modifiers—eliminating delay."
  },
  {
    step: "05",
    title: "Direct UPI Settlement & Bill Split",
    description: "Guests split bills equally or pay instantly via direct UPI QR code. 100% of revenue settles into your bank with 0% commission."
  },
  {
    step: "06",
    title: "WhatsApp Receipts & Review Boost",
    description: "Customers receive digital itemized receipts on WhatsApp while satisfied diners are seamlessly routed to elevate your Google Maps rating."
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
    description: "The complete visual dining & revenue engine that drives higher table spend and guest excitement.",
    popular: true,
    features: [
      "Everything in Starter, plus:",
      "Studio Food Photography Pipeline (150+ dishes)",
      "Interactive 3D Dish Cards with Gyro Tilt & Steam",
      "Nutrition & Macro Engine (Calories, Protein, Carbs, Fats)",
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
    description: "Full-scale dining experience with automated reputation shielding and multi-user bill splitting.",
    popular: false,
    features: [
      "Everything in Growth, plus:",
      "5-Star Google Review Shield (Private manager alert routing)",
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
    q: "How does the Studio Food Photography pipeline work?",
    a: "When you upload your paper menu or type in dishes, our culinary studio engine automatically matches high-resolution, commercial-grade food photography for over 150 popular dishes. You can also generate multi-angle studio shots (front angle, top-down, close-up) or upload your own custom food photos at any time.",
  },
  {
    q: "How accurate is the Nutrition & Macro Intelligence?",
    a: "Our nutrition engine uses culinary macro data (calories, protein, healthy fats, net carbs, fiber, and common allergens) tailored for Indian and international cuisines. Restaurant owners can also adjust or override any specific macro values directly in the admin dashboard.",
  },
  {
    q: "Do customers need to download an app?",
    a: "No. The QR code opens directly in any standard mobile browser (Safari, Chrome, etc.) in under a second. There is zero friction, no app to install, and no account required for diners.",
  },
  {
    q: "How does the 5-Star Google Review Shield work?",
    a: "When customers tap to leave feedback, diners giving 4 or 5 stars are seamlessly redirected to your restaurant's official Google Maps review page. Guests giving 1 to 3 stars are routed to a private feedback form that instantly notifies the manager via WhatsApp, giving you a chance to resolve the issue before a negative public review is posted.",
  },
  {
    q: "How does payment work? Do you take a commission?",
    a: "SwiftTab charges 0% commission on orders. Customers pay you directly via your restaurant's UPI QR code or in cash. Money goes straight into your bank account without middleman delays or transaction deductions.",
  },
  {
    q: "What hardware is required?",
    a: "No proprietary or expensive POS hardware is needed. The kitchen display and staff screens run in any modern web browser on any phone, tablet, or laptop. Kitchen tickets can also be printed using your existing standard thermal printer.",
  },
  {
    q: "Is there a long-term contract or lock-in?",
    a: "No contracts and no lock-in. We offer a 3-day risk-free live trial so you can experience the speed, guest excitement, and revenue increase live at your tables. You can cancel at any time with a single click.",
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070D0B] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
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
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-28 lg:pb-36 border-b border-emerald-950/40">
        {/* Subtle Architectural Emerald Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Subtle Fine Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,184,124,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,184,124,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Refined Pill Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-semibold text-emerald-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Next-Gen Dining Engine</span>
                <span className="text-emerald-700">|</span>
                <span className="text-white font-bold">0% Commission Direct UPI</span>
              </div>

              {/* Authority Headline */}
              <h1 className="text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-6xl lg:text-[64px]">
                The Modern <br className="hidden sm:inline" />
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
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 text-center text-base font-bold shadow-[0_0_30px_-5px_rgba(0,184,124,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Start 3-Day Risk-Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <DemoModal />
              </div>

              {/* Enterprise Trust Metric Bar */}
              <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-emerald-950/60">
                <div>
                  <span className="block text-2xl font-black text-white font-mono tracking-tight">+22%</span>
                  <span className="text-xs text-slate-400 font-medium">Table Spend Increase</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-white font-mono tracking-tight">60s</span>
                  <span className="text-xs text-slate-400 font-medium">Menu Scan Setup</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-emerald-400 font-mono tracking-tight">0%</span>
                  <span className="text-xs text-slate-400 font-medium">Order Commission</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-white font-mono tracking-tight">4.8 / 5.0</span>
                  <span className="text-xs text-slate-400 font-medium">Review Protection</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Product Mockup */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-[#0B1512] border border-emerald-500/20 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-xl">
                {/* Window Control Bar */}
                <div className="flex items-center justify-between pb-3.5 border-b border-emerald-950/60 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">justswifttab.com/demo</span>
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30">
                    Table 4 Active
                  </span>
                </div>

                {/* 3D Dish Showcase Preview Widget */}
                <div className="py-4 space-y-3.5">
                  <div className="relative h-60 rounded-2xl overflow-hidden bg-gradient-to-b from-[#11201B] to-[#0B1512] flex items-center justify-center border border-emerald-500/15 group cursor-pointer">
                    <div className="relative w-44 h-44 rounded-full p-2 bg-emerald-950/40 border border-emerald-500/25 shadow-2xl transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-700">
                      <Image
                        src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=85"
                        alt="Tandoori Paneer Tikka"
                        fill
                        className="object-cover rounded-full p-1"
                      />
                      <div className="absolute top-0 right-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                        🔥 Sizzler Fresh
                      </div>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-md bg-[#070D0B]/85 backdrop-blur-md text-[10px] font-bold text-white border border-emerald-500/20 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-emerald-400" /> 3D Perspective Stage
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        💪 24g Protein
                      </span>
                    </div>
                  </div>

                  {/* Item Details Preview */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h4 className="font-bold text-sm text-white">Clay Oven Paneer Tikka</h4>
                      <p className="text-xs text-slate-300 font-medium">🔥 380 kcal · 🥑 16g Fat · 🍚 12g Carbs</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-400 text-base">₹340</span>
                      <span className="block text-[10px] text-slate-500 font-medium">+ GST</span>
                    </div>
                  </div>

                  {/* Contextual Upsell Preview */}
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <Utensils className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-300 text-[11px]">84% of guests pair with <strong>Butter Garlic Naan</strong></span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400">+₹80</span>
                  </div>
                </div>

                {/* Footer Preview Link */}
                <div className="pt-2 text-center border-t border-emerald-950/40">
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    <span>Launch Live Interactive Menu Demo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Bento Section */}
      <section className="py-20 lg:py-32 border-b border-emerald-950/40 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">High-Impact Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">Four Architectural Pillars That Drive Measurable Revenue.</h2>
            <p className="text-slate-400 text-base mt-3">SwiftTab transforms table ordering from a static utility into an active dining experience.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {valuePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-[#0B1512] border border-emerald-500/15 p-8 hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(0,184,124,0.08)] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                        {pillar.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{pillar.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-300">{pillar.description}</p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-emerald-950/60 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{pillar.metric}</span>
                      <span className="block text-xs text-slate-400 mt-0.5">{pillar.subMetric}</span>
                    </div>
                    <Link
                      href="/demo"
                      className="text-xs font-bold text-slate-300 group-hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      <span>Explore Experience</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6-Step Operational Timeline */}
      <section className="py-20 lg:py-32 border-b border-emerald-950/40 bg-[#060A09]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Frictionless Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">From Scan to Kitchen in 6 Seconds.</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">Zero hardware complexity. Set up in minutes on any tablet, phone, or laptop browser.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#0B1512] border border-emerald-500/15 p-7 relative hover:border-emerald-500/35 transition-all duration-300"
              >
                <span className="font-mono text-2xl font-black text-emerald-500/40 mb-3 block">{step.step}</span>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI & Comparison Section */}
      <section className="py-20 lg:py-32 border-b border-emerald-950/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl bg-gradient-to-b from-[#0C1714] to-[#070D0B] border border-emerald-500/20 p-8 sm:p-12 shadow-2xl">
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Financial Arithmetic</span>
              <h2 className="text-3xl font-black text-white mt-2 tracking-tight">Why Restaurant Owners Save ₹1.2 Lakhs Every Month.</h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2">Compare direct table ordering against third-party delivery aggregators and old-fashioned paper menus.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-950/60 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-4">Feature / Metric</th>
                    <th className="pb-4 text-emerald-400">SwiftTab Growth</th>
                    <th className="pb-4 text-slate-400">Delivery Aggregators</th>
                    <th className="pb-4 text-slate-400">Laminated Paper Menus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/40 text-slate-300">
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
                    <td className="py-4 font-bold text-white">Live Nutrition & Macro Tracking</td>
                    <td className="py-4 text-emerald-400 font-bold">Included (Real-time)</td>
                    <td className="py-4 text-slate-500">None</td>
                    <td className="py-4 text-slate-500">None</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white">Average Order Value Upsells</td>
                    <td className="py-4 text-emerald-400 font-bold">+18% to +24%</td>
                    <td className="py-4">Aggregator keeps customer</td>
                    <td className="py-4">0% (Relies on waiter)</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white">Customer Phone & WhatsApp CRM</td>
                    <td className="py-4 text-emerald-400 font-bold">100% Restaurant Owned</td>
                    <td className="py-4 text-red-400">Masked phone numbers</td>
                    <td className="py-4 text-slate-500">Paper feedback forms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 border-b border-emerald-950/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Predictable Retainers</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">Simple, High-ROI Plans.</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">Zero setup fees. Zero commission on orders. 3-day risk-free live trial on all plans.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 items-stretch">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#0E1B17] border-2 border-emerald-500 shadow-[0_0_40px_rgba(0,184,124,0.2)] relative lg:scale-105 z-10"
                    : "bg-[#0B1512] border border-emerald-500/15"
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

                  <div className="my-6 pb-6 border-b border-emerald-950/60">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white font-mono tracking-tight">{plan.priceInr}</span>
                      <span className="text-sm text-slate-400 font-normal">{plan.period}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono mt-0.5 block">or {plan.priceUsd} USD</span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300 mb-8">
                    {plan.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.ctaLink}
                  className={`w-full py-3.5 px-4 rounded-xl text-center text-sm font-bold transition-all ${
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25"
                      : "bg-emerald-950/40 hover:bg-emerald-900/50 text-white border border-emerald-500/20"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-b border-emerald-950/40 bg-[#060A09]">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Questions & Answers</span>
            <h2 className="text-3xl font-black text-white mt-2 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#0B1512] border border-emerald-500/15 p-6 hover:border-emerald-500/30 transition-colors"
              >
                <h3 className="text-base font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Enterprise Call to Action */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
        <div className="mx-auto max-w-5xl px-6 text-center relative">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Upgrade Your Dining Room Experience?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Join forward-thinking restaurants replacing flat paper menus with interactive 3D ordering, macro tracking, and 0% commission UPI settlements.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 font-bold text-base shadow-[0_0_30px_rgba(0,184,124,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              Start 3-Day Risk-Free Trial
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-white px-8 py-4 font-bold text-base border border-emerald-500/25 transition-all"
            >
              Experience Live Customer Demo
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400 font-medium">
            Setup takes less than 60 seconds · No credit card required
          </p>
        </div>
      </section>

      {/* Enterprise Footer */}
      <footer className="border-t border-emerald-950/60 bg-[#050807] py-12 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-1 border border-emerald-500/20">
              <Image src="/logo-icon.png" alt="SwiftTab Logo" width={28} height={28} className="h-5 w-auto" />
            </div>
            <span className="font-bold text-white text-sm">SwiftTab</span>
            <span className="text-emerald-800">|</span>
            <span className="text-slate-400">© {new Date().getFullYear()} SwiftTab Technologies. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
            <ContactLink className="hover:text-emerald-400 transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
