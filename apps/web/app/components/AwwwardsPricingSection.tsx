"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck, TrendingUp, Clock } from "lucide-react";

export function AwwwardsPricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      badge: "Core Operations",
      tagline: "Essential QR ordering & live kitchen display",
      priceInrMonthly: "₹2,999",
      priceInrAnnual: "₹2,399",
      priceUsdMonthly: "$49",
      priceUsdAnnual: "$39",
      annualSavingsInr: "Save ₹7,200/yr",
      annualSavingsUsd: "Save $120/yr",
      description:
        "The essential setup for quick-service spots, bistros, and small cafes looking to cut order turnaround time.",
      popular: false,
      includesHeader: "Core Features Included:",
      features: [
        "Core QR Table Ordering (unlimited table scans)",
        "Live Kitchen Display System (KDS)",
        "Waiter & Staff Screens (real-time alerts)",
        "Basic digital menu with photos",
        "Direct UPI payments (0% commission)",
        "Menu OCR / AI paper menu import",
        "Call Waiter & Bill Request",
        "Basic sales & order analytics"
      ],
      cta: "Start 3-Day Free Trial",
      ctaSubtext: "Instant 60s setup · No card required",
      ctaLink: "/register?plan=starter"
    },
    {
      id: "growth",
      name: "Growth",
      badge: "Most Popular — Highest ROI",
      tagline: "High-impact visual dining & revenue engine",
      priceInrMonthly: "₹5,999",
      priceInrAnnual: "₹4,799",
      priceUsdMonthly: "$89",
      priceUsdAnnual: "$69",
      annualSavingsInr: "Save ₹14,400/yr",
      annualSavingsUsd: "Save $240/yr",
      description:
        "The full sensory visual menu that lifts average order value, attracts health-conscious diners, and drives guest retention.",
      popular: true,
      includesHeader: "Everything in Starter, plus:",
      features: [
        "Studio Food Photography Pipeline (150+ dishes + multi-angle)",
        "High-resolution Multi-Angle Dish Cards (Front, Top-down, Macro)",
        "AI Nutrition & Macro Engine (Calories, Protein, Fat, Carbs)",
        "Dynamic Dietary Filters (High Protein, Keto, <400 kcal, Vegan)",
        "Smart Pairing Upsells (+18% to +24% AOV lift)",
        "1-Tap WhatsApp Digital Bill + Phone Capture",
        "Live Table Nutrition Meter for diners"
      ],
      cta: "Start 3-Day Free Trial — Growth",
      ctaSubtext: "Most popular for dine-in restaurants & bars",
      ctaLink: "/register?plan=growth"
    },
    {
      id: "enterprise",
      name: "VIP Enterprise",
      badge: "Full Power & Multi-Table",
      tagline: "End-to-end automation, split bills & review protection",
      priceInrMonthly: "₹9,999",
      priceInrAnnual: "₹7,999",
      priceUsdMonthly: "$149",
      priceUsdAnnual: "$119",
      annualSavingsInr: "Save ₹24,000/yr",
      annualSavingsUsd: "Save $360/yr",
      description:
        "Engineered for high-volume restaurants, multi-table lounges, and drive-in venues needing automated reputation defense and group bill splitting.",
      popular: false,
      includesHeader: "Everything in Growth, plus:",
      features: [
        "5-Star Google Review Shield (smart routing & private alerts)",
        "Multi-user Table Bill Splitter with individual UPI QRs",
        "Car-side / Drive-in Ordering with vehicle tracking",
        "Advanced analytics & guest reorder insights",
        "Priority 24/7 Phone & WhatsApp Support",
        "Custom branded acrylic QR table stands (kit included)",
        "Same-day menu digitization & onboarding support"
      ],
      cta: "Start 3-Day Free Trial — VIP",
      ctaSubtext: "Dedicated account manager & fast onboarding",
      ctaLink: "/register?plan=enterprise"
    }
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 border-b border-emerald-950/40 relative overflow-hidden">
      {/* Ambient Spotlight Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3.5">
            <Sparkles className="w-3.5 h-3.5" /> Predictable Retainers · 0% Commission
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Transparent, High-ROI Plans.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Zero setup fees. Zero commission on orders. All customer payments go straight into your bank account.
          </p>

          {/* Trial Guarantee Banner */}
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>3-Day Risk-Free Live Trial at Tables · No Credit Card Required</span>
          </div>

          {/* Controls Bar: Billing Toggle + Currency Selector */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Monthly / Annual Billing Toggle */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#0B1512] border border-emerald-500/20 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  !isAnnual
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isAnnual
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Currency Selector */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#0B1512] border border-emerald-500/20 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setCurrency("INR")}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  currency === "INR"
                    ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🇮🇳 ₹ INR
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  currency === "USD"
                    ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🌐 $ USD
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => {
            const displayPrice =
              currency === "INR"
                ? isAnnual
                  ? plan.priceInrAnnual
                  : plan.priceInrMonthly
                : isAnnual
                ? plan.priceUsdAnnual
                : plan.priceUsdMonthly;

            const secondaryPrice =
              currency === "INR"
                ? isAnnual
                  ? plan.priceUsdAnnual
                  : plan.priceUsdMonthly
                : isAnnual
                ? plan.priceInrAnnual
                : plan.priceInrMonthly;

            const secondaryCurrencyLabel = currency === "INR" ? "USD" : "INR";
            const savingsNote =
              isAnnual &&
              (currency === "INR" ? plan.annualSavingsInr : plan.annualSavingsUsd);

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#0C1A15] border-2 border-emerald-400 shadow-[0_0_50px_rgba(0,184,124,0.22)] relative lg:scale-105 z-10"
                    : "bg-[#0B1512] border border-emerald-500/20 hover:border-emerald-500/40 shadow-lg"
                }`}
              >
                {/* Popular Highlight Header Ribbon */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5" /> Most Popular · Highest ROI
                  </div>
                )}

                <div>
                  {/* Plan Badge & Category */}
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        plan.popular
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                          : "bg-emerald-950/50 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {plan.badge}
                    </span>
                    {isAnnual && (
                      <span className="text-[11px] font-bold text-emerald-400 font-mono">
                        {savingsNote}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white">{plan.name}</h3>
                  <p className="text-xs font-semibold text-emerald-400 mt-1">{plan.tagline}</p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>

                  {/* Price Box */}
                  <div className="my-6 py-5 px-4 rounded-2xl bg-[#070D0B] border border-emerald-950/80">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                        {displayPrice}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-400 font-medium">/month</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-950/50 text-xs text-slate-400 font-mono">
                      <span>
                        ≈ {secondaryPrice} {secondaryCurrencyLabel}/mo
                      </span>
                      <span className="text-[11px] text-emerald-400">
                        {isAnnual ? "Billed annually" : "Billed monthly"}
                      </span>
                    </div>
                  </div>

                  {/* Feature List Header */}
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3.5 pb-2 border-b border-emerald-950/60 flex items-center justify-between">
                    <span>{plan.includesHeader}</span>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">
                      {plan.features.length} Features
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-200 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <div className="p-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA Area */}
                <div>
                  <Link
                    href={plan.ctaLink}
                    className={`w-full py-4 px-5 rounded-xl text-center text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(0,184,124,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-emerald-950/60 hover:bg-emerald-900/70 text-white border border-emerald-500/25 hover:border-emerald-500/50 active:scale-[0.98]"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5 font-medium">
                    {plan.ctaSubtext}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Risk-Free Assurance Footer Bar */}
        <div className="mt-16 rounded-2xl bg-[#0A1310] border border-emerald-500/20 p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">3-Day Live Trial</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Run SwiftTab at real tables with real diners. Experience the speed and order lift before any billing starts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">60-Second Menu Setup</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Scan your paper menu or import items instantly. No complex POS integration or hardware required.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">0% Order Commission</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Direct UPI and cash settlements go 100% to your account without third-party deductions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AwwwardsPricingSection;

