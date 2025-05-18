import { precacheAndRoute } from "workbox-precaching";
import {
  registerRoute,
  setDefaultHandler,
  setCatchHandler,
} from "workbox-routing";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import CONFIG from "./config";

precacheAndRoute(self.__WB_MANIFEST || []);

registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "html-pages",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 10 }),
    ],
  })
);

registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "static-resources",
  })
);

registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com",
  new StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets",
  })
);

registerRoute(
  ({ url }) => url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

registerRoute(
  ({ url }) =>
    url.origin === "https://cdnjs.cloudflare.com" ||
    url.pathname.includes("fontawesome"),
  new CacheFirst({
    cacheName: "fontawesome",
  })
);

registerRoute(
  ({ url }) => url.origin === "https://ui-avatars.com",
  new CacheFirst({
    cacheName: "avatars-api",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

registerRoute(
  ({ url }) => url.origin.includes("maptiler"),
  new CacheFirst({
    cacheName: "maptiler-api",
  })
);

registerRoute(
  ({ request, url }) => {
    try {
      const baseUrl = new URL(CONFIG.BASE_URL);
      return request.destination === "image" && url.origin === baseUrl.origin;
    } catch {
      return false;
    }
  },
  new CacheFirst({
    cacheName: "api-images-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ url }) =>
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.startsWith("/images/stories/"),
  new CacheFirst({
    cacheName: "story-api-images",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) => {
    try {
      const baseUrl = new URL(CONFIG.BASE_URL);
      return (
        url.origin === baseUrl.origin &&
        url.pathname.startsWith("/stories") &&
        request.method === "GET"
      );
    } catch {
      return false;
    }
  },
  async ({ event }) => {
    const cache = await caches.open("stories-api-cache");
    const cachedResponse = await cache.match(event.request);

    try {
      const networkResponse = await fetch(event.request);
      if (networkResponse.ok) {
        cache.put(event.request, networkResponse.clone());
      }
      return networkResponse;
    } catch {
      return (
        cachedResponse ||
        new Response(
          JSON.stringify({
            error: true,
            message: "Offline: Tidak dapat memuat data",
            listStory: [],
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          }
        )
      );
    }
  }
);

setDefaultHandler(new StaleWhileRevalidate());

setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    return caches.match("/index.html");
  } else if (event.request.destination === "image") {
    return caches.match("/fallback-image.png");
  }
  return Response.error();
});

self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  return self.clients.claim();
});

self.addEventListener("push", (event) => {
  console.log("Push received:", event);
  let notificationData = {
    title: "Notifikasi Baru",
    body: "Ada pesan baru untuk Anda",
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: "/icons/icon-192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow("/");
    })
  );
});
