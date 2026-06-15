/* GreenIQ service worker — bump VERSION on every release to push updates */
const VERSION = "giq-v5.1.2";
const CORE = [
  "./",
  "index.html",
  "golfiq.css",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "greeniq-logo/favicon.svg",
  "greeniq-logo/favicon-32.png",
  "greeniq-logo/apple-touch-icon.png",
  "greeniq-logo/icon-192.png",
  "greeniq-logo/icon-512.png",
  "greeniq-logo/icon-maskable-192.png",
  "greeniq-logo/icon-maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* App shell: network-first for HTML so new releases land on next open;
   cache-first for everything else (assets are versioned by the cache name).
   Runtime-cache successful GETs, including Google Fonts, so it all works offline. */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res && (res.status === 200 || res.type === "opaque")) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
