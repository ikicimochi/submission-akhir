import {
  generateLoaderAbsoluteTemplate,
  generateStoryDetailErrorTemplate,
  generateStoryDetailTemplate,
  generateRemoveStoriesButtonTemplate,
  generateSaveStoriesButtonTemplate,
} from "../../templates";
import { createCarousel } from "../utils/index";
import StoryDetailPresenter from "./story-detail-presenter";
import { parseActivePathname } from "../../routes/url-parser";
import Map from "../../utils/map";
import * as API from "../../data/api";
import Database from "../../data/database";

export default class StoryDetailPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
         <section>
            <div class="story-detail__container">
              <div id="story-detail" class="story-detail"></div>
              <div id="story-detail-loading-container"></div>
            </div>
          </section>
      `;
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter(parseActivePathname().id, {
      view: this,
      model: API,
      dbmodel: Database,
    });

    await this.#presenter.showStoryDetail();
    await this.#presenter.showSaveButton();
  }

  async populateStoryDetailAndInitialMap(message, story) {
    document.getElementById("story-detail").innerHTML =
      generateStoryDetailTemplate({
        id: story.id,
        name: story.name,
        description: story.description,
        photoUrl: story.photoUrl,
        createdAt: story.createdAt,
        lat: story.lat,
        lon: story.lon,
      });

    if (story.lat && story.lon) {
      await this.#presenter.showStoryDetailMap();
      if (this.#map) {
        const storyCoordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.name };
        const popupOptions = { content: story.name };

        this.#map.changeCamera(storyCoordinate);
        this.#map.addMarker(storyCoordinate, markerOptions, popupOptions);
      }
    }
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }

  saveToBookmarkFailed(message) {
    alert(message);
  }

  removeFromBookmarkSuccessfully(message) {
    console.log(message);
  }

  removeFromBookmarkFailed(message) {
    alert(message);
  }

  renderSaveButton() {
    const saveActionsContainer = document.getElementById(
      "save-actions-container"
    );
    if (saveActionsContainer) {
      saveActionsContainer.innerHTML = generateSaveStoriesButtonTemplate();
      const saveButton = document.getElementById("stories-detail-save");
      if (saveButton) {
        saveButton.addEventListener("click", async () => {
          await this.#presenter.saveStories();
          await this.#presenter.showSaveButton();
        });
      } else {
        console.error("Tombol #stories-detail-save tidak ditemukan.");
      }
    } else {
      console.error("Elemen #save-actions-container tidak ditemukan di DOM.");
    }
  }

  renderRemoveButton() {
    const saveActionsContainer = document.getElementById(
      "save-actions-container"
    );
    if (saveActionsContainer) {
      saveActionsContainer.innerHTML = generateRemoveStoriesButtonTemplate();
      const removeButton = document.getElementById("stories-detail-remove");
      if (removeButton) {
        removeButton.addEventListener("click", async () => {
          await this.#presenter.removeStories();
          await this.#presenter.showSaveButton();
        });
      } else {
        console.error("Tombol #stories-detail-remove tidak ditemukan.");
      }
    } else {
      console.error("Elemen #save-actions-container tidak ditemukan di DOM.");
    }
  }

  populateStoryDetailError(message) {
    document.getElementById("story-detail").innerHTML =
      generateStoryDetailErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 15,
    });
  }

  showStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML = "";
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }
}
