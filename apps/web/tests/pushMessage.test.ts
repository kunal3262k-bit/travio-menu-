import { describe, expect, it } from "vitest";
import {
  PUSH_NOTIFICATION_ICON,
  buildPushMessage,
  readPushConfig,
  resolvePushUrl,
  stringifyPushMessage,
} from "../src/shared/utils/pushMessage";

describe("readPushConfig", () => {
  it("returns null when no VAPID keys are present", () => {
    expect(readPushConfig({})).toBeNull();
  });

  it("returns null when any key is missing", () => {
    expect(
      readPushConfig({ VAPID_PUBLIC_KEY: "pub", VAPID_PRIVATE_KEY: "priv" })
    ).toBeNull();
    expect(
      readPushConfig({ VAPID_PUBLIC_KEY: "pub", VAPID_SUBJECT: "mailto:a@b.c" })
    ).toBeNull();
    expect(
      readPushConfig({ VAPID_PRIVATE_KEY: "priv", VAPID_SUBJECT: "mailto:a@b.c" })
    ).toBeNull();
  });

  it("returns a config when all keys are present", () => {
    const config = readPushConfig({
      VAPID_PUBLIC_KEY: "  pub  ",
      VAPID_PRIVATE_KEY: "priv",
      VAPID_SUBJECT: "mailto:owner@example.com",
    });
    expect(config).toEqual({
      publicKey: "pub",
      privateKey: "priv",
      subject: "mailto:owner@example.com",
    });
  });
});

describe("resolvePushUrl", () => {
  it("routes KITCHEN pushes to the staff kitchen page", () => {
    expect(resolvePushUrl("demo-restaurant", "KITCHEN")).toBe("/demo-restaurant/staff/kitchen");
  });

  it("routes WAITER pushes to the staff waiter page", () => {
    expect(resolvePushUrl("demo-restaurant", "WAITER")).toBe("/demo-restaurant/staff/waiter");
  });
});

describe("buildPushMessage", () => {
  it("builds a message with defaults (icon, vibrate, data.url)", () => {
    const msg = buildPushMessage("my-slug", "KITCHEN", {
      title: "🍳 New Kitchen Order",
      body: "New ticket placed.",
      tag: "new-order-abc",
    });
    expect(msg).toEqual({
      title: "🍳 New Kitchen Order",
      body: "New ticket placed.",
      icon: PUSH_NOTIFICATION_ICON,
      vibrate: [200, 100, 200],
      tag: "new-order-abc",
      data: { url: "/my-slug/staff/kitchen" },
    });
  });

  it("omits tag when not provided", () => {
    const msg = buildPushMessage("my-slug", "WAITER", { title: "t", body: "b" });
    expect("tag" in msg).toBe(false);
    expect(msg.data.url).toBe("/my-slug/staff/waiter");
  });

  it("honors custom icon and vibrate", () => {
    const msg = buildPushMessage("my-slug", "WAITER", {
      title: "t",
      body: "b",
      icon: "/custom.png",
      vibrate: [300, 100, 300],
    });
    expect(msg.icon).toBe("/custom.png");
    expect(msg.vibrate).toEqual([300, 100, 300]);
  });

  it("stringifyPushMessage produces valid JSON with the same shape", () => {
    const msg = buildPushMessage("s", "WAITER", { title: "t", body: "b", tag: "x" });
    const parsed = JSON.parse(stringifyPushMessage(msg));
    expect(parsed).toEqual(msg);
  });
});
