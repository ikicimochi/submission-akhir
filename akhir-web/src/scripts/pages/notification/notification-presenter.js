import {
  subscribePushNotification,
  unsubscribePushNotification,
} from "../../data/api";

const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

const NotificationPresenter = {
  async init({ subscribeBtn, unsubscribeBtn, statusEl }) {
    const token = localStorage.getItem("access_token");

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      statusEl.textContent = "Browser tidak mendukung Push Notification.";
      subscribeBtn.disabled = true;
      unsubscribeBtn.disabled = true;
      return;
    }

    subscribeBtn.addEventListener("click", async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/sw.workbox.bundle.js"
        );

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        const { endpoint, keys } = subscription.toJSON();

        const result = await subscribePushNotification({
          token,
          endpoint,
          keys,
        });

        statusEl.textContent =
          result.message || "Notifikasi berhasil diaktifkan.";
      } catch (err) {
        statusEl.textContent = `Gagal mengaktifkan notifikasi: ${err.message}`;
      }
    });

    unsubscribeBtn.addEventListener("click", async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();

          const result = await unsubscribePushNotification({
            token,
            endpoint: subscription.endpoint,
          });

          statusEl.textContent =
            result.message || "Notifikasi berhasil dinonaktifkan.";
        } else {
          statusEl.textContent =
            "Tidak ada langganan aktif untuk dinonaktifkan.";
        }
      } catch (err) {
        statusEl.textContent = `Gagal menonaktifkan notifikasi: ${err.message}`;
      }
    });
  },
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export default NotificationPresenter;
