"use client";

import React from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Layers,
  Sparkles,
  Zap
} from "lucide-react";

const POS_PARTNERS = [
  { name: "Square", desc: "Front-desk terminal settlement", badge: "Direct Settle" },
  { name: "QuickBooks", desc: "1-Click CSV & sales sync", badge: "Auto-Export" },
  { name: "Shopmonkey", desc: "Parallel bay dispatch layer", badge: "Co-Pilot" },
  { name: "Stripe", desc: "Apple Pay & contactless checkout", badge: "Integrated" },
  { name: "Clover", desc: "Register credit card swipe", badge: "Zero Clash" },
  { name: "Apple Pay", desc: "1-Tap client mobile approvals", badge: "Native" },
];

export function PosCompatibilitySection() {
  return (
    <section className="py-20 border-b border-zinc-800/80 bg-[#07090F] relative z-10 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-emerald-950/80 p-8 sm:p-12 shadow-[0_20px_80px_rgba(0,0,0,0.85)] relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: The Narrative & Value */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
                <CreditCard className="w-3.5 h-3.5" />
                <span>ZERO POS DISRUPTION GUARANTEE</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Keep Your Current Credit Card Reader & Accountant.
              </h2>

              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                SwiftTab is <span className="text-white font-semibold">not</span> an accounting replacement. It is a dedicated front-of-house bay dispatch and client experience layer that sits over whatever you already use.
              </p>

              {/* 3 Key Guarantees */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Non-Invasive Front-Desk Settlement (Default)</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Customers approve add-on services on their phone. When they pick up their car, your front desk rings up the updated total on your existing Square or QuickBooks terminal as usual. Zero merchant disruption.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Why Add SwiftTab if You Already Have a POS?</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Square and QuickBooks cannot perform 60-second photo defect walkarounds, cannot project live bay telemetry on cleanroom walls, and cannot send live Tesla-style milestone tracking links to customers. SwiftTab solves the client experience and liability gaps they completely ignore.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Optional Contactless Apple Pay</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Want clients to pay their invoice before arriving for pickup? Connect your own Stripe account in 60 seconds with 0% platform commission on your jobs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Compatibility Grid */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-black/70 border border-zinc-800 p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                    Compatible Ecosystems
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                    100% Plug & Play
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {POS_PARTNERS.map((p) => (
                    <div
                      key={p.name}
                      className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/90 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className="text-[9px] font-mono text-emerald-400 font-semibold">{p.badge}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-tight">{p.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <span className="text-[11px] font-mono text-zinc-500">
                    Works alongside any credit card terminal or merchant gateway.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
