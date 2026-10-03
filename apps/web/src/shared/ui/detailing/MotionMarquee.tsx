'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Sparkles, CheckCircle2, Zap } from 'lucide-react';

const MARQUEE_ITEMS = [
  { name: 'XPEL Film Workflows', tag: 'ULTIMATE PLUS 8.5 MIL', icon: ShieldCheck, color: 'text-amber-400' },
  { name: 'Gyeon Quartz Infinite', tag: '9H DUAL-INFUSION', icon: Award, color: 'text-emerald-400' },
  { name: 'STEK DynoShield', tag: 'SELF-HEALING HYDRO', icon: Sparkles, color: 'text-cyan-400' },
  { name: '3M Scotchgard Pro', tag: 'SERIES 4.0 PPF', icon: ShieldCheck, color: 'text-rose-400' },
  { name: 'SunTek Reaction', tag: 'CERAMIC-INFUSED FILM', icon: CheckCircle2, color: 'text-teal-300' },
  { name: 'Modesta Pure Glass', tag: 'TITANIUM MATRIX COAT', icon: Award, color: 'text-purple-400' },
  { name: 'VIN-Tied Audit Log', tag: 'IMMUTABLE DIGITAL DOSSIER', icon: Zap, color: 'text-blue-400' },
  { name: 'Kamikaze Collection', tag: 'CONCOURSE ARTISAN', icon: Sparkles, color: 'text-amber-300' },
];

export function MotionMarquee() {
  return (
    <div className="relative w-full py-6 overflow-hidden bg-[#05070B] border-y border-zinc-800/80 z-20">
      {/* Gradient Fade Masks on sides */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-[#05070B] via-[#05070B]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-[#05070B] via-[#05070B]/80 to-transparent z-10 pointer-events-none" />

      {/* Infinite Scrolling Track */}
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex items-center gap-8 whitespace-nowrap w-max"
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/90 backdrop-blur-md hover:border-zinc-700 transition-colors"
            >
              <div className={`p-1.5 rounded-lg bg-zinc-950/80 ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white tracking-wide font-sans">
                  {item.name}
                </span>
                <span className="text-[9px] font-mono text-zinc-400 tracking-wider">
                  {item.tag}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
