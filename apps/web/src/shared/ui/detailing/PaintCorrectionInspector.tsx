'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, AlertCircle, CheckCircle2, Lightbulb, Play, Pause } from 'lucide-react';
import { playTick, playReticleLock } from './soundEffects';

export function PaintCorrectionInspector() {
  const [sliderPos, setSliderPos] = useState(52);
  const [highCRI, setHighCRI] = useState(true);
  const [isAutoScanning, setIsAutoScanning] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-oscillate slider when user is not manually dragging
  useEffect(() => {
    if (!isAutoScanning) return;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.035;
      const pos = Math.round(50 + 35 * Math.sin(t));
      setSliderPos(pos);
    }, 45);
    return () => clearInterval(interval);
  }, [isAutoScanning]);

  const handleSliderMove = (val: number) => {
    setIsAutoScanning(false);
    setSliderPos(val);
    playTick();
  };

  return (
    <section className="relative w-full py-24 bg-[#07090E] border-b border-zinc-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-amber-500/30 text-xs font-mono text-amber-400">
            <SlidersHorizontal className="w-3.5 h-3.5 animate-spin" />
            <span>OPTICAL MICRON ANALYSIS // LIVE LASER DIVIDER</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Flawless Paint Inspection. <span className="text-amber-400">Zero Guesswork.</span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Watch the active laser beam below reveal clearcoat depth, rotary buffer trails, and 99.8% liquid mirror gloss.
          </p>
        </div>

        {/* Interactive Dual-Panel Inspector */}
        <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-[0_25px_90px_rgba(0,0,0,0.9)]">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-zinc-800 bg-zinc-900/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-mono text-[10px] sm:text-xs text-zinc-300 font-bold uppercase">
                Ferrari 812 Rosso Corsa Hood
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsAutoScanning(!isAutoScanning)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition"
              >
                {isAutoScanning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-zinc-500" />}
                <span>{isAutoScanning ? 'AUTO-SWEEP ON' : 'PAUSED'}</span>
              </button>

              <button
                onClick={() => {
                  setHighCRI(!highCRI);
                  playReticleLock();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                  highCRI
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-sm'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>98+ CRI LIGHT</span>
              </button>
            </div>
          </div>

          {/* Interactive Image Splitter Canvas */}
          <div 
            ref={containerRef}
            onClick={() => setIsAutoScanning(false)}
            className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden select-none cursor-ew-resize group"
          >
            {/* Base Ferrari Inspection Photo */}
            <img
              src="/images/detailing/ferrari_inspection.jpg"
              alt="Ferrari Hood Paint Inspection"
              className="w-full h-full object-cover"
            />

            {/* High-CRI optical simulated filter */}
            {highCRI && (
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.85), transparent 75%)'
                }}
              />
            )}

            {/* Glowing Laser Divider Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-white to-amber-400 shadow-[0_0_25px_#f59e0b] z-20 pointer-events-none transition-all duration-75"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-2xl text-xs font-bold text-black pointer-events-none animate-pulse">
                ↔
              </div>
            </div>

            {/* Before Label — overlaid bottom-left, smaller on mobile */}
            <div className="absolute bottom-3 left-3 z-10 p-2.5 sm:p-3.5 rounded-xl bg-zinc-950/90 border border-rose-500/70 backdrop-blur-md max-w-[140px] sm:max-w-[200px]">
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold text-rose-400">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>ORIGINAL DEFECTS</span>
              </div>
              <div className="text-[10px] text-zinc-300 mt-0.5 hidden sm:block">
                Heavy micro-marring, spiderweb wash swirls.
              </div>
              <div className="mt-1 text-[10px] font-mono font-bold text-white">
                <span className="text-rose-400">142.6 μm</span>
              </div>
            </div>

            {/* After Label — overlaid bottom-right, smaller on mobile */}
            <div className="absolute bottom-3 right-3 z-10 p-2.5 sm:p-3.5 rounded-xl bg-zinc-950/90 border border-emerald-500/70 backdrop-blur-md max-w-[140px] sm:max-w-[200px]">
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold text-emerald-400">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>99.8% GLOSS</span>
              </div>
              <div className="text-[10px] text-zinc-300 mt-0.5 hidden sm:block">
                Jeweled Rotary Refinement + Ceramic.
              </div>
              <div className="mt-1 text-[10px] font-mono font-bold text-white">
                <span className="text-emerald-400">139.2 μm</span>
              </div>
            </div>
          </div>

          {/* Bottom Range Slider Controller */}
          <div className="p-6 bg-zinc-900/90 border-t border-zinc-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="text-rose-400 font-bold">1,500 GRIT SWIRLS</span>
              <span className="text-amber-400 font-bold">LASER POSITION: {sliderPos}%</span>
              <span className="text-emerald-400 font-bold">99.8% LIQUID MIRROR</span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              value={sliderPos}
              onChange={(e) => handleSliderMove(Number(e.target.value))}
              className="w-full accent-amber-500 h-2.5 bg-zinc-800 rounded-lg cursor-ew-resize"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
