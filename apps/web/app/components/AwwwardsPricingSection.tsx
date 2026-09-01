"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, ArrowRight, Shield } from "lucide-react";
import SpotlightCard from "./SpotlightCard";

export function AwwwardsPricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      badge: "Essential Operations",
      priceInr: isAnnual ? "₹2,399" : "₹2,999",
      priceUsd: isAnnual ? "$39" : "$49",
      period: "/month",
      billingNote: isAnnual ? "billed annually (₹28,788/yr)" : "billed monthly",
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
      ctaLink: "/register"
    },
    {
      name: "Growth",
      badge: "Most Popular — Highest ROI",
      priceInr: isAnnual ? "₹4,799" : "₹5,999",
      priceUsd: isAnnual ? "$69" : "$89",
      period: "/month",
      billingNote: isAnnual ? "billed annually (₹57,588/yr)" : "billed monthly",
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
      ctaLink: "/register"
    },
    {
      name: "VIP Enterprise",
      badge: "Full Power & Multi-Table",
      priceInr: isAnnual ? "₹7,999" : "₹9,999",
      priceUsd: isAnnual ? "$119" : "$149",
      period: "/month",
      billingNote: isAnnual ? "billed annually (₹95,988/yr)" : "billed monthly",
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
      ctaLink: "/register"
    }
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 border-b border-emerald-950/40 relative overflow-hidden">
      {/* Ambient Spotlight Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
            Predictable Retainers
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Simple, High-ROI Plans.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3">
            Zero setup fees. Zero commission on orders. 3-day risk-free live trial on all plans.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-[#0B1512] border border-emerald-500/20 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                !isAnnual
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAnnual
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? "bg-[#0E1B17] border-2 border-emerald-500 shadow-[0_0_50px_rgba(0,184,124,0.25)] relative lg:scale-105 z-10"
                  : "bg-[#0B1512] border border-emerald-500/15 hover:border-emerald-500/40"
              }`}
            >
              {/* Shimmer Top Light for Popular Plan */}
              {plan.popular && (
                <div className="pointer-events-none absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      plan.popular
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>

                <div className="my-6 pb-6 border-b border-emerald-950/60">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                      {plan.priceInr}
                    </span>
                    <span className="text-sm text-slate-400 font-normal">{plan.period}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-slate-400 font-mono">
                    <span>or {plan.priceUsd} USD</span>
                    <span className="text-[11px] text-emerald-400/80">{plan.billingNote}</span>
                  </div>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-300 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <div className="p-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.ctaLink}
                className={`w-full py-4 px-5 rounded-xl text-center text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(0,184,124,0.4)] hover:scale-105 active:scale-95"
                    : "bg-emerald-950/50 hover:bg-emerald-900/60 text-white border border-emerald-500/20 hover:border-emerald-500/40 active:scale-95"
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AwwwardsPricingSection;
