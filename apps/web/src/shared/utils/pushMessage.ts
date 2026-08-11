/**
 * Pure, dependency-free helpers for Web Push messages and VAPID config.
 * Kept separate from push.ts so it can be unit-tested without loading
 * web-push or the database. Never returns or exposes the VAPID private key.
 */
export const PUSH_NOTIFICATION_ICON = "/icons/icon-192x192.png";

export type PushConfig = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

export type StaffRole = "WAITER" | "KITCHEN";

/** Reads VAPID config from env. Returns null when any key is missing. */
export function readPushConfig(env: Record<string, string | undefined>): PushConfig | null {
  const publicKey = env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = env.VAPID_PRIVATE_KEY?.trim();
  const subject = env.VAPID_SUBJECT?.trim();
  if (!publicKey || !privateKey || !subject) return null;
  return { publicKey, privateKey, subject };
}

/** The staff page a push for a given role should open. */
export function resolvePushUrl(restaurantSlug: string, role: StaffRole): string {
  return `/${restaurantSlug}/${role === "KITCHEN" ? "staff/kitchen" : "staff/waiter"}`;
}

export type PushInput = {
  title: string;
  body: string;
  tag?: string;
  vibrate?: number[];
  icon?: string;
};

export type PushMessage = {
  title: string;
  body: string;
  icon: string;
  vibrate: number[];
  tag?: string;
  data: { url: string };
};

/** Builds the exact payload shape the service worker renders. */
export function buildPushMessage(
  restaurantSlug: string,
  role: StaffRole,
  input: PushInput
): PushMessage {
  const message: PushMessage = {
    title: input.title,
    body: input.body,
    icon: input.icon || PUSH_NOTIFICATION_ICON,
    vibrate: input.vibrate ?? [200, 100, 200],
    data: { url: resolvePushUrl(restaurantSlug, role) },
  };
  if (input.tag) message.tag = input.tag;
  return message;
}

export function stringifyPushMessage(message: PushMessage): string {
  return JSON.stringify(message);
}
