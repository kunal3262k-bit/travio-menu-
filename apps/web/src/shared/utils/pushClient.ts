/**
 * Client-side push helpers (browser only). This module MUST NOT import
 * web-push or any server-only code. All failures return { ok: false, error }
 * so staff functionality is never broken by push unavailability.
 */

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function serializeSubscription(subscription: PushSubscription): {
  endpoint: string;
  keys: { p256dh: string; auth: string };
} {
  const json = subscription.toJSON() as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };
  return { endpoint: json.endpoint, keys: json.keys };
}

export function pushEnabledKey(restaurantSlug: string, role: string): string {
  return `swifttab_push_enabled_${restaurantSlug}_${role}`;
}

/**
 * Full enable flow: permission -> fetch VAPID public key -> pushManager
 * subscribe -> register with the server. User gesture required by browsers
 * is provided by the calling button. Never auto-called on page load.
 */
export async function enablePushAlerts(): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { ok: false, error: "Push notifications are not supported in this browser." };
  }

  let permission: NotificationPermission;
  try {
    permission = await Notification.requestPermission();
  } catch {
    return { ok: false, error: "Failed to request notification permission." };
  }
  if (permission !== "granted") {
    return {
      ok: false,
      error:
        permission === "denied"
          ? "Notifications are blocked in browser settings."
          : "Notification permission was not granted.",
    };
  }

  try {
    const keyRes = await fetch("/api/push/vapid-public-key");
    if (!keyRes.ok) {
      return { ok: false, error: "Push is not configured on the server yet." };
    }
    const { publicKey } = await keyRes.json();

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: serializeSubscription(subscription),
        userAgent: navigator.userAgent,
      }),
    });
    if (!res.ok) {
      return { ok: false, error: "Failed to register this device with the server." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong while enabling push alerts." };
  }
}

export async function disablePushAlerts(): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { ok: false, error: "Push notifications are not supported in this browser." };
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const { endpoint } = serializeSubscription(subscription);
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
      await subscription.unsubscribe();
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to disable push alerts." };
  }
}
