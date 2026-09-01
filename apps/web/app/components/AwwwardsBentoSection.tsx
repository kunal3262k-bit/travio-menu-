"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Activity,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Utensils,
  Camera,
  Star,
  Check,
  MessageSquare,
  Flame,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import SpotlightCard from "./SpotlightCard";

export function AwwwardsBentoSection() {
  // Bento 1 State: Active Angle
  const [selectedAngle, setSelectedAngle] = useState(0);
  const dishAngles = [
    {
      label: "Front 45°",
      url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=85",
      desc: "Hero dining perspective with depth of field"
    },
    {
      label: "Top-Down",
      url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=85",
      desc: "Geometric flatlay arrangement"
    },
    {
      label: "Macro Close-Up",
      url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=85",
      desc: "Appetizing sizzle and glaze texture"
    }
  ];

  // Bento 2 State: Active Macro Filter
  const [activeMacroFilter, setActiveMacroFilter] = useState<"protein" | "keto" | "low_cal">("protein");

  // Bento 3 State: Upsell Toggle
  const [upsellAdded, setUpsellAdded] = useState(false);

  // Bento 4 State: Interactive Review Stars
  const [selectedRating, setSelectedRating] = useState(5);

  return (
    <section className="py-20 lg:py-32 border-b border-emerald-950/40 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> High-Impact Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Four Living Systems That Drive Higher Spend.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3">
            Interactive, award-winning interfaces designed to turn passive diners into active orderers.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: 3D Food Studio & Angles */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                  Visual Experience
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Studio Photography & 3D Cards</h3>
              <p className="text-sm leading-relaxed text-slate-300 mb-6">
                Transform plain text items into high-resolution studio food photography. Diners tilt and interact with dishes in true 3D perspective with realistic depth, specular lighting, and steam effects.
              </p>

              {/* Interactive Multi-Angle Demo Sandbox */}
              <div className="rounded-2xl bg-[#070D0B] border border-emerald-500/20 p-4 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-950/60">
                  <span className="text-xs font-semibold text-slate-400">Live Angle Simulator</span>
                  <div className="flex items-center gap-1">
                    {dishAngles.map((angle, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedAngle(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedAngle === idx
                            ? "bg-emerald-500 text-slate-950 shadow-md scale-105"
                            : "bg-emerald-950/40 text-slate-400 hover:text-white"
                        }`}
                      >
                        {angle.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative h-44 mt-3 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#0E1A16] to-[#070D0B]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedAngle}
                      initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.92, rotate: 4 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="relative w-36 h-36 rounded-full p-1.5 bg-emerald-950/60 border border-emerald-500/30 shadow-2xl"
                    >
                      <Image
                        src={dishAngles[selectedAngle].url}
                        alt="Dish Angle Preview"
                        fill
                        className="object-cover rounded-full"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-medium text-slate-300 bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-md border border-emerald-500/20">
                    <span>{dishAngles[selectedAngle].desc}</span>
                    <span className="text-emerald-400 font-bold">3D Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-950/60 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-emerald-400 font-mono">+32% Engagement</span>
                <span className="block text-xs text-slate-400 mt-0.5">vs flat paper or PDF menus</span>
              </div>
              <Link
                href="/demo"
                className="text-xs font-bold text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </SpotlightCard>

          {/* Card 2: Live Macro & Nutrition Telemetry */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                  Nutrition & Health
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Real-Time Nutrition & Macro Intelligence</h3>
              <p className="text-sm leading-relaxed text-slate-300 mb-6">
                Cater to health-conscious diners and fitness enthusiasts with instant calorie counts, protein grams, healthy fats, net carbs, and allergen transparency across every dish.
              </p>

              {/* Interactive Macro Simulator */}
              <div className="rounded-2xl bg-[#070D0B] border border-emerald-500/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Diner Preference Filter</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveMacroFilter("protein")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeMacroFilter === "protein"
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-emerald-950/40 text-slate-400 hover:text-white"
                      }`}
                    >
                      High Protein
                    </button>
                    <button
                      onClick={() => setActiveMacroFilter("keto")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeMacroFilter === "keto"
                          ? "bg-purple-500 text-white shadow-md"
                          : "bg-emerald-950/40 text-slate-400 hover:text-white"
                      }`}
                    >
                      Keto
                    </button>
                    <button
                      onClick={() => setActiveMacroFilter("low_cal")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeMacroFilter === "low_cal"
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "bg-emerald-950/40 text-slate-400 hover:text-white"
                      }`}
                    >
                      &lt;400 kcal
                    </button>
                  </div>
                </div>

                {/* Macro Progress Bars */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white">
                      {activeMacroFilter === "protein" ? "Grilled Chicken / Paneer Tikka" : activeMacroFilter === "keto" ? "Avocado Keto Bowl" : "Garden Protein Salad"}
                    </span>
                    <span className="text-emerald-400 font-mono">
                      {activeMacroFilter === "protein" ? "380 kcal · 32g Protein" : activeMacroFilter === "keto" ? "420 kcal · 4g Net Carbs" : "290 kcal · 18g Protein"}
                    </span>
                  </div>

                  {/* Animated Split Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden flex">
                    <motion.div
                      animate={{
                        width: activeMacroFilter === "protein" ? "45%" : activeMacroFilter === "keto" ? "25%" : "30%"
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-blue-500"
                    />
                    <motion.div
                      animate={{
                        width: activeMacroFilter === "protein" ? "35%" : activeMacroFilter === "keto" ? "65%" : "25%"
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-emerald-500"
                    />
                    <motion.div
                      animate={{
                        width: activeMacroFilter === "protein" ? "20%" : activeMacroFilter === "keto" ? "10%" : "45%"
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Protein</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy Fats</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Net Carbs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-950/60 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-emerald-400 font-mono">40% of Urban Diners</span>
                <span className="block text-xs text-slate-400 mt-0.5">actively track nutritional intake</span>
              </div>
              <Link
                href="/demo"
                className="text-xs font-bold text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>View Macro Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </SpotlightCard>

          {/* Card 3: Smart Chef Pairing Upsells */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                  Revenue Engine
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Smart Chef Pairing Upsells</h3>
              <p className="text-sm leading-relaxed text-slate-300 mb-6">
                Automatically recommend high-margin sides, artisanal breads, and signature beverages at the exact point of ordering with context-aware social proof.
              </p>

              {/* Interactive Upsell Simulator */}
              <div className="rounded-2xl bg-[#070D0B] border border-emerald-500/20 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Customer Cart Action</span>
                  <span className="text-emerald-400 font-bold">Added: Paneer Tikka (₹340)</span>
                </div>

                {/* Animated Upsell Prompt */}
                <motion.div
                  animate={{
                    borderColor: upsellAdded ? "rgba(0, 184, 124, 0.8)" : "rgba(0, 184, 124, 0.3)",
                    backgroundColor: upsellAdded ? "rgba(0, 184, 124, 0.12)" : "rgba(11, 21, 18, 0.8)"
                  }}
                  className="p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-emerald-950/80 shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=200&q=80"
                        alt="Butter Garlic Naan"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Butter Garlic Naan</h4>
                      <p className="text-[11px] text-emerald-400 font-medium">84% of guests pair this (+₹80)</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setUpsellAdded(!upsellAdded)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      upsellAdded
                        ? "bg-emerald-500 text-slate-950 shadow-md"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900"
                    }`}
                  >
                    {upsellAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added!
                      </>
                    ) : (
                      "+ Add to Order"
                    )}
                  </button>
                </motion.div>

                <div className="text-right text-[11px] text-slate-400 font-mono">
                  Order Total: <strong className="text-white">{upsellAdded ? "₹420" : "₹340"}</strong>{" "}
                  {upsellAdded && <span className="text-emerald-400 font-bold">(+24% AOV Lift)</span>}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-950/60 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-emerald-400 font-mono">+18% to +24%</span>
                <span className="block text-xs text-slate-400 mt-0.5">Average Order Value Lift</span>
              </div>
              <Link
                href="/demo"
                className="text-xs font-bold text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>Test Pairing Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </SpotlightCard>

          {/* Card 4: Review Shield & WhatsApp CRM */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                  Reputation & CRM
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Google Review Shield & WhatsApp CRM</h3>
              <p className="text-sm leading-relaxed text-slate-300 mb-6">
                Seamlessly route 5-star ratings to Google Maps to surge public rankings. Automatically capture 1-3 star feedback privately to WhatsApp to resolve guest complaints instantly.
              </p>

              {/* Interactive Review Routing Simulator */}
              <div className="rounded-2xl bg-[#070D0B] border border-emerald-500/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Tap a Star to Test Routing</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setSelectedRating(star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= selectedRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Output Banner */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedRating}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                      selectedRating >= 4
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                        : "bg-amber-950/40 border-amber-500/40 text-amber-200"
                    }`}
                  >
                    {selectedRating >= 4 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-white">Public Google Maps Routing ({selectedRating}★)</strong>
                          <span>Redirecting guest to leave a 5-star review on Google Maps to boost ranking.</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-white">Private WhatsApp Manager Alert ({selectedRating}★)</strong>
                          <span>Negative review intercepted. Alert sent directly to manager to resolve table issue privately.</span>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-950/60 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-emerald-400 font-mono">4.8 / 5.0 Rating</span>
                <span className="block text-xs text-slate-400 mt-0.5">+ 100% verified guest contact list</span>
              </div>
              <Link
                href="/demo"
                className="text-xs font-bold text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>See Review Shield</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

export default AwwwardsBentoSection;
