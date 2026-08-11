const PUSH_NOTIFICATION_ICON = "/icons/icon-192x192.png";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Installability requires a fetch handler in modern browsers. This is a pure
// passthrough — no caching of any response, so stale API/data can never be
// served to staff or customers.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Server → Web Push → OS notification. The payload (built server-side by
// pushMessage.buildPushMessage) carries title/body/icon/vibrate/tag and
// data.url = the correct staff page. This handler NEVER reconstructs business
// state and NEVER triggers the JS ringer — foreground ringing is exclusively
// the Socket.IO clients' job.
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const targetUrl = (data.data && data.data.url) || "/";
    const targetPath = new URL(targetUrl, self.location.origin).pathname;

    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        // If an active staff client window for the target path is currently visible and focused in the foreground,
        // suppress the OS notification (foreground UI updates and audio ringers are handled directly via Socket.IO).
        const isForegroundFocused = clientList.some((client) => {
          const clientPath = new URL(client.url, self.location.origin).pathname;
          return clientPath === targetPath && client.visibilityState === "visible" && client.focused;
        });

        if (isForegroundFocused) {
          return;
        }

        return self.registration.showNotification(data.title || "SwiftTab", {
          body: data.body || "New notification",
          icon: data.icon || PUSH_NOTIFICATION_ICON,
          vibrate: data.vibrate || [100, 50, 100],
          tag: data.tag || undefined,
          data: { url: targetUrl },
          silent: false,
          requireInteraction: true,
        });
      })
    );
  } catch (e) {
    console.error("Error parsing push data", e);
  }
});

// Clicking the OS notification focuses an existing SwiftTab window on the
// same staff page, otherwise opens the staff page from the notification's
// data.url. Never blindly opens "/".
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";
  const targetPath = new URL(targetUrl, self.location.origin).pathname;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (new URL(client.url, self.location.origin).pathname === targetPath) {
          return client.focus().then(() => (client.navigate ? client.navigate(targetUrl) : undefined));
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

// The push service rotated the subscription (or it was dropped). Re-subscribe
// and re-register with the server. Guarded so it can only ever run once per
// subscriptionchange event — no loop possible.
self.addEventListener("subscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keyRes = await fetch("/api/push/vapid-public-key");
        if (!keyRes.ok) return;
        const { publicKey } = await keyRes.json();
        const subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: {
              endpoint: subscription.endpoint,
              keys: subscription.toJSON().keys,
            },
            userAgent: "service-worker",
          }),
        });
      } catch (e) {
        console.error("subscriptionchange resubscribe failed", e);
      }
    })()
  );
});
