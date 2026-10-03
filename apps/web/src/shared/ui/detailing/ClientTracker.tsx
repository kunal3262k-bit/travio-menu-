"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

interface ClientTrackerProps {
  car?: any;
}

export function ClientTracker({ car: initialCar }: ClientTrackerProps) {
  // Default to the flagship Porsche 911 GT3 RS if no car is passed
  const [upsellApproved, setUpsellApproved] = useState(false);
  const [activeStep, setActiveStep] = useState(2); // Stage 3: Paint correction in progress

  const car = initialCar || {
    carYear: 2024,
    carBrand: "Porsche",
    carModel: "911 GT3 RS",
    carColor: "Black Metallic",
    carLicensePlate: "GT3-APEX",
    totalUsd: 1850,
  };

  const currentTotal = car.totalUsd + (upsellApproved ? 199 : 0);

  const steps = [
    { title: "Intake Inspection & Defect Mapping", status: "COMPLETED", time: "Today, 10:15 AM" },
    { title: "Foam Decon & Chemical Clay Bar", status: "COMPLETED", time: "Today, 11:30 AM" },
    { title: "2-Stage Paint Correction (85% Swirl Removal)", status: "IN_PROGRESS", time: "Active in Bay 2" },
    { title: "9H Graphene Ceramic Coating", status: "PENDING", time: "Est. 3:00 PM" },
    { title: "Infrared Curing & Delivery Handover", status: "PENDING", time: "Tomorrow, 11:00 AM" },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-[#070D0B] text-slate-100 rounded-3xl border border-emerald-950/80 shadow-2xl overflow-hidden font-sans">
      {/* Top Studio Header */}
      <div className="p-5 border-b border-emerald-950/70 bg-[#09130F] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-emerald-400 uppercase">APEX AUTO SPA</h3>
            <p className="text-[11px] text-slate-400">Live Vehicle Service Portal</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Sockets
        </span>
      </div>

      {/* Vehicle Identity Banner */}
      <div className="p-5 border-b border-emerald-950/60 bg-gradient-to-b from-[#0A1611] to-[#070D0B]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Your Vehicle</span>
            <h2 className="text-lg font-black text-white mt-0.5">
              {car.carYear} {car.carBrand} {car.carModel}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <span>{car.carColor}</span>
              <span>•</span>
              <span className="font-mono text-emerald-400">{car.carLicensePlate}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative">
            <Image
              src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=300&q=80"
              alt="Porsche 911"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* 5-Stage Animated Timeline */}
      <div className="p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Milestone Progress</h4>

        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-950/80">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isCurrent = idx === activeStep;

            return (
              <div key={idx} className="relative group">
                {/* Node icon */}
                <span
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                      : isCurrent
                      ? "bg-slate-950 border-emerald-400 text-emerald-400 ring-2 ring-emerald-400/20"
                      : "bg-slate-900 border-slate-800 text-slate-600"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                </span>

                <div className="flex items-baseline justify-between">
                  <h5
                    className={`text-xs font-bold leading-tight ${
                      isCompleted ? "text-slate-200" : isCurrent ? "text-emerald-300" : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </h5>
                  <span className="text-[10px] text-slate-500 font-mono ml-2 shrink-0">{step.time}</span>
                </div>

                {isCurrent && (
                  <div className="mt-2.5">
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-emerald-950">
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full w-[85%] rounded-full animate-pulse" />
                    </div>

                    {/* Macro Inspection Photo Card */}
                    <div className="mt-3 relative h-36 w-full rounded-xl overflow-hidden border border-emerald-900/50">
                      <Image
                        src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80"
                        alt="Macro Paint Polish"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5">
                        <span className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Hood Paint Correction: 85% Swirls Eliminated
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 1-Tap Upsell Recommendation Card */}
      <div className="p-5 pt-0">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            upsellApproved
              ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30"
              : "bg-[#091510] border-emerald-800/40 hover:border-emerald-600/60"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Technician Recommendation
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-white">+$199</span>
          </div>

          <h5 className="text-sm font-bold text-white mt-2">Ceramic Wheel & Caliper Protection</h5>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            1,200°F thermal ceramic coating applied to all 4 wheels. Shields against corrosive track brake dust and road salt.
          </p>

          <div className="mt-3.5 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Normally $250 • Bundled Deal</span>
            {upsellApproved ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Added to Work Order
              </span>
            ) : (
              <button
                onClick={() => setUpsellApproved(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition"
              >
                <span>Approve Addition</span>
                <Zap className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Bar with Total and Chat */}
      <div className="p-4 border-t border-emerald-950/80 bg-[#09120E] flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Work Order Total</span>
          <span className="text-lg font-black font-mono text-white">${currentTotal.toLocaleString()}</span>
        </div>

        <button className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Chat with Detailer</span>
        </button>
      </div>
    </div>
  );
}
