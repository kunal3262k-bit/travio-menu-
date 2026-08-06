"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SoundKind = "order" | "waiter" | "status" | "payment" | "alert";

type VibrationPattern = number | number[];

const tones: Record<SoundKind, [number, number, number]> = {
  order: [880, 1174, 1568],
  waiter: [523, 659, 523],
  status: [660, 880, 990],
  payment: [523, 659, 784],
  alert: [988, 784, 988]
};

const vibrations: Record<SoundKind, VibrationPattern> = {
  order: [40, 30, 40],
  waiter: [140, 70, 140, 70, 420],
  status: [50, 25, 50],
  payment: [70, 40, 70, 40, 90],
  alert: [100, 40, 100]
};

export function useNotificationSound() {
  const audioRef = useRef<AudioContext | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  const vibrate = useCallback((kind: SoundKind = "alert") => {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    navigator.vibrate(vibrations[kind] ?? vibrations.alert);
  }, []);

  const unlockSound = useCallback(async () => {
    if (typeof window === "undefined") return;
    const AudioContextImpl = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextImpl) return;

    if (!audioRef.current) {
      audioRef.current = new AudioContextImpl();
    }

    if (audioRef.current.state === "suspended") {
      await audioRef.current.resume();
    }

    setIsSoundEnabled(true);
  }, []);

  useEffect(() => {
    const unlock = () => {
      void unlockSound();
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [unlockSound]);

  const playSound = useCallback(
    async (kind: SoundKind = "alert") => {
      await unlockSound();
      vibrate(kind);
      const ctx = audioRef.current;
      if (!ctx) return;

      const sequence = tones[kind] ?? tones.alert;
      const now = ctx.currentTime;

      sequence.forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + index * 0.13;
        const stop = start + 0.11;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.16, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, stop);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(stop + 0.03);
      });
    },
    [unlockSound, vibrate]
  );

  return { isSoundEnabled, playSound, unlockSound, vibrate };
}
