import { describe, expect, it, vi, beforeAll, beforeEach } from "vitest";

/**
 * AUDIO tests — three distinct synthesized experiences:
 *  - KDS kitchen alert    → old mechanical telephone bell (repeated strikes,
 *                           metallic partials, loud)
 *  - Waiter staff alerts  → premium hotel service bell "ding...dong"
 *  - Customer waiter call → the hotel bell, exactly once (never looped)
 * Everything is synthesized with Web Audio — no assets, no network.
 */

class FakeParam {
  values: number[] = [];
  setValueAtTime(v: number) {
    this.values.push(v);
  }
  exponentialRampToValueAtTime(v: number) {
    this.values.push(v);
  }
}

class FakeOscillator {
  frequency = new FakeParam();
  detune = new FakeParam();
  type = "sine";
  connect() {}
  start() {}
  stop() {}
}

class FakeGain {
  gain = new FakeParam();
  connect() {}
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  currentTime = 0;
  state = "running" as AudioContextState;
  destination = {};
  oscillators: FakeOscillator[] = [];
  constructor() {
    FakeAudioContext.instances.push(this);
  }
  createOscillator() {
    const o = new FakeOscillator();
    this.oscillators.push(o);
    return o;
  }
  createGain() {
    return new FakeGain();
  }
  resume() {
    this.state = "running";
    return Promise.resolve();
  }
}

beforeAll(() => {
  vi.stubGlobal("window", {
    AudioContext: FakeAudioContext,
  } as any);
});

// The module keeps ONE shared context for the whole session (by design — the
// same context stays unlocked across SPA navigations). Tests therefore count
// oscillator DELTAS per call.
let startedAt = 0;
beforeEach(() => {
  startedAt =
    FakeAudioContext.instances.length === 0
      ? 0
      : FakeAudioContext.instances[FakeAudioContext.instances.length - 1].oscillators.length;
});

const current = () => FakeAudioContext.instances[FakeAudioContext.instances.length - 1];
const delta = () => current().oscillators.length - startedAt;
const oscillatorFrequencies = () => current().oscillators.slice(startedAt).map((o) => o.frequency.values[0] ?? 0);
const oscillatorsInLastCall = () => current().oscillators.slice(startedAt);

const { playKitchenRinger, playWaiterHotelChime, playCustomerHotelChime, playStatusChime } =
  await import("../src/shared/utils/sounds");
const { resolveSoundKind } = await import("../src/shared/utils/sound");

describe("KDS / kitchen — old mechanical telephone bell", () => {
  it("plays repeated metallic bell strikes (3 ring bursts × double strike)", async () => {
    await playKitchenRinger();
    // 3 bursts × 2 strikes × (4 bell partials + 1 mechanical thump) = 30
    // oscillators, plus the silent unlock blip.
    expect(delta()).toBeGreaterThanOrEqual(30);
  });

  it("is built on inharmonic metallic partials around a ~920 Hz fundamental", async () => {
    await playKitchenRinger();
    const freqs = oscillatorFrequencies();
    expect(freqs).toContain(920); // fundamental
    expect(freqs).toContain(920 * 2.4); // inharmonic overtone ratio 2.4
    expect(freqs).toContain(920 * 3.7);
    // Utilitarian square-ish bite, not a soft sine chime.
    const square = oscillatorsInLastCall().filter((o) => o.type === "square");
    expect(square.length).toBeGreaterThan(0);
  });
});

describe("waiter staff — premium hotel service bell", () => {
  it("plays exactly one 'ding' (880 Hz) + one 'dong' (660 Hz)", async () => {
    await playWaiterHotelChime();
    const freqs = oscillatorFrequencies();
    expect(freqs).toContain(880);
    expect(freqs).toContain(660);
    // 2 notes × 3 partials + unlock blip = 7 oscillators — a SINGLE chime,
    // nothing repeated or looped.
    expect(delta()).toBe(7);
  });

  it("is NOT the telephone ringer (no 920 Hz metallic train, no square wave)", async () => {
    await playWaiterHotelChime();
    const freqs = oscillatorFrequencies();
    expect(freqs).not.toContain(920);
    expect(oscillatorsInLastCall().every((o) => o.type === "sine")).toBe(true);
  });
});

describe("customer waiter request — hotel chime exactly once", () => {
  it("plays one hotel chime and never loops", async () => {
    await playCustomerHotelChime();
    const freqs = oscillatorFrequencies();
    expect(freqs).toContain(880);
    expect(freqs).toContain(660);
    expect(delta()).toBe(7);
  });

  it("is a distinct function from the waiter chime (not interchangeable)", () => {
    expect(playCustomerHotelChime).not.toBe(playWaiterHotelChime);
    expect(playCustomerHotelChime).not.toBe(playKitchenRinger);
    expect(playWaiterHotelChime).not.toBe(playKitchenRinger);
  });
});

describe("kind → sound mapping (useNotificationSound dispatch)", () => {
  it("kitchen orders use the telephone ringer", () => {
    expect(resolveSoundKind("order")).toBe(playKitchenRinger);
  });
  it("waiter alerts + payments use the hotel chime", () => {
    expect(resolveSoundKind("waiter")).toBe(playWaiterHotelChime);
    expect(resolveSoundKind("payment")).toBe(playWaiterHotelChime);
  });
  it("customer requests use the one-shot hotel chime", () => {
    expect(resolveSoundKind("customer")).toBe(playCustomerHotelChime);
  });
  it("status/alert have dedicated short tones", () => {
    expect(resolveSoundKind("status")).toBe(playStatusChime);
    expect(resolveSoundKind("alert")).not.toBe(playWaiterHotelChime);
  });
});
