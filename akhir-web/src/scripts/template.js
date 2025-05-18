import { showFormattedDate } from "./utils";

export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

export function generateMainNavigationListTemplate() {
  return `
    <li><a id="stories-list-button" class="stories-list-button" href="#/">Daftar Story</a></li>
    <li><a id="stories-list-button" class="stories-list-button" href="#/stories">Add Story</a></li>
    <li><a id="stories-list-button" class="stories-list-button" href="#/bookmark">Saved story</a></li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="add-story-guest-button" href="#/stories/guest">Buat Story (Guest)</a></li>
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

export function generateStoriesListEmptyTemplate() {
  return `
    <div id="stories-list-empty" class="stories-list__empty">
      <h2>Tidak ada story yang tersedia</h2>
      <p>Saat ini, tidak ada story yang dapat ditampilkan.</p>
    </div>
  `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
    <div id="stories-list-error" class="stories-list__error">
      <h2>Terjadi kesalahan pengambilan daftar story</h2>
      <p>${
        message ? message : "Gunakan jaringan lain atau laporkan error ini."
      }</p>
    </div>
  `;
}

export function generateStoryDetailErrorTemplate(message) {
  return `
    <div id="stories-detail-error" class="stories-detail__error">
      <h2>Terjadi kesalahan pengambilan detail story</h2>
      <p>${
        message ? message : "Gunakan jaringan lain atau laporkan error ini."
      }</p>
    </div>
  `;
}

export function generateStoryItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
}) {
  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
      <img class="story-item__image" src="${photoUrl}" alt="Story by ${name}">
      <div class="story-item__body">
        <div class="story-item__main">
          <h2 id="story-author" class="story-item__title">${name}</h2>
          <div class="story-item__more-info">
            <div class="story-item__createdat">
              <i class="fas fa-calendar-alt"></i> ${showFormattedDate(
                createdAt,
                "id-ID"
              )}
            </div>
            ${
              lat && lon
                ? `
            <div class="story-item__location">
              <i class="fas fa-map-marker-alt"></i> ${lat}, ${lon}
            </div>
            `
                : ""
            }
          </div>
        </div>
        <div id="story-description" class="story-item__description">
          ${description}
        </div>
        <a class="btn story-item__read-more" href="#/stories/${id}">
          Selengkapnya <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

export function generateStoryDetailTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
}) {
  const hasLocation = lat && lon;

  return `
    <div class="story-detail__header">
      <h1 id="author-name" class="story-detail__title">Story oleh ${name}</h1>

      <div class="story-detail__more-info">
        <div class="story-detail__more-info__inline">
          <div id="createdat" class="story-detail__createdat" data-value="${showFormattedDate(
            createdAt,
            "id-ID"
          )}"><i class="fas fa-calendar-alt"></i></div>
          ${
            hasLocation
              ? `
          <div id="location" class="story-detail__location" data-value="${lat}, ${lon}"><i class="fas fa-map-marker-alt"></i></div>
          `
              : ""
          }
        </div>
      </div>
    </div>

    <div class="container">
      <div class="story-detail__image__container">
        <img class="story-detail__image" src="${photoUrl}" alt="Story oleh ${name}">
      </div>
    </div>

    <div class="container">
      <div class="story-detail__body">
        <div class="story-detail__body__description__container">
          <h2 class="story-detail__description__title">Deskripsi</h2>
          <div id="description" class="story-detail__description__body">
            ${description}
          </div>
        </div>
        
        ${
          hasLocation
            ? `
        <div class="story-detail__body__map__container">
          <h2 class="story-detail__map__title">Lokasi</h2>
          <div class="story-detail__map__container">
            <div id="map" class="story-detail__map"></div>
            <div id="map-loading-container"></div>
          </div>
        </div>
        `
            : ""
        }
  
        <hr>
        <div class="stories-detail__body__actions__container">
          <h2>Aksi</h2>
          <div class="stories-detail__actions__buttons">
            <div id="save-actions-container"></div>
            <div id="notify-me-actions-container">
              <button id="stories-detail-notify-me" class="btn btn-transparent">
                Try Notify Me <i class="far fa-bell"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Pastikan tidak ada tombol di kiri bawah -->
        <div class="story-detail__body__actions__container">
          <div class="story-detail__actions__buttons">
            <a href="#/" class="btn">
              <i class="fas fa-arrow-left"></i> Kembali ke Daftar
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Berlangganan <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Berhenti Berlangganan <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateSaveStoriesButtonTemplate() {
  return `
    <button id="stories-detail-save" class="btn btn-transparent">
      Simpan laporan <i class="far fa-bookmark"></i>
    </button>
  `;
}

export function generateRemoveStoriesButtonTemplate() {
  return `
    <button id="stories-detail-remove" class="btn btn-transparent">
      Buang laporan <i class="fas fa-bookmark"></i>
    </button>
  `;
}
