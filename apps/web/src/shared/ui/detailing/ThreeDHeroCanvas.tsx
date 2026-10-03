'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { SportsCoupe3D, DefectMarker } from './SportsCoupe3D';

function SweepingRimLight() {
  const lightRef = useRef<THREE.SpotLight>(null);
  const angle = useRef(0);

  // Sweep light around car body every 6-8 seconds
  useFrame((_, delta) => {
    angle.current += delta * 0.85;
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(angle.current) * 4.6;
      lightRef.current.position.z = Math.cos(angle.current) * 4.6;
    }
  });

  return (
    <spotLight
      ref={lightRef}
      position={[4.5, 3.2, 4.5]}
      angle={0.55}
      penumbra={0.8}
      intensity={3.2}
      color="#38bdf8"
    />
  );
}

// Pre-computed honeycomb hexagon positions for overhead cleanroom LED canopy
const HEX_GRID_POSITIONS: [number, number, number][] = [
  // Center Column (X = 0)
  [0, 2.12, -2.1],
  [0, 2.12, -1.05],
  [0, 2.12, 0],
  [0, 2.12, 1.05],
  [0, 2.12, 2.1],

  // Column X = -0.92
  [-0.92, 2.12, -2.625],
  [-0.92, 2.12, -1.575],
  [-0.92, 2.12, -0.525],
  [-0.92, 2.12, 0.525],
  [-0.92, 2.12, 1.575],
  [-0.92, 2.12, 2.625],

  // Column X = 0.92
  [0.92, 2.12, -2.625],
  [0.92, 2.12, -1.575],
  [0.92, 2.12, -0.525],
  [0.92, 2.12, 0.525],
  [0.92, 2.12, 1.575],
  [0.92, 2.12, 2.625],

  // Column X = -1.84
  [-1.84, 2.12, -2.1],
  [-1.84, 2.12, -1.05],
  [-1.84, 2.12, 0],
  [-1.84, 2.12, 1.05],
  [-1.84, 2.12, 2.1],

  // Column X = 1.84
  [1.84, 2.12, -2.1],
  [1.84, 2.12, -1.05],
  [1.84, 2.12, 0],
  [1.84, 2.12, 1.05],
  [1.84, 2.12, 2.1],
];

// Cleanroom rear wall honeycomb matrix positions
const WALL_HEX_POSITIONS: [number, number, number][] = [
  [0, 1.25, -4.4],
  [-0.95, 1.25, -4.4],
  [0.95, 1.25, -4.4],
  [-0.475, 1.95, -4.4],
  [0.475, 1.95, -4.4],
  [-0.475, 0.55, -4.4],
  [0.475, 0.55, -4.4],
  [-1.425, 1.95, -4.4],
  [1.425, 1.95, -4.4],
  [-1.425, 0.55, -4.4],
  [1.425, 0.55, -4.4],
];

