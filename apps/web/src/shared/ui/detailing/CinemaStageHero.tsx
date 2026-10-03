'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  Rotate3d, 
  Volume2, 
  VolumeX, 
  Sun,
  Moon,
  PlusCircle,
  CheckCircle2,
  ChevronDown,
  Zap,
  Star,
  Users,
  TrendingUp,
  X,
  ScanLine,
  Radio,
  Layers,
} from 'lucide-react';
import { playTick, playCardPop, playSuccessChime } from './soundEffects';
import { DefectMarker, DEFECT_MARKERS } from './SportsCoupe3D';

// Lazy-load Three.js Canvas to guarantee sub-3s TTI and prevent SSR window issues
const ThreeDHeroCanvas = dynamic(
  () => import('./ThreeDHeroCanvas').then((mod) => mod.ThreeDHeroCanvas),
  { ssr: false }
);

const PORSCHE_FINISHES = [
  { id: 'silver',  name: 'GT Silver Metallic',  hex: '#cbd5e1', treatment: 'Liquid Titanium Gloss' },
  { id: 'red',     name: 'Guards Red',           hex: '#b91c1c', treatment: 'Ceramic 9H Clearcoat' },
  { id: 'blue',    name: 'Miami Blue',           hex: '#0284c7', treatment: 'Self-Healing PPF Wrap' },
  { id: 'green',   name: 'Racing Green',         hex: '#064e3b', treatment: 'Graphene Matrix Infusion' },
  { id: 'chalk',   name: 'Crayon / Chalk',       hex: '#e2e8f0', treatment: 'Satin Zero-Swirl Shield' },
  { id: 'black',   name: 'Deep Onyx Metallic',   hex: '#111317', treatment: 'Mirror Concourse Glass' },
];

// Social proof studio count badges
const STUDIO_PARTNERS = [
  { abbr: 'TDT',  name: 'Top Detail Tokyo' },
  { abbr: 'PCA',  name: 'Pebble Creek Auto' },
  { abbr: 'VGC',  name: 'Vanguard Coatings' },
  { abbr: 'AOD',  name: 'Art of Detail' },
  { abbr: 'PPX',  name: 'PPF Xperts Miami' },
];

// Key metrics that update on defect selection
const LIVE_STATS = [
  { label: 'Studios Active',  value: '340+',  icon: Users, color: 'text-emerald-400' },
  { label: 'Upsells Logged',  value: '$1.4M',  icon: TrendingUp, color: 'text-cyan-400' },
  { label: 'Defects Caught',  value: '98k+',  icon: Zap, color: 'text-amber-400' },
  { label: 'Avg. Rating',     value: '4.9 Ã¢Ëœâ€¦', icon: Star, color: 'text-yellow-400' },
];

