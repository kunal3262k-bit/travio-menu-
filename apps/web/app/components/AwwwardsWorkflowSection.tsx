"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Layers,
  Smartphone,
  Zap,
  Flame,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import SpotlightCard from "./SpotlightCard";

const studioWorkflowSteps = [
  {
    step: "01",
    icon: Camera,
    title: "60-Sec Intake & Defect Mapping",
    description:
      "Technician walks around the vehicle, snaps 4-angle photos of existing rock chips and curb rash. Client signs off digitally via SMS—shielding your studio from false damage claims.",
  },
  {
    step: "02",
    icon: Layers,
    title: "Live Bay Stage Assignment",
    description:
      "Assign vehicle to Bay 1 (Decon) or Bay 2 (Paint Correction) on the shop floor display. Elapsed timers track vehicle turnaround times automatically.",
  },
  {
    step: "03",
    icon: Smartphone,
    title: "Client Live Vehicle Tracker",
    description:
      "Car owners watch their vehicle advance through decontamination, compounding, and ceramic application with real-time photo milestones—killing 90% of phone call interruptions.",
  },
  {
    step: "04",
    icon: Zap,
    title: "1-Tap Add-On Service Upsell",
    description:
      "Spot water spots or dry leather during compounding? Trigger a photo-backed recommendation to the client's tracker. Clients approve with one tap, adding \$200–\$500 in pure margin.",
  },
  {
    step: "05",
    icon: Flame,
    title: "Infrared Curing & Quality Control",
    description:
      "Automated timers notify technicians when ceramic coating has reached peak curing. Multi-point final inspection ensures flawless optical clarity before handover.",
  },
  {
    step: "06",
    icon: Star,
    title: "Digital Handover & 5-Star Review",
    description:
      "Settle invoices via Stripe / Apple Pay with zero transaction delays. Delighted owners are routed directly to Google Maps to elevate your local studio ranking.",
  },
];

export function AwwwardsWorkflowSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-32 border-b border-emerald-950/40 bg-[#060A09] relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" /> Zero Friction Workflow
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            From Drop-Off to Delivery in 6 Flawless Steps.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3">
            Built specifically for the high-pressure reality of busy detailing bays. Fast, tactile, and requires zero complex training for technicians.
          </p>
        </div>

        {/* 6-Step Workflow Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studioWorkflowSteps.map((item, idx) => {
            const Icon = item.icon;
            const isHovered = activeStep === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveStep(idx)}
                onMouseLeave={() => setActiveStep(null)}
                className="transition-transform duration-300 hover:-translate-y-1"
              >
                <SpotlightCard className="h-full flex flex-col justify-between p-6">
                  <div>
                    {/* Header Row: Step Number & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-2xl font-black text-emerald-400/80">
                        {item.step}
                      </span>
                      <div
                        className={`p-3 rounded-2xl transition-all duration-300 ${
                          isHovered
                            ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 leading-snug">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-emerald-950/60 flex items-center justify-between text-xs font-semibold text-emerald-400/70">
                    <span>Stage {item.step} Protocol</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </SpotlightCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
