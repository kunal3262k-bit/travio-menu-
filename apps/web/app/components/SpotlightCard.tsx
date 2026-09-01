"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  tiltEnabled?: boolean;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(0, 184, 124, 0.15)",
  tiltEnabled = true
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse Coordinates for Spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth tilt
  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Normalized [-0.5, 0.5] for tilt
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(normX);
    mouseY.set(normY);

    // Pixel values for spotlight gradient
    const pxX = e.clientX - rect.left;
    const pxY = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${pxX}px`);
    cardRef.current.style.setProperty("--mouse-y", `${pxY}px`);
  }, [mouseX, mouseY]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        rotateX: tiltEnabled && isHovered ? rotateX : 0,
        rotateY: tiltEnabled && isHovered ? rotateY : 0,
      }}
      className={`group relative rounded-3xl bg-[#0B1512] border border-emerald-500/20 p-8 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_12px_40px_rgba(0,184,124,0.12)] overflow-hidden ${className}`}
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(550px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), ${spotlightColor}, transparent 70%)`
        }}
      />

      {/* Subtle Top-Edge Specular Glass Light */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export default SpotlightCard;
