const CACHE_NAME = "tailwind-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css", // Tambahkan file CSS Tailwind
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// Install Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch Resources
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
