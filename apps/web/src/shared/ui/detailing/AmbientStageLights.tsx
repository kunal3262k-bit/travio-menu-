'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function AmbientStageLights() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Primary Emerald Studio Ambient Orb */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.12, 0.22, 0.12],
          x: ['-10%', '10%', '-10%'],
          y: ['-5%', '5%', '-5%'],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 left-1/3 w-[700px] h-[700px] rounded-full bg-emerald-500/20 blur-[160px]"
      />

      {/* Secondary Cyan Cleanroom Lighting Flare */}
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.08, 0.18, 0.08],
          x: ['10%', '-10%', '10%'],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 -right-32 w-[600px] h-[600px] rounded-full bg-cyan-500/15 blur-[180px]"
      />

      {/* Tertiary Amber Heatlamp Underglow */}
      <motion.div
        animate={{
          opacity: [0.05, 0.12, 0.05],
          scale: [0.9, 1.15, 0.9],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[170px]"
      />

      {/* Drifting Cleanroom Micro-Light Particles */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: `${(i * 8.3) % 100}vw`,
              y: `${(i * 13.7) % 100}vh`,
              opacity: 0.2 + (i % 5) * 0.15,
            }}
            animate={{
              y: ['0vh', '100vh'],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 15 + (i % 7) * 4,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 1.5,
            }}
            className="absolute w-1 h-1 rounded-full bg-emerald-300 shadow-[0_0_8px_#34d399]"
          />
        ))}
      </div>
    </div>
  );
}
