"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Camera,
  Star,
  Check,
  CheckCircle2,
  Clock,
  Gauge,
  Layers,
  Zap,
  Shield,
  Eye,
} from "lucide-react";
import SpotlightCard from "./SpotlightCard";

export function AwwwardsBentoSection() {
  // Bento 1 State: Active Defect Angle
  const [selectedAngle, setSelectedAngle] = useState(0);
  const defectAngles = [
    {
      label: "Front Bumper",
      url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=85",
      desc: "Micro rock chips logged on front lip prior to PPF wrap",
    },
    {
      label: "Driver Door",
      url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=85",
      desc: "2-stage swirl marks detected under 5,000k inspection lighting",
    },
    {
      label: "Wheel & Caliper",
      url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=85",
      desc: "Corrosive iron brake dust buildup documented",
    },
  ];

  // Bento 2 State: Active Bay Filter
  const [activeBay, setActiveBay] = useState<"wash" | "correct" | "coat">("correct");

  // Bento 3 State: Upsell Toggle
  const [upsellAdded, setUpsellAdded] = useState(false);

  // Bento 4 State: Interactive Review Stars
  const [selectedRating, setSelectedRating] = useState(5);

  return (
    <section className="py-20 lg:py-32 border-b border-emerald-950/40 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> High-Impact Studio Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Four Living Systems That Protect & Expand Studio Margins.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3">
            Interactive, award-winning interfaces designed to eliminate pre-existing damage disputes, keep technicians in sync, and unlock \$200–\$500 in 1-tap service upsells.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: 60-Second Digital Defect Intake */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                  Lawsuit & Dispute Shield
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">60-Second Digital Intake & Defect Map</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Technicians walk around the car, snap 4-angle defect photos, and log pre-existing rock chips. The client digitally signs off via SMS before polishing starts—shielding your studio from false damage claims.
              </p>

              {/* Interactive Multi-Angle Defect View */}
              <div className="relative rounded-2xl bg-[#070D0B] border border-emerald-950/70 p-4 mb-4">
                <div className="relative h-48 sm:h-56 w-full rounded-xl overflow-hidden mb-3 border border-emerald-950">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedAngle}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.04 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={defectAngles[selectedAngle].url}
                        alt="Defect Angle View"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-3">
                        <span className="text-xs text-emerald-300 font-mono font-medium flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-emerald-400" /> {defectAngles[selectedAngle].desc}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Angle Selector Tabs */}
                <div className="flex gap-2">
                  {defectAngles.map((angle, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAngle(idx)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        selectedAngle === idx
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {angle.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-950/60 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-emerald-400 font-bold">100% Timestamped Photo Proof</span>
              <span>Client Digital Sign-Off</span>
            </div>
          </SpotlightCard>

          {/* Card 2: Live Multi-Bay Dispatch System */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                  Shop Floor Control
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Live Bay Board with Elapsed Timers</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Mount on shop iPads or wall monitors. Technicians advance vehicles across bays with one tap, triggering audio chimes and synchronizing stage completions in real time.
              </p>

              {/* Interactive Bay Stage Simulator */}
              <div className="rounded-2xl bg-[#070D0B] border border-emerald-950/70 p-4 mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bay Simulation</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setActiveBay("wash")}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                        activeBay === "wash"
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      Bay 1: Decon
                    </button>
                    <button
                      onClick={() => setActiveBay("correct")}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                        activeBay === "correct"
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      Bay 2: Polish
                    </button>
                    <button
                      onClick={() => setActiveBay("coat")}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                        activeBay === "coat"
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      Bay 3: Ceramic
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B1511] border border-emerald-900/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-mono">Work Order #101 • Porsche 911 GT3 RS</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {activeBay === "wash" && "Chemical Decontamination & Foam Wash"}
                        {activeBay === "correct" && "2-Stage Multi-Step Paint Correction"}
                        {activeBay === "coat" && "5-Year 9H Graphene Matrix Ceramic"}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {activeBay === "wash" && "45m elapsed"}
                      {activeBay === "correct" && "180m elapsed"}
                      {activeBay === "coat" && "320m elapsed"}
                    </span>
                  </div>

                  <div className="mt-3 w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-emerald-950">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: activeBay === "wash" ? "25%" : activeBay === "correct" ? "65%" : "90%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-950/60 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-emerald-400 font-bold">Real-Time WebSocket Sync</span>
              <span>Zero Refresh Required</span>
            </div>
          </SpotlightCard>

          {/* Card 3: 1-Tap Interactive Upsell Engine */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                  Revenue Lift: +$340/Car
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">1-Tap Service Upsell Recommendation</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                When technicians spot water spots or dry leather during compounding, they trigger a photo-backed recommendation to the client’s live tracker. Clients approve with one tap.
              </p>

              {/* Interactive Upsell Card Simulator */}
              <div className="rounded-2xl bg-[#070D0B] border border-emerald-950/70 p-4 mb-4">
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    upsellAdded
                      ? "bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/50"
                      : "bg-[#0B1511] border-emerald-900/40 text-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Technician Recommendation
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">Ceramic Wheel & Caliper Protection</h4>
                      <p className="text-xs text-slate-400 mt-1">1,200°F heat barrier preventing track brake dust etching.</p>
                    </div>
                    <span className="text-sm font-mono font-bold text-white shrink-0">+$199</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-emerald-950/60">
                    <span className="text-xs text-slate-400">
                      Work Order Total: <strong className="text-white font-mono">{upsellAdded ? "$2,049" : "$1,850"}</strong>
                    </span>
                    <button
                      onClick={() => setUpsellAdded(!upsellAdded)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        upsellAdded
                          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                          : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      }`}
                    >
                      {upsellAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Approved
                        </>
                      ) : (
                        "Tap to Approve (+$199)"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-950/60 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-emerald-400 font-bold">34% Client Approval Rate</span>
              <span>Zero Pushy Phone Calls</span>
            </div>
          </SpotlightCard>

          {/* Card 4: 5-Star Google Review Shield */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                  Reputation Guardian
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">5-Star Google Review Shield</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                When ecstatic owners pick up their mirror-finish car, 5-star ratings route instantly to your official Google Maps profile. Any lower feedback triggers a private VIP alert to the studio owner.
              </p>

              {/* Interactive Review Simulator */}
              <div className="rounded-2xl bg-[#070D0B] border border-emerald-950/70 p-4 mb-4">
                <div className="text-center py-2">
                  <span className="text-xs text-slate-400">Tap stars to test routing logic:</span>
                  <div className="flex justify-center gap-2 mt-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setSelectedRating(star)}
                        className="transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= selectedRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-[#0B1511] border border-emerald-900/30 text-xs">
                    {selectedRating >= 4 ? (
                      <div className="text-emerald-300 flex items-center justify-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Directs to Google Maps Review Page (Boosts Local SEO)
                      </div>
                    ) : (
                      <div className="text-amber-300 flex items-center justify-center gap-1.5 font-bold">
                        <Shield className="w-4 h-4 text-amber-400" />
                        Private Internal Alert to Owner (Prevents Public Negative Review)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-950/60 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-emerald-400 font-bold">4.9 / 5.0 Average Studio Rating</span>
              <span>Automated Post-Handover</span>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
