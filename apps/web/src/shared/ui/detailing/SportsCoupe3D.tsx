'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { playReticleLock } from './soundEffects';

export interface DefectMarker {
  id: string;
  label: string;
  type: string;
  position: [number, number, number];
  severity: 'high' | 'medium' | 'low';
  depthMicrons: string;
  recommendedService: string;
  upsellEstimate: string;
}

export const DEFECT_MARKERS: DefectMarker[] = [
  {
    id: 'd1',
    label: 'Swirl cluster, center hood',
    type: 'Paint Swirl',
    position: [0, 0.18, 0.85],
    severity: 'medium',
    depthMicrons: '2.1 µm',
    recommendedService: 'Stage 1 Machine Polish',
    upsellEstimate: '+$350',
  },
  {
    id: 'd2',
    label: 'Rock chip, front bumper',
    type: 'Stone Impact',
    position: [0.42, 0.02, 1.75],
    severity: 'high',
    depthMicrons: '38.4 µm (Primer Exposed)',
    recommendedService: 'OEM Paint Touch-up + Leveling',
    upsellEstimate: '+$275',
  },
  {
    id: 'd3',
    label: 'Scuffed clearcoat, left fender',
    type: 'Clearcoat Scuff',
    position: [-0.88, 0.12, 0.65],
    severity: 'medium',
    depthMicrons: '4.8 µm',
    recommendedService: 'Spot Wet Sand + Compound',
    upsellEstimate: '+$190',
  },
  {
    id: 'd4',
    label: 'Micro-marring, roof canopy',
    type: 'Hologram Swirl',
    position: [0.15, 0.58, -0.15],
    severity: 'low',
    depthMicrons: '1.2 µm',
    recommendedService: 'Finishing Foam Jeweling',
    upsellEstimate: '+$220',
  },
  {
    id: 'd5',
    label: 'Curb rash, right front rim',
    type: 'Wheel Curb Rash',
    position: [0.98, -0.35, 1.15],
    severity: 'high',
    depthMicrons: 'Deep Alloy Abrasion',
    recommendedService: 'CNC Diamond Cut Refinishing',
    upsellEstimate: '+$250',
  },
  {
    id: 'd6',
    label: 'Stone peppering, rocker panel',
    type: 'Road Sandblasting',
    position: [-0.92, -0.28, -0.35],
    severity: 'medium',
    depthMicrons: '5.2 µm',
    recommendedService: 'Self-Healing Rocker PPF Film',
    upsellEstimate: '+$490',
  },
  {
    id: 'd7',
    label: 'Water spot etching, rear deck',
    type: 'Mineral Etching',
    position: [0, 0.32, -1.25],
    severity: 'low',
    depthMicrons: '3.0 µm',
    recommendedService: 'Acidic Decon + Graphene Sealant',
    upsellEstimate: '+$180',
  },
];

// Visible Laser Sweep Beam Component
function LaserScanSweep({
  scanZ,
}: {
  scanZ: number;
}) {
  return (
    <group position={[0, 0, scanZ]}>
      {/* Vertical luminous laser sheet plane */}
      <mesh position={[0, 0.15, 0]}>
        <planeGeometry args={[2.8, 1.3]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Razor-thin bright cyan laser cutting beam */}
      <mesh position={[0, 0.15, 0]}>
        <planeGeometry args={[2.7, 0.015]} />
        <meshBasicMaterial
          color="#a5f3fc"
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Glowing laser reflection line on floor */}
      <mesh position={[0, -0.73, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.9, 0.04]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Dynamic travelling inspection beam light */}
      <pointLight
        position={[0, 0.45, 0]}
        intensity={2.8}
        color="#38bdf8"
        distance={2.4}
        decay={2}
      />
    </group>
  );
}

