'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Sparkles, 
  Award, 
  ChevronRight, 
  Maximize2, 
  X, 
  Check, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Zap, 
  SlidersHorizontal,
  Smartphone,
  Play,
  Pause
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playTick, playCardPop, playSuccessChime, playReticleLock } from './soundEffects';

interface StackCardItem {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  image: string;
  metrics: { label: string; value: string }[];
  bulletPoints: string[];
  ctaLabel: string;
  accentColor: string;
  modalContent: {
    subtitle: string;
    description: string;
    interactiveType: 'slider' | 'telemetry' | 'upsell' | 'warranty';
  };
}

const STACK_CARDS: StackCardItem[] = [
  {
    id: 'defect-shield',
    badge: 'CARD 01 // INTAKE DEFENSE',
    title: '60-Second Defect Shield & Pre-Inspection',
    tagline: 'Lock down every pre-existing rock chip, swirl, and wheel curb rash before your buffer touches clearcoat.',
    image: '/images/detailing/ferrari_inspection.jpg',
    metrics: [
      { label: 'DISPUTE RATE', value: '0.0%' },
      { label: 'SCAN SPEED', value: '45 SEC' },
      { label: 'CAMERA RESOLUTION', value: '4K MACRO' }
    ],
    bulletPoints: [
      'Digital 16-panel walkaround on any iPhone or iPad with instant timestamping.',
      'Auto-generates PDF damage waiver with customer e-signature prior to work start.',
      'Zero liability lawsuits or fraudulent damage claims.'
    ],
    ctaLabel: 'Pop Up Defect HUD',
    accentColor: '#F59E0B',
    modalContent: {
      subtitle: 'Digital Walkaround & High-CRI Macro Damage Log',
      description: 'Technicians walk around the vehicle snapping high-CRI inspection photos. The AI auto-detects paint swirl severity and tags panel coordinates instantly for owner sign-off.',
      interactiveType: 'slider'
    }
  },
  {
    id: 'bay-telemetry',
    badge: 'CARD 02 // REAL-TIME DISPATCH',
    title: 'Bay Telemetry & Live Kanban Dispatch',
    tagline: 'Orchestrate 4 to 12 detailing bays seamlessly. Live timers, stage transitions, and infrared curing status.',
    image: '/images/detailing/porsche_cleanroom.jpg',
    metrics: [
      { label: 'BAY VELOCITY', value: '+34%' },
      { label: 'TEMP TOLERANCE', value: '±0.5°C' },
      { label: 'IDLE BAY TIME', value: '8 MIN' }
    ],
    bulletPoints: [
      'Visual Kanban tracking: Decon Wash → Multi-Stage Polish → PPF Wrap → Ceramic Infusion → Quality Inspection.',
      'Web Audio chimes notify bay managers when vehicles exceed stage budget.',
      'Customer-facing read-only view prevents phone calls asking "Is my car ready yet?".'
    ],
    ctaLabel: 'Pop Up Bay Dispatch HUD',
    accentColor: '#10B981',
    modalContent: {
      subtitle: 'Real-Time Cleanroom Bay Telemetry',
      description: 'Active bay monitoring system syncing temperature, humidity, and stage completion across studio wall monitors and technician tablets in real-time.',
      interactiveType: 'telemetry'
    }
  },
  {
    id: 'one-tap-upsell',
    badge: 'CARD 03 // REVENUE MULTIPLIER',
    title: '1-Tap High-Ticket Mobile Upsell Engine',
    tagline: 'Spot a high-margin opportunity mid-detail? Send 4K proof straight to the owner’s smartphone with 1-tap SMS approval.',
    image: '/images/detailing/lambo_ppf.jpg',
    metrics: [
      { label: 'AVG TICKET LIFT', value: '+$1,450' },
      { label: 'APPROVAL SPEED', value: '42 MIN' },
      { label: 'CONVERSION', value: '68.4%' }
    ],
    bulletPoints: [
      'Show the owner their exposed hood vs. gloss stealth PPF wrapped fender with 1 click.',
      'Customer taps "Approve (+$850)" without downloading an app or logging in.',
      'Invoice updates instantly in Stripe with automated work order notification.'
    ],
    ctaLabel: 'Pop Up Upsell Simulator',
    accentColor: '#06B6D4',
    modalContent: {
      subtitle: 'Instant Mobile Upsell Flow with Proof Photo',
      description: 'Experience the exact mobile pop-up interface the Ferrari or Porsche owner sees on their phone when your shop detects additional service opportunities.',
      interactiveType: 'upsell'
    }
  },
  {
    id: 'vip-handover',
    badge: 'CARD 04 // RETENTION & CARFAX',
    title: 'White-Glove VIP Handover & Digital Dossier',
    tagline: 'Deliver an unforgettable unboxing experience. Digital warranty cards, CarFax-ready care records, and NFC key fobs.',
    image: '/images/detailing/mclaren_curing.jpg',
    metrics: [
      { label: '5-STAR REVIEWS', value: '99.2%' },
      { label: 'ANNUAL RE-COAT', value: '78%' },
      { label: 'NFC KEY TAGS', value: 'INCLUDED' }
    ],
    bulletPoints: [
      'Complete vehicle provenance report with before/after macro inspection galleries.',
      'Automated 30-day and 6-month wash & ceramic inspection SMS reminders.',
      'Turn one-off PPF clients into recurring annual maintenance contracts.'
    ],
    ctaLabel: 'Pop Up VIP Dossier HUD',
    accentColor: '#8B5CF6',
    modalContent: {
      subtitle: 'Ceramic & PPF Digital Dossier with 10-Year Warranty',
      description: 'The digital certificate delivered to the supercar owner upon vehicle pickup, permanently archiving film lot numbers, installer signatures, and re-coat schedules.',
      interactiveType: 'warranty'
    }
  }
];

