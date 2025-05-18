export function showFormattedDate(date, locale = "en-US", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function isServiceWorkerAvailable() {
  return "serviceWorker" in navigator;
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker API tidak didukung di browser ini.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/sw.workbox.bundle.js",
      { type: "module" }
    );

    console.log("Service Worker terdaftar dengan scope:", registration.scope);
  } catch (error) {
    console.error("Gagal mendaftar Service Worker:", error);
  }
}

// --- Fungsi tambahan untuk Web Push Notification ---
export function convertBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// --- Fungsi carousel ---
export async function createCarousel(containerElement, options = {}) {
  const { tns } = await import("tiny-slider");

  return tns({
    container: containerElement,
    mouseDrag: true,
    swipeAngle: false,
    speed: 600,

    nav: true,
    navPosition: "bottom",

    autoplay: false,
    controls: false,

    ...options,
  });
}
