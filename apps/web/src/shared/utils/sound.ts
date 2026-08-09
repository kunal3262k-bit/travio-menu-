"use client";

import { useCallback, useEffect, useState } from "react";

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

/**
 * Single audio context shared across the whole app session. Because Next.js
 * staff routes navigate between login/kitchen/waiter pages WITHOUT a full
 * document reload, an AudioContext created here stays alive (and keeps its
 * unlocked state) across those transitions. This is what lets the PIN-login
 * button unlock audio for the kitchen/waiter panel without any second tap.
 */
let sharedCtx: AudioContext | null = null;
let sharedEnabled = false;
const listeners = new Set<() => void>();

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextImpl = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextImpl) return null;
  if (!sharedCtx) {
    try {
      sharedCtx = new AudioContextImpl();
    } catch {
      return null;
    }
  }
  return sharedCtx;
}

export function isAudioUnlocked(): boolean {
  return sharedEnabled;
}

/**
 * Unlocks the shared audio context. Must run inside a real user gesture
 * (click / keypress / touch), which is an inescapable browser restriction.
 * Plays a silent near-silent blip then relies on the short-lived oscillator —
 * the minimal gesture that satisfies iOS/Safari autoplay policy.
 */
export async function unlockAudio(): Promise<void> {
  if (typeof window === "undefined") return;
  const ctx = getContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  } catch {
    // Some browsers reject resume outside a gesture; we ignore that silently.
  }

  // Silent blip to make the context fully "playable" on iOS WebKit.
  try {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    oscillator.frequency.setValueAtTime(220, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(t);
    oscillator.stop(t + 0.06);
  } catch {
    // Ignore silent-blip failures — the context is still unlocked.
  }

  if (!sharedEnabled) {
    sharedEnabled = true;
    for (const listener of listeners) listener();
  }
}

export function useNotificationSound() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(isAudioUnlocked);

  useEffect(() => {
    const update = () => setIsSoundEnabled(isAudioUnlocked());
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);

  const vibrate = useCallback((kind: SoundKind = "alert") => {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    navigator.vibrate(vibrations[kind] ?? vibrations.alert);
  }, []);

  // Any tap anywhere on a page also unlocks audio as a safety net. This runs
  // once per page-mount; once shared audio is unlocked it stays that way.
  useEffect(() => {
    const unlock = () => {
      void unlockAudio();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const playSound = useCallback(
    async (kind: SoundKind = "alert") => {
      await unlockAudio();
      vibrate(kind);
      const ctx = getContext();
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
    [unlockAudio, vibrate]
  );

  return { isSoundEnabled, playSound, unlockSound: unlockAudio, vibrate };
}