export function StickyStackCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [popupCard, setPopupCard] = useState<StackCardItem | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  // Interactive modal state
  const [sliderPos, setSliderPos] = useState(50);
  const [upsellApproved, setUpsellApproved] = useState(false);
  const [bayStage, setBayStage] = useState<'decon' | 'polish' | 'ppf' | 'cure'>('ppf');

  // Auto-cycle through cards unless paused or hovered
  useEffect(() => {
    if (!isAutoPlay || isHovered || popupCard !== null) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % STACK_CARDS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, popupCard]);

  const handleCardSelect = (index: number) => {
    playTick();
    setActiveIndex(index);
  };

  const handleOpenPopup = (card: StackCardItem) => {
    playCardPop();
    setPopupCard(card);
    setUpsellApproved(false);
  };

  const handleClosePopup = () => {
    playTick();
    setPopupCard(null);
  };

  const handleApproveUpsell = () => {
    playSuccessChime();
    setUpsellApproved(true);
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  return (
    <section id="stack-cards-section" className="relative w-full py-24 bg-[#080B10] border-b border-zinc-800/80 overflow-hidden">
      {/* Background radial lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-emerald-500/30 text-xs font-mono text-emerald-400">
            <Layers className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>INTERACTIVE ARCHITECTURE // 4-CARD MOTION STACK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Engineered For The <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Highest-Ticket</span> Detailing Operations.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            A dynamic physical card stack with spring-animated depth. Click <span className="text-white font-semibold">“Pop Up Work Order HUD”</span> on any card to launch the live modal simulator.
          </p>
        </div>

        {/* Stack Navigation Tabs — horizontal scroll on mobile */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="-mx-4 sm:mx-0">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto sm:flex-wrap sm:justify-between px-4 sm:px-0 scrollbar-none pb-1 sm:pb-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 sm:flex-shrink sm:flex-wrap">
                {STACK_CARDS.map((card, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardSelect(idx)}
                      className={`shrink-0 relative px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                        isActive
                          ? 'bg-zinc-800 text-white border border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                          : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
                      <span>0{idx + 1}</span>
                      <span className="hidden sm:inline">{card.title.split('&')[0].trim()}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition"
              >
                {isAutoPlay ? <Pause className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 text-zinc-500" />}
                <span className="hidden sm:inline">{isAutoPlay ? 'AUTO-CYCLE ON' : 'PAUSED'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3D PHYSICAL CARD STACK CONTAINER */}
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative max-w-5xl mx-auto min-h-[670px] sm:min-h-[590px] lg:min-h-[500px] flex items-center justify-center"
        >
          {STACK_CARDS.map((card, idx) => {
            const offset = idx - activeIndex;
            const isCurrent = idx === activeIndex;
            const isVisible = Math.abs(offset) <= 2;

            if (!isVisible) return null;

            // Physics positioning based on stack index
            const scale = 1 - Math.abs(offset) * 0.045;
            const translateY = offset * 22;
            const zIndex = 30 - Math.abs(offset) * 5;
            const opacity = offset === 0 ? 1 : Math.max(0.35, 1 - Math.abs(offset) * 0.35);

            return (
              <motion.div
                key={card.id}
                layout
                initial={false}
                animate={{
                  scale,
                  y: translateY,
                  zIndex,
                  opacity
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 26
                }}
                onClick={() => {
                  if (!isCurrent) handleCardSelect(idx);
                }}
                className={`absolute w-full rounded-2xl overflow-hidden border backdrop-blur-xl transition-all duration-300 ${
                  isCurrent 
                    ? 'cursor-default border-zinc-700 shadow-[0_30px_100px_rgba(0,0,0,0.95)] bg-zinc-900/95 ring-1 ring-emerald-500/30' 
                    : 'cursor-pointer border-zinc-800/70 shadow-xl bg-zinc-950/80 hover:border-zinc-700'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
                  {/* Left Column: Image */}
                  <div className="lg:col-span-5 relative min-h-[170px] sm:min-h-[240px] lg:min-h-[470px] overflow-hidden group">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-zinc-950/90 via-transparent to-transparent" />
                    
                    {/* Badge chip over image */}
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md bg-zinc-950/85 border border-zinc-700/80 text-[10px] font-mono font-bold tracking-wider text-emerald-400 backdrop-blur-md">
                      {card.badge}
                    </div>

                    {/* Quick Pop Up Trigger over image */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 hidden sm:block">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPopup(card);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-zinc-950/90 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xl backdrop-blur-md group/btn"
                      >
                        <Maximize2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                        <span>{card.ctaLabel}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Card Details & Live Metrics */}
                  <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">
                          STEP 0{idx + 1} OF 04 // OPERATIONAL SUITE
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          SWIFTTAB AUTO
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-zinc-400 text-sm sm:text-base mt-2 leading-relaxed">
                        {card.tagline}
                      </p>

                      {/* Bullet Highlights with emerald ticks */}
                      <ul className="mt-5 space-y-2.5">
                        {card.bulletPoints.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Metrics Bar */}
                    <div className="border-t border-zinc-800/80 pt-5">
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
                        {card.metrics.map((m, mIdx) => (
                          <div key={mIdx} className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-center">
                            <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">
                              {m.value}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">
                              {m.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Explicit Interactive Pop Up Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPopup(card);
                        }}
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.7)] transition-all duration-300 active:scale-[0.99] group/trigger"
                      >
                        <Maximize2 className="w-4 h-4 text-emerald-100 group-hover/trigger:scale-110 transition-transform" />
                        <span>{card.ctaLabel} (Click to Test)</span>
                        <ChevronRight className="w-4 h-4 text-emerald-100 group-hover/trigger:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Carousel indicators */}
        <div className="flex items-center justify-center gap-3 mt-12">
          {STACK_CARDS.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => handleCardSelect(dotIdx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                dotIdx === activeIndex ? 'w-10 bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* TACTILE SPRING POP-UP MODAL HUD ("stacks card pop up") */}
      <AnimatePresence>
        {popupCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              className="relative w-full max-w-3xl bg-zinc-950 border border-emerald-500/60 rounded-2xl shadow-[0_0_80px_rgba(16,185,129,0.3)] overflow-hidden"
            >
              {/* Modal Top Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      {popupCard.badge}
                    </div>
                    <div className="text-base font-extrabold text-white">
                      {popupCard.title}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClosePopup}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Interactive Live Simulator */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {popupCard.modalContent.subtitle}
                  </h4>
                  <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                    {popupCard.modalContent.description}
                  </p>
                </div>

                {/* SIMULATOR 1: DEFECT BEFORE/AFTER SLIDER */}
                {popupCard.modalContent.interactiveType === 'slider' && (
                  <div className="space-y-4">
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-zinc-800 select-none">
                      <img
                        src="/images/detailing/ferrari_inspection.jpg"
                        alt="Paint Inspection"
                        className="w-full h-full object-cover"
                      />
                      {/* Interactive Divider Line */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_15px_#f59e0b] z-20 pointer-events-none"
                        style={{ left: `${sliderPos}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-lg text-[10px] font-bold text-black">
                          ↔
                        </div>
                      </div>

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-rose-950/80 border border-rose-500 text-rose-300 font-mono text-[11px] font-bold">
                        ORIGINAL: 1,500 GRIT SWIRLS
                      </div>

                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-[11px] font-bold">
                        STAGE 2 GLOSS: 99.8% MIRROR
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-zinc-400">DRAG SLIDER:</span>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={sliderPos}
                        onChange={(e) => {
                          setSliderPos(Number(e.target.value));
                          playTick();
                        }}
                        className="w-full accent-emerald-500 cursor-ew-resize"
                      />
                      <span className="text-xs font-mono text-emerald-400 font-bold">{sliderPos}%</span>
                    </div>
                  </div>
                )}

                {/* SIMULATOR 2: BAY TELEMETRY KANBAN SWITCHER */}
                {popupCard.modalContent.interactiveType === 'telemetry' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'decon', label: '1. Decon Wash', temp: '21°C', humidity: '55%' },
                        { id: 'polish', label: '2. Paint Prep', temp: '22°C', humidity: '48%' },
                        { id: 'ppf', label: '3. PPF Cleanroom', temp: '20°C', humidity: '45%' },
                        { id: 'cure', label: '4. IR Curing Bay', temp: '68°C', humidity: '30%' }
                      ].map((stage) => (
                        <button
                          key={stage.id}
                          onClick={() => {
                            setBayStage(stage.id as any);
                            playTick();
                          }}
                          className={`p-3 rounded-xl border text-left font-mono transition-all ${
                            bayStage === stage.id
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold">{stage.label}</div>
                          <div className="text-[10px] text-zinc-500 mt-1">TEMP: {stage.temp}</div>
                          <div className="text-[10px] text-zinc-500">HUMIDITY: {stage.humidity}</div>
                        </button>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>ACTIVE TECHNICIAN:</span>
                        <span className="text-white font-bold">Marcus Vance (Lead XPEL Certified)</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>STAGE ALLOTTED BUDGET:</span>
                        <span className="text-emerald-400 font-bold">03h 30m (42m remaining)</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>TELEMETRY SENSOR HEALTH:</span>
                        <span className="text-emerald-400 font-bold">● OPTIMAL TOLERANCE</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SIMULATOR 3: 1-TAP UPSELL INTERACTIVE APPROVAL */}
                {popupCard.modalContent.interactiveType === 'upsell' && (
                  <div className="space-y-4">
                    <div className="p-4 sm:p-5 rounded-xl bg-zinc-900 border border-cyan-500/40 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-mono text-cyan-400 font-bold">CLIENT SMARTPHONE NOTIFICATION</div>
                          <div className="text-sm font-semibold text-white">Ferrari 812 Superfast: Track Pack PPF Recommendation</div>
                        </div>
                      </div>

                      <div className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                        “Hi David, during the front bumper wrap we inspected rock peppering on your rocker panels. We can add Full Rocker PPF + Ceramic Wheel Face for <strong className="text-emerald-400">+$850</strong> while on the lift today.”
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {upsellApproved ? (
                          <div className="w-full p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>APPROVED BY OWNER VIA SMS (+ $850.00 ADDED TO TAB)</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleApproveUpsell}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/50 transition-all active:scale-[0.98]"
                          >
                            <Zap className="w-4 h-4" />
                            <span>SIMULATE OWNER 1-TAP APPROVAL (+$850)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SIMULATOR 4: VIP DIGITAL WARRANTY DOSSIER */}
                {popupCard.modalContent.interactiveType === 'warranty' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/40 border border-purple-500/40 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs text-purple-400 font-bold">
                          <Award className="w-4 h-4" />
                          <span>SWIFTTAB AUTO VIP DOSSIER</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                          VERIFIED #ST-8921-GT3
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                        <div className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                          <div className="text-zinc-500 text-[10px]">COATING LAYER:</div>
                          <div className="text-white font-bold mt-0.5">Gyeon Quartz Infinite 9H</div>
                        </div>
                        <div className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                          <div className="text-zinc-500 text-[10px]">FILM APPLIED:</div>
                          <div className="text-white font-bold mt-0.5">XPEL Stealth 8.5 Mil Full Body</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800">
                        <span>WARRANTY EXPIRATION:</span>
                        <span className="text-emerald-400 font-bold">OCTOBER 2036 (10 YEARS)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500">
                  SYSTEM READY // PRESS ESC OR CLICK CLOSE TO DISMISS
                </span>
                <button
                  onClick={handleClosePopup}
                  className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                >
                  Done Exploring
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
