"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ScanLine,
  QrCode,
  Smartphone,
  Utensils,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Check
} from "lucide-react";
import SpotlightCard from "./SpotlightCard";

const workflowSteps = [
  {
    step: "01",
    icon: ScanLine,
    title: "60-Second Menu Digitization",
    description: "Upload a photo of your current paper menu. Our intelligence engine extracts items, categories, photography, and macro profiles instantly."
  },
  {
    step: "02",
    icon: QrCode,
    title: "Deploy QR Stands on Tables",
    description: "Place high-resolution acrylic QR stands across dine-in tables and car-side spots. Guests scan with any camera—zero app download required."
  },
  {
    step: "03",
    icon: Smartphone,
    title: "Visual Menu Ordering",
    description: "Guests browse high-resolution studio photos of dishes, filter by dietary preferences, and customize preparation notes in real time."
  },
  {
    step: "04",
    icon: Utensils,
    title: "Instant Kitchen KDS Dispatch",
    description: "Orders flash immediately to kitchen display screens with clear preparation chimes, table numbers, and item modifiers—eliminating delay."
  },
  {
    step: "05",
    icon: CreditCard,
    title: "Direct UPI Settlement & Split",
    description: "Guests split bills equally or pay instantly via direct UPI QR code. 100% of revenue settles into your bank with 0% commission."
  },
  {
    step: "06",
    icon: MessageSquare,
    title: "WhatsApp Receipts & Reviews",
    description: "Customers receive digital itemized receipts on WhatsApp while satisfied diners are seamlessly routed to elevate your Google Maps rating."
  }
];

export function AwwwardsWorkflowSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-32 border-b border-emerald-950/40 bg-[#060A09] relative overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,184,124,0.08),transparent_70%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
            Frictionless Flow
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            From Scan to Kitchen in 6 Seconds.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Zero hardware complexity. Set up in minutes on any tablet, phone, or laptop browser.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            const isHovered = activeStep === idx;

            return (
              <motion.div
                key={idx}
                onMouseEnter={() => setActiveStep(idx)}
                onMouseLeave={() => setActiveStep(null)}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative rounded-2xl bg-[#0B1512] border border-emerald-500/15 p-7 hover:border-emerald-500/50 hover:shadow-[0_12px_30px_rgba(0,184,124,0.12)] transition-all duration-300 group overflow-hidden"
              >
                {/* Glow Accent Beam */}
                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-b from-emerald-500/10 to-transparent" />

                <div className="relative z-10 flex items-center justify-between mb-4">
                  <span className="font-mono text-3xl font-black text-emerald-500/30 group-hover:text-emerald-400 transition-colors">
                    {step.step}
                  </span>
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-200 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AwwwardsWorkflowSection;
