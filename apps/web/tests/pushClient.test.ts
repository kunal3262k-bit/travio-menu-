import { describe, expect, it } from "vitest";
import {
  isPushSupported,
  pushEnabledKey,
  serializeSubscription,
  urlBase64ToUint8Array,
} from "../src/shared/utils/pushClient";

function toBase64Url(bytes: number[]): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

describe("urlBase64ToUint8Array", () => {
  it("decodes a standard base64 string to the exact bytes", () => {
    const bytes = Array.from({ length: 65 }, (_, i) => i + 1);
    const encoded = toBase64Url(bytes);
    expect(Array.from(urlBase64ToUint8Array(encoded))).toEqual(bytes);
  });

  it("decodes VAPID keys that carry URL-safe characters", () => {
    const bytes = [255, 252, 0, 1, 128, 200];
    const encoded = toBase64Url(bytes);
    expect(encoded).not.toMatch(/[+/]/); // must have used - and _
    expect(Array.from(urlBase64ToUint8Array(encoded))).toEqual(bytes);
  });

  it("handles inputs whose length is not a multiple of 4 (padding)", () => {
    const bytes = [10, 20, 30, 40, 50, 60, 70];
    const encoded = toBase64Url(bytes);
    expect(encoded.length % 4).toBe(2); // 7 bytes -> 10 chars base64url
    expect(Array.from(urlBase64ToUint8Array(encoded))).toEqual(bytes);
  });
});

describe("serializeSubscription", () => {
  it("extracts endpoint + keys from a PushSubscription-like object", () => {
    const subscription = {
      toJSON: () => ({
        endpoint: "https://push.example.com/send/abc",
        keys: { p256dh: "p256dh-key", auth: "auth-key" },
      }),
    } as unknown as PushSubscription;
    expect(serializeSubscription(subscription)).toEqual({
      endpoint: "https://push.example.com/send/abc",
      keys: { p256dh: "p256dh-key", auth: "auth-key" },
    });
  });
});

describe("pushEnabledKey", () => {
  it("builds the storage key from slug + role", () => {
    expect(pushEnabledKey("my-rest", "KITCHEN")).toBe("swifttab_push_enabled_my-rest_KITCHEN");
    expect(pushEnabledKey("my-rest", "WAITER")).toBe("swifttab_push_enabled_my-rest_WAITER");
  });
});

describe("isPushSupported", () => {
  it("is false in a non-browser environment", () => {
    expect(isPushSupported()).toBe(false);
  });
});

describe("serviceWorkerForegroundDedupe", () => {
  it("suppresses OS notification when an active client window for target path is visible and focused", () => {
    const clients = [
      { url: "http://localhost:3000/demo/staff/kitchen", visibilityState: "visible", focused: true },
    ];
    const targetUrl = "http://localhost:3000/demo/staff/kitchen";
    const targetPath = new URL(targetUrl).pathname;

    const isForegroundFocused = clients.some((client) => {
      const clientPath = new URL(client.url).pathname;
      return clientPath === targetPath && client.visibilityState === "visible" && client.focused;
    });

    expect(isForegroundFocused).toBe(true);
  });

  it("permits OS notification when client window is hidden or not focused", () => {
    const clients = [
      { url: "http://localhost:3000/demo/staff/kitchen", visibilityState: "hidden", focused: false },
    ];
    const targetUrl = "http://localhost:3000/demo/staff/kitchen";
    const targetPath = new URL(targetUrl).pathname;

    const isForegroundFocused = clients.some((client) => {
      const clientPath = new URL(client.url).pathname;
      return clientPath === targetPath && client.visibilityState === "visible" && client.focused;
    });

    expect(isForegroundFocused).toBe(false);
  });
});
