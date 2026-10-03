"use client";

import React, { useState } from "react";
import { 
  Camera, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  FileCheck,
  Zap,
  AlertTriangle
} from "lucide-react";

export function IntakeWalkaroundSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: "01",
      badge: "STEP 1 // 30 SECONDS",
      title: "4-Angle Smartphone Scan",
      subtitle: "Technician walks around with any phone or shop iPad",
      desc: "Snaps 4 wide-angle photos (front, driver side, rear, passenger side). With one tap on the photo, they drop pins on pre-existing rock chips, curb rash, or deep scratches.",
      icon: Camera,
      pill: "Drop-Off Walkaround",
      bulletPoints: [
        "Works on any iOS or Android browser (zero app install)",
        "Precision reticle pin drops directly on damage points",
        "Auto-tags date, time, and shop technician ID"
      ],
      previewContent: {
        header: "Intake Camera // Ferrari 812 GTS",
        tag: "4 PINS DROPPED",
        badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        items: [
          { text: "Bumper: 38µm rock chip (primer exposed)", sev: "High" },
          { text: "Left Front Rim: 2-inch curb rash", sev: "Medium" },
          { text: "Rear Decklid: Acid rain mineral etching", sev: "Low" }
        ]
      }
    },
    {
      step: "02",
      badge: "STEP 2 // 15 SECONDS",
      title: "Instant SMS Client Sign-Off",
      subtitle: "Customer signs digitally on their phone before compounding",
      desc: "SwiftTab generates a secure, tokenized link and texts the client immediately. The customer reviews the 4 marked photos and signs with their thumb while getting into their Uber.",
      icon: Smartphone,
      pill: "Thumb Signature Waiver",
      bulletPoints: [
        "100% zero login, zero friction for the car owner",
        "Binds pre-existing damage to customer's timestamped signature",
        "Bay board badge turns green once client approves"
      ],
      previewContent: {
        header: "Client SMS Link // Safari Mobile",
        tag: "SIGNED & VERIFIED ✓",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        items: [
          { text: "Client: Alexander Wright (Verified Mobile)", sev: "Verified" },
          { text: "Timestamp: 10:14:22 AM UTC", sev: "Locked" },
          { text: "Signed: Legal Pre-Inspection Waiver", sev: "Binding" }
        ]
      }
    },
    {
      step: "03",
      badge: "STEP 3 // POST-DECON PROTECTION",
      title: "The 'Clean Paint' Legal Clause",
      subtitle: "Guaranteed protection against scratches hidden under dirt",
      desc: "Every waiver embeds the industry-standard clean paint clause. If micro-marring or buffer trails were concealed by road grime or wax, your studio is 100% legally shielded.",
      icon: ShieldCheck,
      pill: "Liability Vault",
      bulletPoints: [
        "Covers defects revealed only after chemical decon wash",
        "Tech snaps 1 photo under inspection lights to update client",
        "Disputes are eliminated before they reach Google reviews"
      ],
      previewContent: {
        header: "Liability Shield // Inspection Terms",
        tag: "STUDIO PROTECTED",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        items: [
          { text: "Clause: Grime-obscured defects disclaimed", sev: "Active" },
          { text: "Insurance: Downloadable 1-Click PDF", sev: "Archived" },
          { text: "Dispute Liability Rate: 0.0%", sev: "Guaranteed" }
        ]
      }
    }
  ];

  return (
    <section className="py-24 border-b border-zinc-800/80 bg-[#06080E] relative z-10 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HOW INTAKE DEFENSE WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            The 60-Second Digital Defect Shield.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Stop losing $800 on disputed scratches. Here is exactly how technicians protect your studio and book signed pre-inspection waivers before a buffer ever touches paint.
          </p>
        </div>

        {/* 3-Step Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isHovered = activeStep === idx;

            return (
              <div
                key={st.step}
                onMouseEnter={() => setActiveStep(idx)}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative border ${
                  isHovered
                    ? "bg-zinc-900/90 border-emerald-500/60 shadow-[0_20px_60px_rgba(16,185,129,0.15)] -translate-y-1"
                    : "bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div>
                  {/* Top Badge & Number */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                      {st.badge}
                    </span>
                    <span className="text-2xl font-black font-mono text-zinc-700">
                      {st.step}
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {st.title}
                    </h3>
                  </div>

                  <p className="text-xs font-mono text-emerald-400/90 font-medium mb-3">
                    {st.subtitle}
                  </p>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-5">
                    {st.desc}
                  </p>

                  {/* Bullets */}
                  <ul className="space-y-2 mb-6">
                    {st.bulletPoints.map((bp, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mockup Card */}
                <div className="rounded-xl bg-black/60 border border-zinc-800/80 p-3.5 font-mono space-y-2 mt-2">
                  <div className="flex items-center justify-between text-[11px] pb-2 border-b border-zinc-800">
                    <span className="text-zinc-400 truncate">{st.previewContent.header}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${st.previewContent.badgeColor}`}>
                      {st.previewContent.tag}
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {st.previewContent.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center justify-between text-[10px] text-zinc-300">
                        <span className="truncate pr-2">• {item.text}</span>
                        <span className="text-emerald-400 font-bold shrink-0">{item.sev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">What if a customer arrives with a filthy, mud-covered car?</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                The embedded <span className="text-emerald-300 font-semibold">&quot;Clean Paint Clause&quot;</span> ensures that scratches revealed only after the decontamination wash are documented under inspection lights before compounding. You are 100% shielded.
              </p>
            </div>
          </div>
          <a
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shrink-0 shadow-lg shadow-emerald-500/25 transition-all"
          >
            Try Intake Free →
          </a>
        </div>
      </div>
    </section>
  );
}
