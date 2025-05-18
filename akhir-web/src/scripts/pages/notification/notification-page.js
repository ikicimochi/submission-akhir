import NotificationPresenter from "./notification-presenter";

const NotificationPage = {
  async render() {
    return `
      <section class="notification-page container">
        <h2>Kelola Notifikasi</h2>
        <p>Aktifkan notifikasi untuk mendapatkan update story terbaru.</p>
        <div class="notification-actions">
          <button id="subscribeButton">Aktifkan Notifikasi</button>
          <button id="unsubscribeButton">Nonaktifkan Notifikasi</button>
        </div>
        <p id="notificationStatus" class="status-message"></p>
      </section>
    `;
  },

  async afterRender() {
    const container = document.querySelector(".notification-page");
    if (container) {
      container.classList.add("fade-in");
    }

    const subscribeBtn = document.getElementById("subscribeButton");
    const unsubscribeBtn = document.getElementById("unsubscribeButton");
    const statusEl = document.getElementById("notificationStatus");

    NotificationPresenter.init({
      subscribeBtn,
      unsubscribeBtn,
      statusEl,
    });
  },
};

export default NotificationPage;
