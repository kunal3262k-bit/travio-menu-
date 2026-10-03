"use client";

import { useState } from "react";
import { BayBoard } from "./BayBoard";
import { ClientTracker } from "./ClientTracker";
import { ArrowRight, CheckCircle2, Laptop, Smartphone, Sparkles } from "lucide-react";

export function ApexDemoSandbox() {
  const [selectedCar, setSelectedCar] = useState<any>(null);

  return (
    <div className="w-full space-y-6">
      {/* Interactive Controller Bar */}
      <div className="rounded-2xl border border-emerald-950/70 bg-gradient-to-r from-[#070D0B] via-[#091510] to-[#070D0B] p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> LIVE TWO-WAY INTERACTIVE DEMO
            </div>
            <h3 className="text-xl font-black text-white">Experience ApexBay in Real Time</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Tap <span className="text-emerald-300 font-bold">&quot;Next Bay&quot;</span> on the Shop Display to see the customer&apos;s phone update instantly. Tap <span className="text-emerald-300 font-bold">&quot;Approve Addition&quot;</span> on the phone to watch the work order total sync live.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <Laptop className="w-3.5 h-3.5 text-emerald-400" /> Shop Floor View
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Client Mobile Tracker
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Bay Board (Desktop/iPad) on Left/Top + Client Mobile Tracker on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Shop Bay Dispatch Board (7 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="relative">
            <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/50 text-[11px] font-bold text-emerald-300 z-10 flex items-center gap-1.5 shadow-md">
              <Laptop className="w-3 h-3 text-emerald-400" /> Shop Floor iPad & Wall Display
            </div>
            <div className="pt-2">
              <BayBoard
                onSelectCar={(car) => setSelectedCar(car)}
                selectedCarId={selectedCar?.id}
              />
            </div>
          </div>
        </div>

        {/* Right: Client Phone Screen (5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center">
          <div className="relative w-full max-w-sm">
            <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/50 text-[11px] font-bold text-emerald-300 z-10 flex items-center gap-1.5 shadow-md">
              <Smartphone className="w-3 h-3 text-emerald-400" /> Car Owner&apos;s Phone (Zero Login)
            </div>
            <div className="pt-2">
              <ClientTracker car={selectedCar} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
