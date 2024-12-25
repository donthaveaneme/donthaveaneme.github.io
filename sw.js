// sw.js
const CACHE_NAME = "tailwind-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/point.html",
  "/no-connection.html", // Menambahkan no-connection.html ke cache
  "/styles.css", // File CSS Tailwind
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
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;  // Menggunakan cache jika ada
      }

      // Jika tidak ada di cache, ambil dari jaringan
      return fetch(event.request).catch(() => {
        // Jika tidak ada koneksi, tampilkan halaman no-connection
        return caches.match("/no-connection.html");
      });
    })
  );
});
