'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { playTick, playSuccessChime } from './soundEffects';

export function StudioRoiCalculator() {
  const [bays, setBays] = useState(4);
  const [carsPerMonth, setCarsPerMonth] = useState(24);
  const [avgTicket, setAvgTicket] = useState(2800);
  const [upsellLift, setUpsellLift] = useState(1250);

  // Calculations
  const upsellConversionRate = 0.58; // 58% conservative conversion with 4K photo proof
  const monthlyUpsellCars = Math.round(carsPerMonth * upsellConversionRate);
  const monthlyUpsellRevenue = monthlyUpsellCars * upsellLift;
  const annualProfitLift = monthlyUpsellRevenue * 12;

  const handleSlider = (setter: (v: number) => void, val: number) => {
    setter(val);
    playTick();
  };

  return (
    <section className="relative w-full py-24 bg-[#06080D] border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400">
            <Calculator className="w-3.5 h-3.5" />
            <span>ROI & MARGIN ACCELERATOR</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Calculate Your Studio Revenue Lift.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            See how much high-margin revenue SwiftTab unlocks by replacing verbal phone calls with 1-tap photo-verified mobile upsells.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders Controller */}
          <div className="lg:col-span-7 space-y-6 p-6 sm:p-8 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md">
            {/* Slider 1: Active Bays */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-300 font-bold uppercase">Active Detailing Bays</span>
                <span className="text-emerald-400 font-extrabold text-sm">{bays} Bays</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={bays}
                onChange={(e) => handleSlider(setBays, Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: Cars Serviced per Month */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-300 font-bold uppercase">Vehicles Serviced Per Month</span>
                <span className="text-emerald-400 font-extrabold text-sm">{carsPerMonth} Cars</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                value={carsPerMonth}
                onChange={(e) => handleSlider(setCarsPerMonth, Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 3: Base Ticket Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-300 font-bold uppercase">Average Base Ticket</span>
                <span className="text-emerald-400 font-extrabold text-sm">${avgTicket.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="800"
                max="8000"
                step="100"
                value={avgTicket}
                onChange={(e) => handleSlider(setAvgTicket, Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 4: Upsell Value per Vehicle */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-300 font-bold uppercase">Average 1-Tap Upsell Value (PPF / Ceramic)</span>
                <span className="text-emerald-400 font-extrabold text-sm">${upsellLift.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="400"
                max="3500"
                step="50"
                value={upsellLift}
                onChange={(e) => handleSlider(setUpsellLift, Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Revenue Lift HUD */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)] space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>PROJECTED ANNUAL RETURN</span>
            </div>

            <div>
              <div className="text-xs font-mono text-zinc-400 uppercase">ADDITIONAL ANNUAL PROFIT:</div>
              <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight mt-1">
                +${annualProfitLift.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-400 font-mono mt-1">
                +${monthlyUpsellRevenue.toLocaleString()} extra net revenue every month
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-2 text-xs font-mono text-zinc-300">
              <div className="flex justify-between">
                <span>ESTIMATED UPSELL APPROVALS:</span>
                <span className="text-white font-bold">{monthlyUpsellCars} vehicles / mo</span>
              </div>
              <div className="flex justify-between">
                <span>SWIFTTAB PRO COST:</span>
                <span className="text-zinc-400">$349 / mo</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>SOFTWARE PAYBACK PERIOD:</span>
                <span>Under 4 Days</span>
              </div>
            </div>

            <button
              onClick={() => {
                playSuccessChime();
                window.location.href = '/demo';
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98]"
            >
              <span>Test In Live Bay Sandbox</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
