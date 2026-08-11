import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

vi.mock("../src/shared/utils/prisma", () => ({
  prisma: {
    pushSubscription: { findMany: vi.fn(), deleteMany: vi.fn() },
  },
}));

const { sendPushTo, firePush } = await import("../src/shared/utils/push");
const webpush = (await import("web-push")).default;

const sub = {
  id: "sub-1",
  restaurantId: "rest-1",
  restaurantSlug: "my-rest",
  staffId: "staff-1",
  role: "WAITER",
  endpoint: "https://push.example.com/endpoint-1",
  p256dh: "p256dh-1",
  auth: "auth-1",
  userAgent: null,
};

const target = { restaurantId: "rest-1", roles: ["WAITER" as const] };
const input = { title: "Test Push", body: "Body", tag: "tag-1" };

function setVapidEnv(on: boolean) {
  if (on) {
    process.env.VAPID_PUBLIC_KEY = "pub";
    process.env.VAPID_PRIVATE_KEY = "priv";
    process.env.VAPID_SUBJECT = "mailto:test@example.com";
  } else {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    delete process.env.VAPID_SUBJECT;
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  setVapidEnv(true);
});

describe("sendPushTo", () => {
  it("no-ops (returns 0) when VAPID is not configured", async () => {
    setVapidEnv(false);
    const { prisma } = await import("../src/shared/utils/prisma");
    (prisma.pushSubscription.findMany as any).mockResolvedValue([sub]);
    const sent = await sendPushTo(target, input);
    expect(sent).toBe(0);
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });

  it("sends to every matching subscription and returns the sent count", async () => {
    const { prisma } = await import("../src/shared/utils/prisma");
    (prisma.pushSubscription.findMany as any).mockResolvedValue([sub, { ...sub, id: "sub-2" }]);
    vi.mocked(webpush.sendNotification).mockResolvedValue({ statusCode: 201 } as any);

    const sent = await sendPushTo(target, input);

    expect(sent).toBe(2);
    expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
    expect(webpush.sendNotification).toHaveBeenCalledWith(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      expect.any(String),
      { TTL: 600, urgency: "high" }
    );
    const message = vi.mocked(webpush.sendNotification).mock.calls[0][1] as string;
    const parsed = JSON.parse(message);
    expect(parsed.title).toBe("Test Push");
    expect(parsed.tag).toBe("tag-1");
    expect(parsed.data.url).toBe("/my-rest/staff/waiter");
  });

  it("prunes the subscription on HTTP 404", async () => {
    const { prisma } = await import("../src/shared/utils/prisma");
    (prisma.pushSubscription.findMany as any).mockResolvedValue([sub]);
    vi.mocked(webpush.sendNotification).mockRejectedValue(Object.assign(new Error("gone"), { statusCode: 404 }));

    const sent = await sendPushTo(target, input);

    expect(sent).toBe(0);
    expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({ where: { id: sub.id } });
  });

  it("prunes the subscription on HTTP 410", async () => {
    const { prisma } = await import("../src/shared/utils/prisma");
    (prisma.pushSubscription.findMany as any).mockResolvedValue([sub]);
    vi.mocked(webpush.sendNotification).mockRejectedValue(Object.assign(new Error("stale"), { statusCode: 410 }));

    await sendPushTo(target, input);

    expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({ where: { id: sub.id } });
  });

  it("logs non-410/404 failures but does NOT prune and does NOT throw", async () => {
    const { prisma } = await import("../src/shared/utils/prisma");
    (prisma.pushSubscription.findMany as any).mockResolvedValue([sub]);
    vi.mocked(webpush.sendNotification).mockRejectedValue(Object.assign(new Error("rate limited"), { statusCode: 429 }));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const sent = await sendPushTo(target, input);

    expect(sent).toBe(0);
    expect(prisma.pushSubscription.deleteMany).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("returns 0 without throwing when the subscription query fails", async () => {
    const { prisma } = await import("../src/shared/utils/prisma");
    (prisma.pushSubscription.findMany as any).mockRejectedValue(new Error("db down"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const sent = await sendPushTo(target, input);

    expect(sent).toBe(0);
    expect(webpush.sendNotification).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("returns 0 when there are no matching subscriptions", async () => {
    const { prisma } = await import("../src/shared/utils/prisma");
    (prisma.pushSubscription.findMany as any).mockResolvedValue([]);
    expect(await sendPushTo(target, input)).toBe(0);
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });
});

describe("firePush", () => {
  it("never throws even when sendPushTo fails end-to-end", async () => {
    const { prisma } = await import("../src/shared/utils/prisma");
    (prisma.pushSubscription.findMany as any).mockRejectedValue(new Error("catastrophic"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => firePush(target, input)).not.toThrow();
    await vi.waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  it("is a silent no-op when push is unconfigured", () => {
    setVapidEnv(false);
    expect(() => firePush(target, input)).not.toThrow();
  });
});
