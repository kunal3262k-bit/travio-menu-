/**
 * Server-side Web Push sender. IMPORTANT: this module is server-only (imports
 * web-push + prisma). Client code must use pushClient.ts instead.
 *
 * Design rules:
 * - Lazy VAPID initialization: no-op (returns 0) when VAPID keys are absent,
 *   so existing deployments without push config keep working untouched.
 * - Fire-and-forget friendly: sendPushTo never throws — failures are logged
 *   and stale subscriptions (HTTP 404/410) are pruned. Push failures can
 *   NEVER fail an originating order/payment/waiter-request API operation.
 */
import webpush from "web-push";
import { prisma } from "./prisma";
import {
  buildPushMessage,
  readPushConfig,
  type PushInput,
  type StaffRole,
} from "./pushMessage";

export type PushTarget = {
  restaurantId: string;
  roles: StaffRole[];
};

function ensureVapidConfigured(): boolean {
  const config = readPushConfig(process.env);
  if (!config) return false;
  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  return true;
}

/** Boot-time warning only — missing config must never block startup. */
export function warnIfPushUnconfigured(): void {
  if (!readPushConfig(process.env)) {
    console.warn(
      "[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT are not configured. " +
        "Background Web Push will stay disabled until they are set (see .env.example)."
    );
  }
}

/**
 * Sends a push to all staff subscriptions of the restaurant matching the
 * given roles. Returns the number of notifications delivered.
 */
export async function sendPushTo(target: PushTarget, input: PushInput): Promise<number> {
  if (!ensureVapidConfigured()) return 0;

  let subscriptions;
  try {
    subscriptions = await prisma.pushSubscription.findMany({
      where: { restaurantId: target.restaurantId, role: { in: target.roles } },
    });
  } catch (err) {
    console.error("[push] failed to query subscriptions:", err);
    return 0;
  }
  if (subscriptions.length === 0) return 0;

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const message = JSON.stringify(
        buildPushMessage(sub.restaurantSlug, sub.role as StaffRole, input)
      );
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          message,
          { TTL: 600, urgency: "high" }
        );
        return "sent" as const;
      } catch (err: any) {
        const statusCode = err?.statusCode ?? 0;
        if (statusCode === 404 || statusCode === 410) {
          try {
            await prisma.pushSubscription.deleteMany({ where: { id: sub.id } });
          } catch (deleteErr) {
            console.error("[push] failed to prune stale subscription:", deleteErr);
          }
          return "pruned" as const;
        }
        console.error(`[push] delivery failed (status ${statusCode}):`, err?.message ?? err);
        return "failed" as const;
      }
    })
  );

  return results.filter((r) => r.status === "fulfilled" && r.value === "sent").length;
}

/** Fire-and-forget wrapper: never throws, never awaits. For socket emit hooks. */
export function firePush(target: PushTarget, input: PushInput): void {
  void sendPushTo(target, input).catch((err) => {
    console.error("[push] firePush failed:", err);
  });
}
