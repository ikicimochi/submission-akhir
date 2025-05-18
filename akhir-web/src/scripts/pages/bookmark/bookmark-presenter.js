import idbService from "../../data/database";

const BookmarkPresenter = {
  async init({ container }) {
    try {
      const bookmarks = await idbService.getAllBookmarks();

      if (bookmarks.length === 0) {
        container.innerHTML = `<p>Tidak ada cerita yang di-bookmark.</p>`;
        return;
      }

      container.innerHTML = bookmarks
        .map(
          (story) => `
          <div class="bookmark-card" data-id="${story.id}">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <a href="#/reports/${story.id}" class="btn-detail">Lihat Detail</a>
            <button class="btn-save">Save Story</button>
            <button class="btn-remove">Hapus</button>
          </div>
        `
        )
        .join("");

      container.querySelectorAll(".btn-save").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const storyCard = event.target.closest(".bookmark-card");
          const id = storyCard.getAttribute("data-id");

          const story = bookmarks.find((s) => s.id === id);

          if (story) {
            const success = await idbService.saveBookmark(story);
            if (success) {
              alert("Story saved for offline use!");
            } else {
              alert("Failed to save story.");
            }
          } else {
            alert("Story not found.");
          }
        });
      });

      container.querySelectorAll(".btn-remove").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const storyCard = event.target.closest(".bookmark-card");
          const id = storyCard.getAttribute("data-id");

          await idbService.removeBookmark(id);

          this.init({ container });
        });
      });
    } catch (error) {
      container.innerHTML = `<p>Gagal memuat bookmark: ${error.message}</p>`;
    }
  },
};

export default BookmarkPresenter;