function HexagonCleanroomStudio({ studioMode = 'inspection' }: { studioMode?: 'inspection' | 'cyber' }) {
  const isCyber = studioMode === 'cyber';

  return (
    <group>
      {/* ========================================================
          OVERHEAD 3D TUBULAR HEXAGONAL LED HONEYCOMB CANOPY
         ======================================================== */}
      <group>
        {HEX_GRID_POSITIONS.map((pos, idx) => (
          <group key={`ceiling-fixture-${idx}`} position={pos} rotation={[Math.PI / 2, 0, Math.PI / 6]}>
            {/* Dark aluminum mounting chassis tube */}
            <mesh>
              <torusGeometry args={[0.54, 0.032, 6, 6]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.9} />
            </mesh>
            {/* Luminous high-output pure white 6500K LED core tube */}
            <mesh position={[0, 0, -0.005]}>
              <torusGeometry args={[0.54, 0.02, 6, 6]} />
              <meshStandardMaterial
                color={isCyber ? '#38bdf8' : '#ffffff'}
                emissive={isCyber ? '#0284c7' : '#ffffff'}
                emissiveIntensity={isCyber ? 2.5 : 3.2}
                roughness={0.1}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}

        {/* Outer Rectangular LED Ceiling Border Frame */}
        <mesh position={[0, 2.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.85, 3.92, 4]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0ea5e9"
            emissiveIntensity={2.0}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ========================================================
          VERTICAL WALL INSPECTION LIGHT BARS (Flanking Left & Right)
         ======================================================== */}
      {/* Left Wall Light Tubes */}
      {[-1.8, -0.6, 0.6, 1.8].map((zPos, idx) => (
        <group key={`left-light-bar-${idx}`} position={[-3.3, 1.15, zPos]}>
          {/* Aluminum Backing */}
          <mesh>
            <boxGeometry args={[0.06, 1.8, 0.08]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} />
          </mesh>
          {/* Luminous Diffuser Strip */}
          <mesh position={[0.035, 0, 0]}>
            <boxGeometry args={[0.02, 1.74, 0.05]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#f8fafc"
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* Right Wall Light Tubes */}
      {[-1.8, -0.6, 0.6, 1.8].map((zPos, idx) => (
        <group key={`right-light-bar-${idx}`} position={[3.3, 1.15, zPos]}>
          <mesh>
            <boxGeometry args={[0.06, 1.8, 0.08]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} />
          </mesh>
          <mesh position={[-0.035, 0, 0]}>
            <boxGeometry args={[0.02, 1.74, 0.05]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#f8fafc"
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          CLEANROOM BACK WALL ARCHITECTURAL HEX MATRIX
         ======================================================== */}
      <group>
        {WALL_HEX_POSITIONS.map((pos, idx) => (
          <group key={`wall-fixture-${idx}`} position={pos} rotation={[0, 0, Math.PI / 6]}>
            {/* Chassis Frame */}
            <mesh>
              <torusGeometry args={[0.54, 0.028, 6, 6]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.8} />
            </mesh>
            {/* Emissive Studio Cyan Neon Tube */}
            <mesh position={[0, 0, 0.005]}>
              <torusGeometry args={[0.54, 0.018, 6, 6]} />
              <meshStandardMaterial
                color="#0ea5e9"
                emissive="#0284c7"
                emissiveIntensity={2.6}
                roughness={0.1}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Downward Pure Cleanroom Light from Hexagon Ceiling */}
      <pointLight position={[0, 2.05, 0]} intensity={3.8} color="#ffffff" distance={7} />
      <pointLight position={[-1.2, 2.05, 1.2]} intensity={2.6} color="#f0f9ff" distance={6} />
      <pointLight position={[1.2, 2.05, -1.2]} intensity={2.6} color="#f0f9ff" distance={6} />

      {/* ========================================================
          HIGH-GLOSS DETAILING BAY SHOWROOM FLOOR
         ======================================================== */}
      <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial
          color="#060810"
          roughness={0.14}
          metalness={0.92}
        />
      </mesh>

      {/* Realistic Soft Contact Shadows Under Tires & Chassis */}
      <ContactShadows
        position={[0, -0.279, -0.28]}
        opacity={0.85}
        scale={7.6}
        blur={1.6}
        far={2.8}
      />

      {/* ========================================================
          SEAMLESS CURVED STUDIO CYCLORAMA ENCLOSURE
         ======================================================== */}
      <mesh position={[0, 2.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[8.4, 8.4, 6.4, 48, 1, true, -Math.PI / 1.7, Math.PI * 1.18]} />
        <meshStandardMaterial
          color="#020408"
          roughness={0.8}
          metalness={0.2}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function SceneContent({
  onSelectMarker,
  activeMarkerId,
  isUserInteracting,
  paintColor,
  studioMode = 'inspection',
}: {
  onSelectMarker: (marker: DefectMarker) => void;
  activeMarkerId: string | null;
  isUserInteracting: boolean;
  paintColor?: string;
  studioMode?: 'inspection' | 'cyber';
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Slow auto-rotate (24s per turn = ~0.26 rad/sec). Pauses on user drag.
  useFrame((_, delta) => {
    if (!isUserInteracting && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.24;
    }
  });

  return (
    <>
      {/* Detailing Cleanroom Hexagon Lights & High-Gloss Floor */}
      <HexagonCleanroomStudio studioMode={studioMode} />

      {/* Local Studio HDRI Lightformer Reflections (Zero Network Lag, Ultra High PBR Quality) */}
      <Environment resolution={256}>
        {/* Overhead large softbox casting unbroken reflections along hood and roof */}
        <Lightformer
          form="rect"
          intensity={2.5}
          position={[0, 4, 0]}
          scale={[10, 5, 1]}
          target={[0, 0, 0]}
          color="#ffffff"
        />
        {/* Left flank horizon strip light */}
        <Lightformer
          form="rect"
          intensity={3.2}
          position={[-5, 1.8, 0]}
          scale={[1.2, 10, 1]}
          rotation={[0, Math.PI / 2, 0]}
          color="#e0f2fe"
        />
        {/* Right flank horizon strip light */}
        <Lightformer
          form="rect"
          intensity={3.2}
          position={[5, 1.8, 0]}
          scale={[1.2, 10, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          color="#e0f2fe"
        />
        {/* Studio cyan rim accent */}
        <Lightformer
          form="circle"
          intensity={3.8}
          position={[0, 2.5, -5]}
          scale={[4, 4, 1]}
          color="#38bdf8"
        />
      </Environment>

      {/* Studio Ambience & Multi-Angle Stage Lights */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 7, 5]} intensity={3.0} color="#ffffff" castShadow />
      <directionalLight position={[-5, 5, 3]} intensity={2.0} color="#e0f2fe" />
      <directionalLight position={[0, 8, -4]} intensity={2.2} color="#f8fafc" />
      <directionalLight position={[-4, 3, -5]} intensity={1.8} color="#38bdf8" />

      {/* 6-8s Moving Rim Light Sweep */}
      <SweepingRimLight />

      {/* Auto-Rotating Vehicle Group */}
      <group ref={groupRef}>
        <React.Suspense fallback={null}>
          <SportsCoupe3D
            onSelectMarker={onSelectMarker}
            activeMarkerId={activeMarkerId}
            paintColor={paintColor}
          />
        </React.Suspense>
      </group>
    </>
  );
}

function ResponsiveCamera() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <PerspectiveCamera
      makeDefault
      position={isMobile ? [4.7, 1.8, 4.7] : [3.9, 1.6, 3.9]}
      fov={isMobile ? 42 : 38}
    />
  );
}

export function ThreeDHeroCanvas({
  onSelectMarker,
  activeMarkerId,
  paintColor = '#cbd5e1',
  studioMode = 'inspection',
}: {
  onSelectMarker: (marker: DefectMarker) => void;
  activeMarkerId: string | null;
  paintColor?: string;
  studioMode?: 'inspection' | 'cyber';
}) {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    setIsUserInteracting(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handlePointerUp = () => {
    // Resume auto-rotation after 2 seconds
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  return (
    <div
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        <ResponsiveCamera />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          target={[0, 0.35, 0]}
          minPolarAngle={Math.PI / 4.8}
          maxPolarAngle={Math.PI / 2.06}
          rotateSpeed={0.7}
        />
        <SceneContent
          onSelectMarker={onSelectMarker}
          activeMarkerId={activeMarkerId}
          isUserInteracting={isUserInteracting}
          paintColor={paintColor}
          studioMode={studioMode}
        />
      </Canvas>
    </div>
  );
}

