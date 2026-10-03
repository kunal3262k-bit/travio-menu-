'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Shield, Sparkles, ChevronRight, X, Clock, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { playTick, playCardPop, playSuccessChime } from './soundEffects';

interface FleetCar {
  id: string;
  name: string;
  chassis: string;
  image: string;
  packageTitle: string;
  stage: string;
  estimatedTicket: string;
  specs: { label: string; val: string }[];
  breakdown: string[];
}

const FLEET_CARS: FleetCar[] = [
  {
    id: 'porsche-gt3rs',
    name: 'Porsche 911 GT3 RS',
    chassis: '992 Weissach Package',
    image: '/images/detailing/porsche_cleanroom.jpg',
    packageTitle: 'Track Armor Platinum // Full Body PPF + Ceramic',
    stage: 'Stage 4 : Ceramic Curing',
    estimatedTicket: '$6,850',
    specs: [
      { label: 'FILM', val: 'XPEL Ultimate Plus 8.5 mil' },
      { label: 'COATING', val: 'Gyeon Quartz Infinite 9H' },
      { label: 'WARRANTY', val: '10-Year Transferable' },
      { label: 'TURNAROUND', val: '3 Business Days' }
    ],
    breakdown: [
      'Disassembly of rear carbon wing & fender vents for seamless edge tucking.',
      'Single-stage defect refinement polishing prior to film installation.',
      'High-impact PPF coverage: full hood, bumper, fenders, rockers, rear quarter panels.',
      'Infrared bake cure @ 65°C for 45 minutes to lock chemical bonding.'
    ]
  },
  {
    id: 'lambo-revuelto',
    name: 'Lamborghini Revuelto V12',
    chassis: 'Nero Nemesis Matte Spec',
    image: '/images/detailing/lambo_ppf.jpg',
    packageTitle: 'Stealth Satin Conversion // Matte PPF Wrap',
    stage: 'Stage 3 : Edge Tuck & Heat Seal',
    estimatedTicket: '$8,200',
    specs: [
      { label: 'FILM', val: 'XPEL Stealth Satin 8.5 mil' },
      { label: 'EXPOSED CARBON', val: 'Gloss High-Optic PPF' },
      { label: 'WHEELS', val: 'Ceramic Face & Calipers' },
      { label: 'TURNAROUND', val: '4 Business Days' }
    ],
    breakdown: [
      'Complete color-safe decontamination wash and clay bar purification.',
      'Transforming gloss paint into deep satin sheen while protecting against stone chips.',
      'Pre-cut plotter precision on sculpted carbon aerodynamic diffusers.',
      'Thermal perimeter locking with IR inspection gun to prevent edge peeling.'
    ]
  },
  {
    id: 'mclaren-750s',
    name: 'McLaren 750S Spider',
    chassis: 'Papaya Spark Metallic',
    image: '/images/detailing/mclaren_curing.jpg',
    packageTitle: 'Concourse Paint Correction + Glass Coating',
    stage: 'Stage 2 : Rotary Micro-Refinement',
    estimatedTicket: '$4,400',
    specs: [
      { label: 'CORRECTION', val: '2-Stage Multi-Compound' },
      { label: 'DEFECT REMOVAL', val: '99.2% Clarity' },
      { label: 'CLEARCOAT REMOVED', val: 'Only 3.2 μm' },
      { label: 'TURNAROUND', val: '2 Business Days' }
    ],
    breakdown: [
      '16-Panel digital paint thickness gauge mapping to identify thin factory spots.',
      'Coarse wool pad compound pass eliminating heavy rotary buffer swirls.',
      'Fine micro-polishing finishing foam pad delivering liquid optical gloss.',
      'Dual-layer ceramic application providing 112° hydrophobic contact angle.'
    ]
  },
  {
    id: 'ferrari-488',
    name: 'Ferrari 812 GTS V12',
    chassis: 'Rosso Corsa Vintage',
    image: '/images/detailing/ferrari_inspection.jpg',
    packageTitle: 'Preservation Detail + Full Rocker Protection',
    stage: 'Stage 1 : Intake 4K Damage Scan',
    estimatedTicket: '$5,150',
    specs: [
      { label: 'INSPECTION', val: '4K High-CRI Digital Log' },
      { label: 'ROCKER PPF', val: 'Extended High-Impact' },
      { label: 'INTERIOR', val: 'Full Aniline Leather Hydro Shield' },
      { label: 'TURNAROUND', val: '3 Business Days' }
    ],
    breakdown: [
      'Digital defect reticle sign-off sent straight to client WhatsApp/SMS.',
      'Zero-touch wheel removal and ceramic coating on carbon ceramic calipers.',
      'Full protection on high-velocity road debris zones and side sills.',
      'CarFax verified entry generated and tied to vehicle VIN.'
    ]
  }
];

