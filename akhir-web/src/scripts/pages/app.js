import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { getAccessToken } from "../utils/auth";
import {
  subscribe,
  unsubscribe,
  isNotificationGranted,
  requestNotificationPermission,
} from "../utils/notification-helper";
import { getAllStories } from "../data/api";
import NotFoundPage from "./not-found-page";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #notificationButton = null;
  #lastStoryIds = new Set();

  constructor({ navigationDrawer, drawerButton, content, notificationButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#notificationButton = notificationButton;

    this._setupDrawer();
    this._setupNotificationButton();
    this._startPollingNewStories();
  }

  _setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) return;

    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      const navDrawer = this.#navigationDrawer;
      const drawerBtn = this.#drawerButton;

      if (
        navDrawer &&
        drawerBtn &&
        !navDrawer.contains(event.target) &&
        !drawerBtn.contains(event.target)
      ) {
        navDrawer.classList.remove("open");
      }

      if (navDrawer) {
        navDrawer.querySelectorAll("a").forEach((link) => {
          if (link.contains(event.target)) {
            navDrawer.classList.remove("open");
          }
        });
      }
    });
  }

  _setupNotificationButton() {
    if (!this.#notificationButton) return;

    const updateButtonLabel = () => {
      this.#notificationButton.textContent = isNotificationGranted()
        ? "Nonaktifkan Notifikasi"
        : "Aktifkan Notifikasi";
    };

    updateButtonLabel();

    this.#notificationButton.addEventListener("click", async () => {
      this.#notificationButton.disabled = true;

      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        alert("Izin notifikasi diperlukan.");
        this.#notificationButton.disabled = false;
        return;
      }

      if (isNotificationGranted()) {
        await unsubscribe();
      } else {
        await subscribe();
      }

      updateButtonLabel();
      this.#notificationButton.disabled = false;
    });
  }

  async _initLastStoryIds() {
    const token = getAccessToken();
    if (!token) return;

    try {
      const data = await getAllStories({ token, page: 1, size: 5 });
      if (data.error || !data.listStory) return;
      this.#lastStoryIds = new Set(data.listStory.map((story) => story.id));
    } catch (error) {
      console.error("Error initializing lastStoryIds:", error);
    }
  }

  async _checkNewStories() {
    const token = getAccessToken();
    if (!token) return;

    try {
      const data = await getAllStories({ token, page: 1, size: 5 });
      if (data.error || !data.listStory) return;

      const newStories = data.listStory.filter(
        (story) => !this.#lastStoryIds.has(story.id)
      );

      if (newStories.length > 0 && Notification.permission === "granted") {
        const registration = await navigator.serviceWorker.ready;

        newStories.forEach((story) => {
          const title =
            story.title ||
            story.judul ||
            story.name ||
            (story.attributes && story.attributes.title) ||
            "Cerita Baru";

          registration.showNotification("Cerita Baru!", {
            body: `Judul: ${title}`,
            icon: "/icons/icon-192.png",
            data: { url: `/stories/${story.id}` },
          });
        });
      }

      newStories.forEach((story) => this.#lastStoryIds.add(story.id));
    } catch (error) {
      console.error("Error checking new stories:", error);
    }
  }

  _startPollingNewStories() {
    this._initLastStoryIds().then(() => {
      setInterval(() => this._checkNewStories(), 60000);
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const isLogin = !!getAccessToken();

    let pageLoader = routes[url];
    let page = typeof pageLoader === "function" ? pageLoader() : pageLoader;

    if (!page) {
      page = new NotFoundPage();
    }

    const navbar = document.getElementById("navbar");
    if (navbar) {
      navbar.style.display = isLogin ? "block" : "none";
    }

    this.#content.innerHTML = await page.render();

    if (page.afterRender && typeof page.afterRender === "function") {
      await page.afterRender();
    }
  }
}

export default App;
