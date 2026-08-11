import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/shared/utils/prisma", () => ({
  prisma: {
    pushSubscription: { findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
  },
}));

vi.mock("../src/shared/utils/staffAuth", () => ({
  requireStaff: vi.fn(),
}));

const { prisma } = await import("../src/shared/utils/prisma");
const { requireStaff } = await import("../src/shared/utils/staffAuth");
const { POST: subscribePOST } = await import("../app/api/push/subscribe/route");
const { POST: unsubscribePOST } = await import("../app/api/push/unsubscribe/route");
const { GET: publicKeyGET } = await import("../app/api/push/vapid-public-key/route");

const request = (body: object) => ({ json: vi.fn().mockResolvedValue(body) });

const kitchenSession = {
  staffId: "staff-kitchen",
  staffName: "Chef",
  role: "KITCHEN",
  restaurantId: "rest-A",
  restaurantSlug: "rest-a",
  restaurantName: "Rest A",
  loggedInAt: Date.now(),
};

const waiterSession = {
  ...kitchenSession,
  staffId: "staff-waiter",
  role: "WAITER",
};

const validBody = {
  subscription: {
    endpoint: "https://push.example.com/endpoint-1",
    keys: { p256dh: "p256dh-value-xxxx", auth: "auth-value-xxxx" },
  },
  userAgent: "Chrome on Android",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireStaff).mockResolvedValue(kitchenSession as any);
  (prisma.pushSubscription.findUnique as any).mockResolvedValue(null);
  (prisma.pushSubscription.upsert as any).mockResolvedValue({ id: "sub-1" });
  (prisma.pushSubscription.deleteMany as any).mockResolvedValue({ count: 1 });
});

describe("POST /api/push/subscribe — authorization", () => {
  it("rejects unauthenticated requests with 401", async () => {
    vi.mocked(requireStaff).mockRejectedValue(new Response("Unauthorized", { status: 401 }));
    await expect(subscribePOST(request(validBody) as any)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("requires WAITER/KITCHEN roles only (admin/other roles rejected upstream)", async () => {
    await subscribePOST(request(validBody) as any);
    expect(requireStaff).toHaveBeenCalledWith(["WAITER", "KITCHEN"]);
  });

  it("rejects a non-staff role with 401", async () => {
    vi.mocked(requireStaff).mockRejectedValue(new Response("Unauthorized - Invalid Role", { status: 401 }));
    await expect(subscribePOST(request(validBody) as any)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("rejects invalid subscription payloads with 400", async () => {
    const res = (await subscribePOST(request({ subscription: { endpoint: "short" } }) as any)) as Response;
    expect(res.status).toBe(400);
  });

  it("rejects malformed JSON with 400", async () => {
    const res = (await subscribePOST({ json: vi.fn().mockRejectedValue(new Error("bad json")) } as any)) as Response;
    expect(res.status).toBe(400);
  });
});

describe("POST /api/push/subscribe — tenant isolation + ownership", () => {
  it("stores ONLY the identity from the verified staff session (client cannot choose restaurant)", async () => {
    await subscribePOST(request(validBody) as any);
    const args = (prisma.pushSubscription.upsert as any).mock.calls[0][0] as any;
    expect(args.create).toMatchObject({
      restaurantId: "rest-A",
      restaurantSlug: "rest-a",
      staffId: "staff-kitchen",
      role: "KITCHEN",
      endpoint: validBody.subscription.endpoint,
      p256dh: validBody.subscription.keys.p256dh,
      auth: validBody.subscription.keys.auth,
    });
  });

  it("re-assigns an endpoint previously owned by another staff member (switch-staff)", async () => {
    (prisma.pushSubscription.findUnique as any).mockResolvedValue({
      id: "old-sub",
      staffId: "staff-other",
      restaurantId: "rest-B",
    });
    await subscribePOST(request(validBody) as any);
    expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
      where: { endpoint: validBody.subscription.endpoint },
    });
    expect(prisma.pushSubscription.upsert).toHaveBeenCalled();
  });

  it("updates in place when the endpoint already belongs to the same staff", async () => {
    (prisma.pushSubscription.findUnique as any).mockResolvedValue({
      id: "own-sub",
      staffId: "staff-kitchen",
      restaurantId: "rest-A",
    });
    await subscribePOST(request(validBody) as any);
    expect(prisma.pushSubscription.deleteMany).not.toHaveBeenCalled();
    expect(prisma.pushSubscription.upsert).toHaveBeenCalled();
  });
});

describe("POST /api/push/unsubscribe — ownership", () => {
  it("deletes only the authenticated staff member's subscription", async () => {
    const res = (await unsubscribePOST(request({ endpoint: validBody.subscription.endpoint }) as any)) as Response;
    expect(res.status).toBe(200);
    expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
      where: { endpoint: validBody.subscription.endpoint, staffId: "staff-kitchen" },
    });
  });

  it("rejects unauthenticated requests with 401", async () => {
    vi.mocked(requireStaff).mockRejectedValue(new Response("Unauthorized", { status: 401 }));
    await expect(unsubscribePOST(request({ endpoint: "https://x" }) as any)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("rejects a missing/short endpoint with 400", async () => {
    const res = (await unsubscribePOST(request({ endpoint: "short" }) as any)) as Response;
    expect(res.status).toBe(400);
  });
});

describe("GET /api/push/vapid-public-key", () => {
  it("returns the public key (never the private key) when configured", async () => {
    process.env.VAPID_PUBLIC_KEY = "public-key-value";
    process.env.VAPID_PRIVATE_KEY = "super-secret-private-key";
    process.env.VAPID_SUBJECT = "mailto:owner@example.com";
    const res = (await publicKeyGET()) as Response;
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.publicKey).toBe("public-key-value");
    expect(JSON.stringify(json)).not.toContain("super-secret-private-key");
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    delete process.env.VAPID_SUBJECT;
  });

  it("returns 503 when the server is not configured", async () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    delete process.env.VAPID_SUBJECT;
    const res = (await publicKeyGET()) as Response;
    expect(res.status).toBe(503);
  });
});
