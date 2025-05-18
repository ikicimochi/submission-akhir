import idbService from "../../data/database";

class BookmarkPage {
  constructor() {}

  async render() {
    const bookmarks = await idbService.getAllBookmarks();

    if (bookmarks.length === 0) {
      return `
        <section id="bookmark-page" class="bookmark-container">
          <h2>Saved Stories</h2>
          <p>No saved stories yet.</p>
        </section>
      `;
    }

    return `
      <section id="bookmark-page" class="bookmark-container">
        <h2>Saved Stories</h2>
        <div class="saved-stories-grid">
          ${bookmarks
            .map(
              (story) => `
                <div class="story-card" data-id="${story.id}">
                  ${
                    story.photoUrl
                      ? `<img src="${story.photoUrl}" alt="Story Image" class="story-image" />`
                      : `<div class="story-image placeholder">No Image</div>`
                  }
                  <div class="story-content">
                    <h3 class="story-title">${story.name || "No Title"}</h3>
                    <p class="story-description">
                      ${story.description || "No Description"}
                    </p>
                    <p class="story-date">
                      <strong>Created at:</strong> ${new Date(
                        story.createdAt
                      ).toLocaleString("id-ID", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </p>
                    ${
                      story.lat && story.lon
                        ? `<p class="story-location"><strong>Location:</strong> ${story.lat}, ${story.lon}</p>`
                        : ""
                    }
                    <button class="delete-btn" data-id="${
                      story.id
                    }">Delete</button>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#addFadeInEffect();

    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        const id = event.target.getAttribute("data-id");
        await idbService.removeBookmark(id);
        alert("Bookmark deleted");
        window.location.reload();
      });
    });
  }

  #addFadeInEffect() {
    const container = document.querySelector(".bookmark-container");
    if (container) {
      container.classList.add("fade-in");
    }
  }
}

export default new BookmarkPage();