export function ExoticFleetDeck() {
  const [selectedCar, setSelectedCar] = useState<FleetCar | null>(null);

  const handleOpenCar = (car: FleetCar) => {
    playCardPop();
    setSelectedCar(car);
  };

  const handleCloseCar = () => {
    playTick();
    setSelectedCar(null);
  };

  return (
    <section className="relative w-full py-24 bg-[#07090E] border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400">
              <Car className="w-3.5 h-3.5" />
              <span>SUPERCAR FLEET ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Configured For Exotic Metal.
            </h2>
            <p className="text-zinc-400 text-base max-w-xl">
              Tap any vehicle card to pop up the real-time studio work order, package breakdown, and margin calculator.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500">INTERACTIVE 3D PERSPECTIVE</span>
          </div>
        </div>

        {/* 3D TILT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FLEET_CARS.map((car) => (
            <motion.div
              key={car.id}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              onClick={() => handleOpenCar(car)}
              className="group relative rounded-2xl overflow-hidden bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/70 transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between"
            >
              {/* Card Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                {/* Live Stage Tag */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-zinc-950/80 border border-zinc-700 text-[10px] font-mono text-emerald-400 font-bold backdrop-blur-md">
                  {car.stage}
                </div>

                {/* Price Tag */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-500/80 text-[11px] font-mono text-emerald-300 font-bold backdrop-blur-md shadow-lg">
                  {car.estimatedTicket}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    {car.chassis}
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mt-0.5">
                    {car.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                    {car.packageTitle}
                  </p>
                </div>

                {/* Bottom Trigger */}
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    EXPAND WORK ORDER
                  </span>
                  <div className="w-7 h-7 rounded-full bg-zinc-800 group-hover:bg-emerald-500 text-zinc-400 group-hover:text-white flex items-center justify-center transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* POP-UP VEHICLE WORK ORDER MODAL */}
      <AnimatePresence>
        {selectedCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-zinc-950 border border-emerald-500/60 rounded-2xl shadow-[0_0_80px_rgba(16,185,129,0.3)] overflow-hidden"
            >
              {/* Modal Header Image */}
              <div className="relative aspect-[4/3] sm:aspect-[21/9] max-h-[200px] sm:max-h-[260px] overflow-hidden">
                <img
                  src={selectedCar.image}
                  alt={selectedCar.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                
                <button
                  onClick={handleCloseCar}
                  className="absolute top-4 right-4 p-2 rounded-full bg-zinc-950/80 text-zinc-300 hover:text-white border border-zinc-700 backdrop-blur-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-5 left-6 right-6">
                  <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    {selectedCar.chassis} // VIN ARCHIVED
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {selectedCar.name}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 max-h-[55vh] overflow-y-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div>
                    <div className="text-xs font-mono text-zinc-400 uppercase">SELECTED PACKAGE:</div>
                    <div className="text-base font-bold text-white mt-0.5">{selectedCar.packageTitle}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-zinc-400 uppercase">ESTIMATED TICKET:</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">{selectedCar.estimatedTicket}</div>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedCar.specs.map((sp, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 font-mono">
                      <div className="text-[10px] text-zinc-500 uppercase">{sp.label}</div>
                      <div className="text-xs font-bold text-zinc-200 mt-0.5">{sp.val}</div>
                    </div>
                  ))}
                </div>

                {/* Service Breakdown */}
                <div>
                  <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-3">
                    Bespoke Installation Protocol:
                  </h4>
                  <div className="space-y-2.5">
                    {selectedCar.breakdown.map((item, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 sm:p-6 bg-zinc-900/90 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-mono text-zinc-400">
                  ACTIVE STUDIO QUEUE: <span className="text-emerald-400 font-bold">READY FOR INTAKE</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCloseCar}
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      playSuccessChime();
                      window.location.href = '/demo';
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs transition-all shadow-lg hover:shadow-emerald-500/40"
                  >
                    Load In Live Bay Sandbox →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
