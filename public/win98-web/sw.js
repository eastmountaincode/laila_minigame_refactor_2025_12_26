// Tender OS kill-switch service worker.
// Replaces the previous Workbox/VitePWA precaching SW, which was serving
// stale hashed chunks after redeploys (visible as "Could not launch X"
// errors, especially on iOS Safari).
//
// On install it immediately activates, unregisters itself, and purges all
// of its caches. After one reload, clients fetch everything from network.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {}
      try {
        await self.registration.unregister();
      } catch {}
      try {
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) client.navigate(client.url);
      } catch {}
    })(),
  );
});

self.addEventListener("fetch", () => {});
