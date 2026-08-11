/**
 * Web Audio synthesis for SwiftTab's three distinct alert sounds.
 *
 * No audio assets, no network dependency, no copyrighted material — every
 * sound is generated locally with the Web Audio API. CPU cost is minimal:
 * a handful of short-lived oscillators per call, all garbage-collected by the
 * AudioContext scheduler.
 *
 * THREE DISTINCT EXPERIENCES (must never be interchangeable):
 *  - playKitchenRinger()   → old mechanical telephone bell ("brrring").
 *    Loud, unmistakable, utilitarian. Repeated by the KDS alert loop while a
 *    ticket is unacknowledged.
 *  - playWaiterHotelChime()→ premium hotel service bell ("ding...dong").
 *    Elegant, soft. Repeated by the waiter alert loop while a request/claim
 *    is unresolved.
 *  - playCustomerHotelChime() → the SAME hotel-bell style, exactly ONCE.
 *    Played on the customer device when they press CALL WAITER — no looping.
 *
 * Audio unlock: all functions call unlockAudio() first, preserving the
 * existing user-gesture strategy (the shared context is unlocked on the staff
 * PIN login / first tap and stays unlocked across SPA navigations).
 */

let sharedCtx: AudioContext | null = null;
let sharedEnabled = false;
const listeners = new Set<() => void>();

export function getSharedContext(): AudioContext | null {
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

function notifyUnlocked() {
  for (const listener of listeners) listener();
}

/** Subscribe to unlock state changes (used by useNotificationSound). */
export function onAudioUnlocked(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/**
 * Unlocks the shared audio context. Must run inside a real user gesture
 * (click / keypress / touch). Plays a silent near-silent blip — the minimal
 * gesture that satisfies iOS/Safari autoplay policy.
 */
export async function unlockAudio(): Promise<void> {
  if (typeof window === "undefined") return;
  const ctx = getSharedContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  } catch {
    // Some browsers reject resume outside a gesture; ignore silently.
  }

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
    notifyUnlocked();
  }
}

type PartialSpec = {
  /** Frequency ratio of this partial relative to the fundamental. */
  ratio: number;
  /** Amplitude relative to the fundamental (0..1). */
  amp: number;
  /** Exponential decay time constant in seconds. */
  decay: number;
};

type Striker = {
  oscillatorType: OscillatorType;
  partials: PartialSpec[];
  /** Total length of the note in seconds. */
  length: number;
  attack: number;
  gain: number;
  /** Detune spread (± cents) between repeated strikes — mechanical feel. */
  detuneCents?: number;
};

function playStriker(ctx: AudioContext, spec: Striker, at: number) {
  const detune = spec.detuneCents ?? 0;
  for (const p of spec.partials) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 440 * p.ratio;
    osc.type = spec.oscillatorType;
    osc.frequency.setValueAtTime(freq, at);
    osc.detune.setValueAtTime(detune, at);
    const peak = spec.gain * p.amp;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), at + spec.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + spec.length);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(at);
    osc.stop(at + spec.length + 0.05);
  }
}

// ---------------------------------------------------------------------------
// KITCHEN / KDS — OLD MECHANICAL TELEPHONE BELL
// A "ring" is a fast double-strike (clapper hit) repeated 3×, like a
// mechanical desk phone: BRRRRING... BRRRING... BRRING. Inharmonic metallic
// partials with fast decay plus a low mechanical thump per strike.
// ---------------------------------------------------------------------------

function kitchenStrike(ctx: AudioContext, at: number) {
  const partials: PartialSpec[] = [
    { ratio: 920 / 440, amp: 1, decay: 0.22 },
    { ratio: (920 * 2.4) / 440, amp: 0.55, decay: 0.16 },
    { ratio: (920 * 3.7) / 440, amp: 0.3, decay: 0.12 },
    { ratio: (920 * 5.1) / 440, amp: 0.18, decay: 0.09 },
  ];
  playStriker(ctx, {
    oscillatorType: "square",
    partials,
    length: 0.3,
    attack: 0.002,
    gain: 0.5,
    detuneCents: 4,
  }, at);
  // Mechanical clapper thump — short low thud.
  playStriker(ctx, {
    oscillatorType: "triangle",
    partials: [{ ratio: 150 / 440, amp: 1, decay: 0.06 }],
    length: 0.08,
    attack: 0.001,
    gain: 0.35,
  }, at);
}

function synthesizeKitchenRinger() {
  const ctx = getSharedContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  // Three ring bursts ("brrring... brrring... brrring"), each a double strike.
  for (let burst = 0; burst < 3; burst++) {
    const start = t + burst * 0.72;
    kitchenStrike(ctx, start);
    kitchenStrike(ctx, start + 0.26);
  }
}

/** Old mechanical telephone bell. Loud, unmistakable, utilitarian. */
export async function playKitchenRinger(): Promise<void> {
  await unlockAudio();
  synthesizeKitchenRinger();
}

// ---------------------------------------------------------------------------
// WAITER STAFF + CUSTOMER — PREMIUM HOTEL SERVICE BELL ("ding...dong")
// Warm sine "ding" (A5, 880 Hz) followed by a lower, longer "dong" (E5, 660 Hz)
// with soft harmonics and long smooth decays.
// ---------------------------------------------------------------------------

function hotelChimeParts(ctx: AudioContext, at: number, fundamental: number, length: number, gain: number) {
  const partials: PartialSpec[] = [
    { ratio: fundamental / 440, amp: 1, decay: length * 0.7 },
    { ratio: (fundamental * 2) / 440, amp: 0.3, decay: length * 0.5 },
    { ratio: (fundamental * 3) / 440, amp: 0.1, decay: length * 0.4 },
  ];
  playStriker(ctx, {
    oscillatorType: "sine",
    partials,
    length,
    attack: 0.006,
    gain,
  }, at);
}

function synthesizeHotelChime() {
  const ctx = getSharedContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  // "ding" — 880 Hz, 0.65 s decay.
  hotelChimeParts(ctx, t, 880, 0.65, 0.4);
  // 330 ms of silence, then "dong" — 660 Hz, 0.95 s decay.
  hotelChimeParts(ctx, t + 0.33, 660, 0.95, 0.42);
}

/** Premium hotel service bell ("ding...dong"). Repeats while unresolved. */
export async function playWaiterHotelChime(): Promise<void> {
  await unlockAudio();
  synthesizeHotelChime();
}

/**
 * Customer-side hotel chime — exactly ONE "ding...dong", never looped.
 * Played on the customer device when they press CALL WAITER / REQUEST BILL.
 */
export async function playCustomerHotelChime(): Promise<void> {
  await unlockAudio();
  synthesizeHotelChime();
}

/** Short single-note confirmation (order status changes on the customer screen). */
export async function playStatusChime(): Promise<void> {
  await unlockAudio();
  const ctx = getSharedContext();
  if (!ctx) return;
  hotelChimeParts(ctx, ctx.currentTime, 880, 0.4, 0.25);
}

/** Two quick high beeps — generic attention for miscellaneous alerts. */
export async function playAlertBeep(): Promise<void> {
  await unlockAudio();
  const ctx = getSharedContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  playStriker(ctx, {
    oscillatorType: "sine",
    partials: [{ ratio: 988 / 440, amp: 1, decay: 0.18 }],
    length: 0.2,
    attack: 0.004,
    gain: 0.3,
  }, t);
  playStriker(ctx, {
    oscillatorType: "sine",
    partials: [{ ratio: 988 / 440, amp: 1, decay: 0.18 }],
    length: 0.2,
    attack: 0.004,
    gain: 0.3,
  }, t + 0.24);
}