export function SportsCoupe3D({
  onSelectMarker,
  activeMarkerId,
  paintColor = '#cbd5e1', // Default: Porsche GT Silver Metallic
}: {
  onSelectMarker?: (marker: DefectMarker) => void;
  activeMarkerId?: string | null;
  paintColor?: string;
}) {
  const [scanZ, setScanZ] = useState(2.3);
  const [activeMarkers, setActiveMarkers] = useState<Record<string, boolean>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const scanZRef = useRef(2.3);

  // Load the authentic Porsche 911 Carrera 4S GLB model
  const { scene } = useGLTF('/models/porsche-911.glb', '/draco/');

  // Clone scene & configure showroom PBR clearcoat materials
  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Hide default flat disc ground plane from Sketchfab upload
        if (child.name === 'Plane' || child.name === 'Plane_0' || child.name === 'Plane.000') {
          child.visible = false;
        }

        // Apply ultra-luxury clearcoat & custom factory Porsche paint finish to body panels
        if (child.material) {
          const matName = child.material.name ? child.material.name.toLowerCase() : '';
          if (matName === 'paint' || matName === 'coat' || matName === 'carpaint') {
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(paintColor),
              metalness: 0.85,
              roughness: 0.12,
              clearcoat: 1.0,
              clearcoatRoughness: 0.03,
              reflectivity: 0.96,
              ior: 1.52,
              specularIntensity: 1.0,
              envMapIntensity: 1.25,
            });
          }
        }
      }
    });
    return cloned;
  }, [scene, paintColor]);

  // Continuous animation loop for laser scan & defect illumination
  useFrame((_, delta) => {
    scanZRef.current -= delta * 0.85;
    if (scanZRef.current < -2.3) {
      scanZRef.current = 2.3;
    }
    setScanZ(scanZRef.current);

    const currentZ = scanZRef.current;
    const updated: Record<string, boolean> = {};
    DEFECT_MARKERS.forEach((m) => {
      if (currentZ <= m.position[2] + 0.18) {
        updated[m.id] = true;
      }
    });
    setActiveMarkers(updated);
  });

  return (
    <group position={[0, 0.456, -0.28]}>
      {/* ========================================================
          AUTHENTIC PORSCHE 911 3D GLB MODEL
         ======================================================== */}
      <primitive
        object={clonedScene}
        scale={[1.15, 1.15, 1.15]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />

      {/* ========================================================
          VISIBLE 3D OPTICAL LASER SCAN SWEEP
         ======================================================== */}
      <LaserScanSweep scanZ={scanZ} />

      {/* ========================================================
          TACTILE DEFECT MARKERS (Precision Optical Reticles)
         ======================================================== */}
      {DEFECT_MARKERS.map((marker) => {
        const isTriggered = activeMarkers[marker.id];
        const isSelected = activeMarkerId === marker.id;
        const isHovered = hoveredId === marker.id;
        const showLabel = isSelected || isHovered;

        const severityColor =
          marker.severity === 'high'
            ? '#ef4444' // Coral Red
            : marker.severity === 'medium'
            ? '#f59e0b' // Amber Gold
            : '#06b6d4'; // Studio Cyan

        return (
          <group key={marker.id} position={marker.position}>
            {/* Outer Precision Reticle Ring */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(marker.id);
              }}
              onPointerOut={() => setHoveredId(null)}
              onPointerDown={(e) => {
                e.stopPropagation();
                playReticleLock();
                if (onSelectMarker) onSelectMarker(marker);
              }}
              onClick={(e) => {
                e.stopPropagation();
                playReticleLock();
                if (onSelectMarker) onSelectMarker(marker);
              }}
              scale={isSelected ? [1.5, 1.5, 1.5] : isHovered ? [1.3, 1.3, 1.3] : [1, 1, 1]}
            >
              <ringGeometry args={[0.04, 0.065, 32]} />
              <meshBasicMaterial
                color={isSelected ? '#10b981' : isHovered ? '#38bdf8' : isTriggered ? severityColor : '#52525b'}
                side={THREE.DoubleSide}
                transparent
                opacity={isSelected || isHovered ? 1.0 : isTriggered ? 0.95 : 0.25}
              />
            </mesh>

            {/* Glowing Center Core */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(marker.id);
              }}
              onPointerOut={() => setHoveredId(null)}
              onPointerDown={(e) => {
                e.stopPropagation();
                playReticleLock();
                if (onSelectMarker) onSelectMarker(marker);
              }}
              onClick={(e) => {
                e.stopPropagation();
                playReticleLock();
                if (onSelectMarker) onSelectMarker(marker);
              }}
            >
              <sphereGeometry args={[0.024, 16, 16]} />
              <meshBasicMaterial
                color={isSelected ? '#34d399' : isHovered ? '#7dd3fc' : isTriggered ? severityColor : '#71717a'}
              />
            </mesh>

            {/* Glassmorphic Inspection Badge Tooltip */}
            {isTriggered && showLabel && (
              <Html distanceFactor={5.5} position={[0, 0.14, 0]} center>
                <div
                  onPointerOver={() => setHoveredId(marker.id)}
                  onPointerOut={() => setHoveredId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    playReticleLock();
                    if (onSelectMarker) onSelectMarker(marker);
                  }}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap shadow-2xl border backdrop-blur-xl transition-all select-none ${
                    isSelected
                      ? 'bg-zinc-950/95 text-emerald-300 border-emerald-400 scale-105 shadow-emerald-500/30'
                      : 'bg-zinc-950/95 text-zinc-100 border-zinc-700/80 hover:border-cyan-400 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span
                      className="w-2 h-2 rounded-full animate-ping"
                      style={{ backgroundColor: isSelected ? '#34d399' : severityColor }}
                    />
                    <span>{marker.label}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center justify-between gap-3 mt-0.5">
                    <span>{marker.type}</span>
                    <span className="font-bold text-emerald-400">{marker.upsellEstimate}</span>
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Preload model
useGLTF.preload('/models/porsche-911.glb', '/draco/');
