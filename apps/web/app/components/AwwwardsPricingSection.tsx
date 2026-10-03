"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck, Gauge, Clock } from "lucide-react";

export function AwwwardsPricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "GBP">("USD");

  const plans = [
    {
      id: "solo",
      name: "Solo Craft",
      badge: "Mobile & 1-Bay Studios",
      tagline: "Essential digital defect intake & live tracking",
      priceUsdMonthly: "$99",
      priceUsdAnnual: "$79",
      priceGbpMonthly: "£79",
      priceGbpAnnual: "£64",
      annualSavingsUsd: "Save $240/yr",
      annualSavingsGbp: "Save £180/yr",
      description:
        "The essential setup for mobile detailers and single-bay craft studios looking to eliminate damage claims.",
      popular: false,
      includesHeader: "Core Features Included:",
      features: [
        "Up to 30 active vehicle work orders/mo",
        "60-Second Digital Defect Intake (4-angle photos)",
        "Client Live Vehicle Tracker (Zero-login SMS link)",
        "Single-Bay stage advancement on phone/iPad",
        "Pre-inspection digital client sign-off",
        "Contactless Stripe / Apple Pay invoicing",
        "5-Star Google Review redirect",
        "Email & Chat Support",
      ],
      cta: "Start 14-Day Free Trial",
      ctaSubtext: "Instant 60s setup · No card required",
      ctaLink: "/register?plan=solo",
    },
    {
      id: "pro",
      name: "Pro Studio",
      badge: "Most Popular — Highest ROI",
      tagline: "The complete multi-bay dispatch & upsell OS",
      priceUsdMonthly: "$199",
      priceUsdAnnual: "$159",
      priceGbpMonthly: "£159",
      priceGbpAnnual: "£129",
      annualSavingsUsd: "Save $480/yr",
      annualSavingsGbp: "Save £360/yr",
      description:
        "The full multi-bay dispatch board and 1-tap upsell engine that adds $200–$500 in margin to every high-ticket car.",
      popular: true,
      includesHeader: "Everything in Solo Craft, plus:",
      features: [
        "Unlimited vehicle work orders & history",
        "Shop Floor Bay Board (for wall monitors & iPads)",
        "1-Tap Service Upsell Engine (wheel/glass/leather)",
        "Multi-Bay Workflow (Decon, Polish, Cleanroom, Curing)",
        "Audio chimes on bay handoffs & approved upsells",
        "Custom studio branding, logo, and theme color",
        "Before/After macro photo inspection feed",
        "Dedicated onboarding & priority support",
      ],
      cta: "Start 14-Day Free Trial",
      ctaSubtext: "Pays for itself with 1 approved upsell",
      ctaLink: "/register?plan=pro",
    },
    {
      id: "elite",
      name: "Elite Multi-Bay",
      badge: "High-Volume & Franchise",
      tagline: "Enterprise throughput & multi-technician controls",
      priceUsdMonthly: "$349",
      priceUsdAnnual: "$279",
      priceGbpMonthly: "£279",
      priceGbpAnnual: "£224",
      annualSavingsUsd: "Save $840/yr",
      annualSavingsGbp: "Save £660/yr",
      description:
        "Engineered for high-volume 5+ bay studios, multi-location operations, and custom PPF/wrap facilities.",
      popular: false,
      includesHeader: "Everything in Pro Studio, plus:",
      features: [
        "Multi-bay fleet (5+ bays & cleanrooms)",
        "Technician PIN authentication & commission tracking",
        "Custom CNAME domain (bay.yourstudio.com)",
        "Automated Twilio SMS notifications to car owners",
        "Advanced turnaround analytics & labor efficiency KPIs",
        "Multi-location consolidated studio reporting",
        "Dedicated Account Director & WhatsApp VIP support",
        "99.99% uptime SLA guarantee",
      ],
      cta: "Start 14-Day Free Trial",
      ctaSubtext: "White-glove data & catalog setup included",
      ctaLink: "/register?plan=elite",
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 border-b border-emerald-950/40 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            One Single Upsell Covers Your Entire Year.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3">
            14-day risk-free trial. Test it live in your bays. Cancel anytime with a single click.
          </p>

          {/* Toggle Controls: Billing Period & Currency */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {/* Currency Selector */}
            <div className="inline-flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs font-bold text-slate-400">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currency === "USD" ? "bg-emerald-500 text-slate-950 shadow-md" : "hover:text-white"
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency("GBP")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currency === "GBP" ? "bg-emerald-500 text-slate-950 shadow-md" : "hover:text-white"
                }`}
              >
                GBP (£)
              </button>
            </div>

            {/* Annual vs Monthly Toggle */}
            <div className="inline-flex items-center gap-3 rounded-2xl bg-[#091510] border border-emerald-900/50 p-1.5 px-4 text-xs font-semibold">
              <span className={!isAnnual ? "text-white font-bold" : "text-slate-400"}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-800 transition-colors focus:outline-none"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-emerald-400 transition-transform ${
                    isAnnual ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={isAnnual ? "text-white font-bold flex items-center gap-1.5" : "text-slate-400"}>
                Annual Billing{" "}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Save 20%
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => {
            const price =
              currency === "USD"
                ? isAnnual
                  ? plan.priceUsdAnnual
                  : plan.priceUsdMonthly
                : isAnnual
                ? plan.priceGbpAnnual
                : plan.priceGbpMonthly;

            const savings =
              currency === "USD" ? plan.annualSavingsUsd : plan.annualSavingsGbp;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-b from-[#0E1F18] via-[#091511] to-[#070D0B] border-2 border-emerald-500 shadow-[0_0_50px_-10px_rgba(0,184,124,0.3)] lg:-translate-y-2"
                    : "bg-[#080E0B] border border-emerald-950/70 hover:border-emerald-700/50"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-current" /> {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {!plan.popular && (
                      <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-6">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-emerald-950/60">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                        {price}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ month</span>
                    </div>
                    {isAnnual && (
                      <span className="inline-block mt-2 text-xs font-bold text-emerald-400">
                        {savings} billed annually
                      </span>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-slate-300 mb-6">{plan.description}</p>

                  {/* Feature Bullets */}
                  <div className="space-y-3 mb-8">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      {plan.includesHeader}
                    </span>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="space-y-2 pt-4 border-t border-emerald-950/60">
                  <Link
                    href={plan.ctaLink}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      plan.popular
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25"
                        : "bg-slate-900 hover:bg-slate-800 text-white border border-slate-700"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-center text-[10px] text-slate-500">{plan.ctaSubtext}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
