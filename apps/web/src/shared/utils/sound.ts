"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isAudioUnlocked,
  onAudioUnlocked,
  unlockAudio,
  playKitchenRinger,
  playWaiterHotelChime,
  playCustomerHotelChime,
  playStatusChime,
  playAlertBeep,
} from "@/lib/sounds";

type SoundKind = "order" | "waiter" | "customer" | "status" | "payment" | "alert";

type VibrationPattern = number | number[];

const vibrations: Record<SoundKind, VibrationPattern> = {
  order: [40, 30, 40],
  waiter: [140, 70, 140, 70, 420],
  customer: [60, 40, 60],
  status: [50, 25, 50],
  payment: [70, 40, 70, 40, 90],
  alert: [100, 40, 100]
};

/**
 * Pure mapping: which synthesis function serves which alert kind.
 * THREE DISTINCT EXPERIENCES (never interchangeable):
 *  - "order" (KDS)  → old mechanical telephone bell
 *  - "waiter"/"payment" → premium hotel service bell
 *  - "customer"     → the same hotel bell, exactly ONCE
 */
export function resolveSoundKind(kind: SoundKind) {
  switch (kind) {
    case "order":
      return playKitchenRinger;
    case "waiter":
    case "payment":
      return playWaiterHotelChime;
    case "customer":
      return playCustomerHotelChime;
    case "status":
      return playStatusChime;
    case "alert":
      return playAlertBeep;
  }
}

/**
 * useNotificationSound — React binding over the shared audio engine.
 *
 * THREE DISTINCT AUDIO EXPERIENCES (never interchangeable):
 *  - "order" / kitchen   → playKitchenRinger  (old mechanical telephone bell)
 *  - "waiter" / payment  → playWaiterHotelChime (premium hotel service bell)
 *  - "customer"          → playCustomerHotelChime (hotel bell, exactly once)
 *
 * The AudioContext is shared module-wide: a context unlocked on the PIN-login
 * button stays unlocked (and keeps its state) across SPA navigation between
 * login/kitchen/waiter pages — no second tap required.
 */
export function useNotificationSound() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(isAudioUnlocked);

  useEffect(() => {
    const update = () => setIsSoundEnabled(isAudioUnlocked());
    const unsubscribe = onAudioUnlocked(update);
    update();
    return unsubscribe;
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
      vibrate(kind);
      return resolveSoundKind(kind)();
    },
    [vibrate]
  );

  return {
    isSoundEnabled,
    playSound,
    playKitchenRinger,
    playWaiterHotelChime,
    playCustomerHotelChime,
    playStatusChime,
    unlockSound: unlockAudio,
    vibrate,
  };
}

export { unlockAudio };