export function CinemaStageHero() {
  const [selectedMarker, setSelectedMarker] = useState<DefectMarker | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activePaintColor, setActivePaintColor] = useState('#cbd5e1');
  const [activePaintName, setActivePaintName] = useState('GT Silver Metallic');
  const [studioMode, setStudioMode] = useState<'inspection' | 'cyber'>('inspection');
  const [addedUpsells, setAddedUpsells] = useState<Record<string, boolean>>({});
  const [isLowPowerOrReducedMotion, setIsLowPowerOrReducedMotion] = useState(false);
  const [totalUpsellValue, setTotalUpsellValue] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) setIsLowPowerOrReducedMotion(true);
    }
  }, []);

  const handleSelectMarker = (marker: DefectMarker) => {
    setSelectedMarker(marker);
  };

  const handleAddUpsell = (marker: DefectMarker) => {
    if (addedUpsells[marker.id]) return;
    if (soundEnabled) playSuccessChime();
    setAddedUpsells((prev) => ({ ...prev, [marker.id]: true }));
    // Accumulate upsell totals for the live KPI counter
    const amount = parseInt(marker.upsellEstimate.replace(/[^0-9]/g, ''), 10) || 0;
    setTotalUpsellValue((prev) => prev + amount);
  };

  return (
    <section
      className="relative min-h-[100svh] w-full flex flex-col overflow-hidden bg-[#04060b] border-b border-zinc-800/70"
    >
      {/* ================================================================
          LAYER 1: Animated Gradient Mesh Background
          ================================================================ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep radial glow from bottom-center (studio floor bounce) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-emerald-600/8 rounded-full blur-[120px]" />
        {/* Top-left studio rim glow */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
        {/* Top-right cyan corner */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[90px]" />
        {/* Subtle animated grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
          }}
        />
        {/* Diagonal accent line top-left */}
        <div
          className="absolute top-0 left-0 w-[1px] h-[500px] bg-gradient-to-b from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 origin-top rotate-[25deg] translate-x-48"
        />
      </div>

      {/* ================================================================
          LAYER 2: Top Navigation HUD Bar
          ================================================================ */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Live status badge */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-emerald-500/30 backdrop-blur-md shadow-lg"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono tracking-wider text-emerald-400 font-bold uppercase">
              SwiftTab Auto OS
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-[11px] text-zinc-300">3D Cleanroom Studio</span>
          </motion.div>

          {/* Studio Controls */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center gap-2"
          >
            {/* Studio Lighting Mode Toggle */}
            <button
              onClick={() => {
                if (soundEnabled) playTick();
                setStudioMode(studioMode === 'inspection' ? 'cyber' : 'inspection');
              }}
              className="px-2.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all flex items-center gap-1.5 text-xs font-mono group"
              title="Toggle Cleanroom Lighting"
            >
              {studioMode === 'inspection' ? (
                <><Sun className="w-3.5 h-3.5 text-amber-400" /><span className="text-[10px] hidden sm:inline">Cleanroom Daylight</span></>
              ) : (
                <><Moon className="w-3.5 h-3.5 text-cyan-400" /><span className="text-[10px] hidden sm:inline">Cyber Neon</span></>
              )}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-2.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all flex items-center gap-1.5 text-xs font-mono"
              title="Toggle Audio Haptics"
            >
              {soundEnabled ? (
                <><Volume2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-[10px] hidden sm:inline">Haptics ON</span></>
              ) : (
                <><VolumeX className="w-3.5 h-3.5 text-zinc-500" /><span className="text-[10px] hidden sm:inline">Muted</span></>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* ================================================================
          LAYER 3: Headline, Subline & CTA
          ================================================================ */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-0">
        {/* Category label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-700/60 backdrop-blur-sm text-xs font-mono text-zinc-400 tracking-widest uppercase">
            <Zap className="w-3 h-3 text-emerald-400" />
            Auto Detailing Studio OS — Bay Dispatch • Defect Shield • Revenue Upsell
          </div>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28 }}
          className="text-center text-[clamp(2rem,6vw,4.25rem)] font-black tracking-tight text-white leading-[1.08] max-w-5xl mx-auto"
        >
          Every scratch,{' '}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              proven
            </span>
            {/* Underline glow */}
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400/60 to-cyan-400/60 blur-sm rounded-full" />
          </span>
          {' '}before the buffer touches the paint.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
          className="text-center text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed font-light"
        >
          SwiftTab is the live bay tracker, 60-second digital defect shield, and 1-tap client upsell platform built for ceramic coating and PPF studios.
        </motion.p>

        {/* Feature Chips - scrollable on mobile, wrapped on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.46 }}
          className="mt-5 -mx-4 sm:mx-0"
        >
          <div className="flex sm:flex-wrap sm:justify-center gap-2 overflow-x-auto sm:overflow-visible px-4 sm:px-0 scrollbar-none">
            {[
              { icon: ScanLine, text: '60s Defect Intake' },
              { icon: Zap, text: '1-Tap Upsell' },
              { icon: Radio, text: 'Live Bay Tracker' },
              { icon: ShieldCheck, text: 'Damage Shield' },
              { icon: Layers, text: 'PPF & Ceramic Ready' },
            ].map((chip) => {
              const IconComp = chip.icon;
              return (
                <div
                  key={chip.text}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/70 border border-zinc-800/80 text-zinc-300 text-[12px] font-medium backdrop-blur-sm hover:border-emerald-500/40 hover:text-white transition-all whitespace-nowrap"
                >
                  <IconComp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{chip.text}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.52 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6"
        >
          <a
            href="#demo-sandbox"
            onClick={() => { if (soundEnabled) playCardPop(); }}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-bold text-sm sm:text-base shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:shadow-[0_0_55px_rgba(16,185,129,0.65)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
          >
            <Sparkles className="w-4 h-4 text-emerald-100 group-hover:rotate-12 transition-transform" />
            <span>Try the Live Sandbox</span>
            <ArrowRight className="w-4 h-4 text-emerald-100 group-hover:translate-x-1 transition-transform" />
          </a>

          <Link
            href="/contact"
            onClick={() => { if (soundEnabled) playTick(); }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-200 font-semibold text-sm sm:text-base border border-zinc-800 hover:border-zinc-600 transition-all backdrop-blur-md"
          >
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>Book a 15-min Demo</span>
          </Link>
        </motion.div>

        {/* Social Proof / Trust Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.62 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5"
        >
          <div className="flex items-center gap-1.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-[12px] text-zinc-400 ml-1 font-medium">4.9/5 from 200+ studio owners</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {STUDIO_PARTNERS.map((p) => (
                <div
                  key={p.abbr}
                  title={p.name}
                  className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[8px] font-bold text-zinc-300"
                >
                  {p.abbr[0]}
                </div>
              ))}
            </div>
            <span className="text-[12px] text-zinc-400">Trusted by 340+ detailing studios</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <div className="text-[12px] text-zinc-400 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">No credit card</span>
            <span>• 14-day free trial</span>
          </div>
        </motion.div>
      </div>

      {/* ================================================================
          LAYER 4: 3D Interactive Porsche 911 Cleanroom Stage
          ================================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55 }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 sm:mt-6 pb-8"
      >
        {/* Live KPI Stats Row — above canvas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {LIVE_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-md"
            >
              <stat.icon className={`w-3.5 h-3.5 shrink-0 ${stat.color}`} />
              <div>
                <div className={`text-sm font-black leading-none ${stat.color}`}>
                  {stat.label === 'Upsells Logged' && totalUpsellValue > 0
                    ? `+$${totalUpsellValue.toLocaleString()}`
                    : stat.value
                  }
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5 font-mono leading-none">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 3D Canvas Container */}
        <div className="relative h-[380px] xs:h-[420px] sm:h-[520px] lg:h-[600px] rounded-2xl overflow-hidden border border-zinc-800/90 bg-[#030508] shadow-[0_40px_120px_rgba(0,0,0,0.98),inset_0_0_0_1px_rgba(255,255,255,0.03)]">

          {/* Top HUD Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
            <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 border border-white/10 backdrop-blur-xl text-[11px] font-mono text-zinc-300 shadow-xl">
              <Rotate3d className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>DRAG TO REVOLVE • 24s AUTO-CYCLE</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 border border-cyan-500/30 backdrop-blur-xl text-[11px] font-mono text-cyan-300 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>3D LASER SCANNER ACTIVE</span>
            </div>
          </div>

          {/* 3D Canvas */}
          {isLowPowerOrReducedMotion ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-950">
              <div className="text-center text-zinc-500">
                <div className="text-4xl mb-2">Ã°Å¸Å¡â€”</div>
                <p className="text-sm">3D view disabled (reduced motion)</p>
              </div>
            </div>
          ) : (
            <ThreeDHeroCanvas
              onSelectMarker={handleSelectMarker}
              activeMarkerId={selectedMarker?.id || null}
              paintColor={activePaintColor}
              studioMode={studioMode}
            />
          )}

          {/* Detected Defect Jump Chips — LEFT SIDE COLUMN (desktop only) */}
          <div className="absolute top-14 left-3 z-20 hidden lg:flex flex-col gap-1.5 pointer-events-auto">
            <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-600 font-bold px-1 mb-0.5">
              Detected Defects ({DEFECT_MARKERS.length})
            </div>
            {DEFECT_MARKERS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  if (soundEnabled) playCardPop();
                  setSelectedMarker(m);
                }}
                className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all flex items-center justify-between gap-3 border max-w-[200px] ${
                  selectedMarker?.id === m.id
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80 shadow-lg shadow-emerald-950/50'
                    : addedUpsells[m.id]
                    ? 'bg-zinc-950/70 text-emerald-400 border-emerald-900/60 line-through opacity-70'
                    : 'bg-black/60 text-zinc-300 border-zinc-800/60 hover:border-zinc-600 hover:text-white backdrop-blur-xl'
                }`}
              >
                <span className="truncate">{m.label.split(',')[0]}</span>
                <span className={`text-[10px] font-black shrink-0 ${addedUpsells[m.id] ? 'text-emerald-500' : 'text-emerald-400'}`}>
                  {m.upsellEstimate}
                </span>
              </button>
            ))}
          </div>

          {/* Active Paint Color Name Label — bottom center */}
          <div className="absolute bottom-12 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePaintName}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl text-[11px] font-mono text-zinc-300"
              >
                <span className="text-white font-bold">{activePaintName}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Defect Audit Drawer — FLOATING OVERLAY */}
          <AnimatePresence>
            {selectedMarker && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                className="absolute bottom-0 left-0 right-0 sm:bottom-3 sm:left-auto sm:right-3 sm:w-[310px] p-4 rounded-t-2xl sm:rounded-2xl bg-zinc-950/98 border-t sm:border border-emerald-500/50 shadow-[0_-12px_50px_rgba(0,0,0,0.95)] sm:shadow-[0_24px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl z-30 font-mono"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Digital Defect Audit
                  </span>
                  <button
                    onClick={() => setSelectedMarker(null)}
                    aria-label="Close defect audit"
                    className="text-zinc-500 hover:text-white text-xs w-6 h-6 rounded flex items-center justify-center bg-zinc-900 border border-zinc-800 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Defect Info */}
                <div className="space-y-1.5">
                  <div className="text-[13px] font-bold text-white leading-tight">{selectedMarker.label}</div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>
                      Type:{' '}
                      <span className={`font-semibold ${
                        selectedMarker.severity === 'high' ? 'text-red-400' :
                        selectedMarker.severity === 'medium' ? 'text-amber-400' : 'text-cyan-400'
                      }`}>{selectedMarker.type}</span>
                    </span>
                    <span className="text-zinc-500">
                      Depth:{' '}
                      <span className="text-cyan-400 font-semibold">{selectedMarker.depthMicrons}</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Rec:{' '}
                    <span className="text-zinc-200 font-medium">{selectedMarker.recommendedService}</span>
                  </div>
                </div>

                {/* Severity Bar */}
                <div className="mt-2.5 h-[3px] rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedMarker.severity === 'high'
                        ? 'w-full bg-gradient-to-r from-red-500 to-red-400'
                        : selectedMarker.severity === 'medium'
                        ? 'w-2/3 bg-gradient-to-r from-amber-500 to-amber-400'
                        : 'w-1/3 bg-gradient-to-r from-cyan-500 to-cyan-400'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-zinc-600 mt-0.5">
                  <span>LOW</span><span>MED</span><span>HIGH</span>
                </div>

                {/* Upsell Action Row */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-zinc-600">Upsell Value</div>
                    <div className="text-xl font-black text-emerald-400 leading-none mt-0.5">{selectedMarker.upsellEstimate}</div>
                  </div>
                  {addedUpsells[selectedMarker.id] ? (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>On Bay Ticket</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddUpsell(selectedMarker)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_28px_rgba(16,185,129,0.65)] active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>1-Tap Upsell</span>
                    </button>
                  )}
                </div>

                {/* Legal Footer */}
                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-500/80 bg-emerald-950/30 px-2 py-1.5 rounded-lg border border-emerald-900/40">
                  <span>Ã¢Å“â€œ</span>
                  <span>Pre-existing • Timestamped in digital client waiver</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Left — Telemetry Bar */}
          <div className="absolute bottom-3 left-3 pointer-events-none z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/65 border border-white/8 backdrop-blur-xl text-[10px] font-mono text-zinc-500">
            <span className="text-zinc-200 font-bold">PORSCHE 911 CARRERA 4S</span>
            <span className="text-zinc-700">•</span>
            <span className="text-cyan-500">HEXAGON CLEANROOM</span>
            <span className="text-zinc-700">•</span>
            <span className="text-emerald-500">PBR CLEARCOAT</span>
          </div>

          {/* Bottom Right — Porsche Finish Selector */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 border border-white/8 backdrop-blur-xl shadow-2xl">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase hidden md:inline tracking-wider">
              FINISH:
            </span>
            <div className="flex items-center gap-1.5">
              {PORSCHE_FINISHES.map((finish) => (
                <button
                  key={finish.id}
                  onClick={() => {
                    if (soundEnabled) playTick();
                    setActivePaintColor(finish.hex);
                    setActivePaintName(finish.name);
                  }}
                  title={`${finish.name} (${finish.treatment})`}
                  className={`w-5 h-5 rounded-full transition-all duration-200 border-2 ${
                    activePaintColor === finish.hex
                      ? 'scale-125 border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.8)] ring-1 ring-white/30'
                      : 'border-zinc-700/50 hover:scale-115 opacity-65 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: finish.hex }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Defect Chips Row (shown below canvas on mobile) */}
        <div className="lg:hidden mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {DEFECT_MARKERS.slice(0, 5).map((m) => (
            <button
              key={m.id}
              onClick={() => {
                if (soundEnabled) playCardPop();
                setSelectedMarker(m);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-mono flex items-center gap-2 border transition-all ${
                selectedMarker?.id === m.id
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <span className="truncate max-w-[110px]">{m.label.split(',')[0]}</span>
              <span className="text-emerald-400 font-bold text-[10px] shrink-0">{m.upsellEstimate}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ================================================================
          LAYER 5: Scroll Indicator
          ================================================================ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="relative z-20 flex justify-center pb-4"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
          onClick={() => {
            document.querySelector('#demo-sandbox')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest">Explore Platform</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

