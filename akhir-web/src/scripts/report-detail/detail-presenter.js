import idbService from "../../data/database";

class DetailPresenter {
  async init({ container, id }) {
    try {
      const story = await idbService.getStoryById(id);
      if (!story) {
        container.innerHTML = `<p>Cerita tidak ditemukan di database offline.</p>`;
        return;
      }

      container.innerHTML = `
        <h2>${story.name}</h2>
        <img src="${story.photoUrl}" alt="${story.name}" class="story-image" />
        <p class="story-description">${story.description}</p>
        <button id="bookmark-btn" class="btn-bookmark">Loading...</button>
      `;

      await this.renderBookmarkButton(id, story);
      return story;
    } catch (error) {
      container.innerHTML = `<p>Gagal memuat detail: ${error.message}</p>`;
    }
  }

  async renderBookmarkButton(id, story) {
    const isBookmarked = await idbService.isBookmarked(id);
    const bookmarkBtn = document.getElementById("bookmark-btn");

    if (!bookmarkBtn) return;

    bookmarkBtn.textContent = isBookmarked
      ? "Hapus Bookmark"
      : "Simpan Bookmark";

    bookmarkBtn.onclick = async () => {
      if (isBookmarked) {
        await idbService.removeBookmark(id);
      } else {
        await idbService.saveBookmark(story);
      }
      await this.renderBookmarkButton(id, story);
    };
  }
}

export default new DetailPresenter();
