const DB_NAME = "story-app-db";
const DB_VERSION = 2;
const USER_STORE_NAME = "user-data";
const STORY_STORE_NAME = "stories";
const BOOKMARK_STORE_NAME = "bookmarks";

class IndexedDBService {
  constructor() {
    this.db = null;
    this.dbPromise = null;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
  }

  async openDB() {
    if (this.db) {
      return this.db;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.connectionAttempts++;
    console.log(`Opening IndexedDB (attempt ${this.connectionAttempts})`);

    try {
      this.dbPromise = new Promise((resolve, reject) => {
        console.log(`Opening database: ${DB_NAME}, version: ${DB_VERSION}`);

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
          console.error("Error opening IndexedDB:", event.target.error);
          reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
          console.log("IndexedDB upgrade needed, creating object stores");
          const db = event.target.result;

          if (!db.objectStoreNames.contains(USER_STORE_NAME)) {
            db.createObjectStore(USER_STORE_NAME, { keyPath: "key" });
            console.log(`Created object store: ${USER_STORE_NAME}`);
          }

          if (!db.objectStoreNames.contains(STORY_STORE_NAME)) {
            db.createObjectStore(STORY_STORE_NAME, { keyPath: "id" });
            console.log(`Created object store: ${STORY_STORE_NAME}`);
          }

          if (!db.objectStoreNames.contains(BOOKMARK_STORE_NAME)) {
            db.createObjectStore(BOOKMARK_STORE_NAME, { keyPath: "id" });
            console.log(`Created object store: ${BOOKMARK_STORE_NAME}`);
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          console.log("IndexedDB opened successfully");

          console.log(
            "Available object stores:",
            Array.from(this.db.objectStoreNames)
          );

          resolve(this.db);
        };
      });

      return await this.dbPromise;
    } catch (error) {
      console.error("Error opening IndexedDB:", error);
      this.dbPromise = null;

      if (this.connectionAttempts < this.maxConnectionAttempts) {
        console.log(
          `Retrying IndexedDB connection (${this.connectionAttempts}/${this.maxConnectionAttempts})`
        );
        return this.openDB();
      }

      return null;
    }
  }

  async saveStories(stories) {
    try {
      const db = await this.openDB();
      if (!db) return false;

      const tx = db.transaction(STORY_STORE_NAME, "readwrite");
      const store = tx.objectStore(STORY_STORE_NAME);

      for (const story of stories) {
        await store.put(story);
      }

      await tx.done;
      console.log(`${stories.length} cerita berhasil disimpan ke IndexedDB`);
      return true;
    } catch (error) {
      console.error("Error in saveStories:", error);
      return false;
    }
  }

  async getAllStories() {
    try {
      const db = await this.openDB();
      if (!db) {
        console.warn("IndexedDB not available for getAllStories");
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORY_STORE_NAME, "readonly");
        const store = transaction.objectStore(STORY_STORE_NAME);
        const request = store.getAll();

        request.onerror = (event) => {
          console.error("Error getting all stories:", event.target.error);
          reject(event.target.error);
        };

        request.onsuccess = (event) => {
          const stories = event.target.result;
          console.log(
            `${stories.length} cerita berhasil diambil dari IndexedDB`
          );
          resolve(stories);
        };
      });
    } catch (error) {
      console.error("Error in getAllStories:", error);
      return [];
    }
  }

  async getStoryById(id) {
    try {
      const db = await this.openDB();
      if (!db) {
        console.warn("IndexedDB not available for getStoryById");
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORY_STORE_NAME, "readonly");
        const store = transaction.objectStore(STORY_STORE_NAME);
        const request = store.get(id);

        request.onerror = (event) => {
          console.error(
            `Error getting story with ID ${id}:`,
            event.target.error
          );
          reject(event.target.error);
        };

        request.onsuccess = (event) => {
          const story = event.target.result;
          if (story) {
            console.log(`Story with ID ${id} retrieved successfully`);
          } else {
            console.log(`No story found with ID ${id}`);
          }
          resolve(story);
        };
      });
    } catch (error) {
      console.error("Error in getStoryById:", error);
      return null;
    }
  }

  async deleteStory(id) {
    try {
      const db = await this.openDB();
      if (!db) return false;

      await db.delete(STORY_STORE_NAME, id);
      console.log(`Cerita dengan ID ${id} berhasil dihapus dari IndexedDB`);
      return true;
    } catch (error) {
      console.error("Error in deleteStory:", error);
      return false;
    }
  }

  async saveUserData(key, data) {
    if (!key) {
      console.error("Key is required for saveUserData");
      return false;
    }

    try {
      localStorage.setItem(`idb_fallback_${key}`, JSON.stringify(data));
      console.log(`Data saved to localStorage with key: idb_fallback_${key}`);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }

    try {
      const db = await this.openDB();
      if (!db) {
        console.warn("IndexedDB not available, using localStorage fallback");
        return true;
      }

      console.log(
        `Attempting to save data with key ${key} to IndexedDB:`,
        data
      );

      const tx = db.transaction(USER_STORE_NAME, "readwrite");
      const store = tx.objectStore(USER_STORE_NAME);

      console.log(`Using object store: ${store.name}`);

      const request = store.put({ key, data });

      request.onerror = (event) => {
        console.error(`Error saving data with key ${key}:`, event.target.error);
      };

      request.onsuccess = (event) => {
        console.log(
          `Data with key ${key} saved successfully, result:`,
          event.target.result
        );
      };

      await tx.done;

      console.log(
        `Data pengguna dengan key ${key} berhasil disimpan ke IndexedDB`
      );
      return true;
    } catch (error) {
      console.error(`Error in saveUserData for key ${key}:`, error);
      return true;
    }
  }

  async getUserData(key) {
    if (!key) {
      console.error("Key is required for getUserData");
      return null;
    }

    try {
      const localData = localStorage.getItem(`idb_fallback_${key}`);
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (error) {
      console.error("Error getting from localStorage:", error);
    }

    try {
      const db = await this.openDB();
      if (!db) {
        console.warn(
          "IndexedDB not available, using localStorage fallback only"
        );
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(USER_STORE_NAME, "readonly");
        const store = transaction.objectStore(USER_STORE_NAME);
        const request = store.get(key);

        request.onerror = (event) => {
          console.error(
            `Error getting data with key ${key}:`,
            event.target.error
          );
          reject(event.target.error);
        };

        request.onsuccess = (event) => {
          const result = event.target.result;
          if (result) {
            console.log(`Data with key ${key} retrieved successfully:`, result);
            resolve(result.data);
          } else {
            console.log(`No data found with key ${key}`);
            resolve(null);
          }
        };
      });
    } catch (error) {
      console.error("Error in getUserData:", error);
      return null;
    }
  }

  async clearAllData() {
    try {
      const db = await this.openDB();
      if (!db) return false;

      await db.clear(STORY_STORE_NAME);
      console.log("Semua cerita berhasil dihapus dari IndexedDB");

      await db.clear(USER_STORE_NAME);
      console.log("Semua data pengguna berhasil dihapus dari IndexedDB");

      return true;
    } catch (error) {
      console.error("Error in clearAllData:", error);
      return false;
    }
  }

  resetConnection() {
    this.db = null;
    this.dbPromise = null;
    this.connectionAttempts = 0;
    console.log("IndexedDB connection reset");

    setTimeout(() => this.testIndexedDB(), 500);
  }

  async testIndexedDB() {
    try {
      console.log("Testing IndexedDB functionality...");

      const testKey = "idb_test";
      const testData = { test: "data", timestamp: Date.now() };

      await this.saveUserData(testKey, testData);

      const retrievedData = await this.getUserData(testKey);

      if (retrievedData && retrievedData.test === "data") {
        console.log("IndexedDB test successful:", retrievedData);
        return true;
      } else {
        console.error("IndexedDB test failed - data mismatch:", retrievedData);
        return false;
      }
    } catch (error) {
      console.error("IndexedDB test failed with error:", error);
      return false;
    }
  }

  async getAllBookmarks() {
    try {
      const db = await this.openDB();
      if (!db) {
        console.warn("IndexedDB not available for getAllBookmarks");
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(BOOKMARK_STORE_NAME, "readonly");
        const store = transaction.objectStore(BOOKMARK_STORE_NAME);
        const request = store.getAll();

        request.onerror = (event) => {
          console.error("Error getting all bookmarks:", event.target.error);
          reject(event.target.error);
        };

        request.onsuccess = (event) => {
          const bookmarks = event.target.result;
          console.log(
            `${bookmarks.length} bookmark berhasil diambil dari IndexedDB`
          );
          resolve(bookmarks);
        };
      });
    } catch (error) {
      console.error("Error in getAllBookmarks:", error);
      return [];
    }
  }

  async getBookmarkById(storyId) {
    try {
      const db = await this.openDB();
      if (!db) return null;

      if (!db.objectStoreNames.contains(BOOKMARK_STORE_NAME)) {
        return null;
      }

      const tx = db.transaction(BOOKMARK_STORE_NAME, "readonly");
      const store = tx.objectStore(BOOKMARK_STORE_NAME);

      return await store.get(storyId);
    } catch (error) {
      console.error("Error getting bookmark by ID:", error);
      return null;
    }
  }

  async saveBookmark(story) {
    try {
      const db = await this.openDB();
      if (!db) throw new Error("Database not available");

      if (!db.objectStoreNames.contains(BOOKMARK_STORE_NAME)) {
        console.warn(
          `Object store ${BOOKMARK_STORE_NAME} tidak ditemukan. Mencoba upgrade database...`
        );

        db.close();

        this.db = null;
        this.dbPromise = null;

        await this.ensureDatabaseStructure();

        return this.saveBookmark(story);
      }

      const tx = db.transaction(BOOKMARK_STORE_NAME, "readwrite");
      const store = tx.objectStore(BOOKMARK_STORE_NAME);

      if (!story.id) {
        console.error("Story object does not have an ID:", story);
        return false;
      }

      await store.put(story);
      console.log(`Bookmark untuk cerita ${story.id} berhasil disimpan`);
      return true;
    } catch (error) {
      console.error("Error saving bookmark:", error);
      return false;
    }
  }

  async removeBookmark(storyId) {
    try {
      const db = await this.openDB();
      if (!db) throw new Error("Database not available");

      if (!db.objectStoreNames.contains(BOOKMARK_STORE_NAME)) {
        console.error(`Object store ${BOOKMARK_STORE_NAME} tidak ditemukan.`);
        return false;
      }

      const tx = db.transaction(BOOKMARK_STORE_NAME, "readwrite");
      const store = tx.objectStore(BOOKMARK_STORE_NAME);

      await store.delete(storyId);
      console.log(`Bookmark untuk cerita ${storyId} berhasil dihapus`);
      return true;
    } catch (error) {
      console.error("Error removing bookmark:", error);
      return false;
    }
  }

  async getBookmarkCount() {
    try {
      const bookmarks = await this.getAllBookmarks();
      return bookmarks.length;
    } catch (error) {
      console.error("Error getting bookmark count:", error);
      return 0;
    }
  }

  async isBookmarked(storyId) {
    try {
      const db = await this.openDB();
      if (!db) return false;

      const tx = db.transaction(BOOKMARK_STORE_NAME, "readonly");
      const store = tx.objectStore(BOOKMARK_STORE_NAME);

      const bookmark = await store.get(storyId);
      return !!bookmark;
    } catch (error) {
      console.error("Error in isBookmarked:", error);
      return false;
    }
  }

  async ensureDatabaseStructure() {
    try {
      const db = await openDB(DB_NAME, DB_VERSION + 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
          console.log(
            `Upgrading database from version ${oldVersion} to ${newVersion}`
          );

          if (!db.objectStoreNames.contains(STORY_STORE_NAME)) {
            db.createObjectStore(STORY_STORE_NAME, { keyPath: "id" });
            console.log(`Object store ${STORY_STORE_NAME} created`);
          }

          if (!db.objectStoreNames.contains(BOOKMARK_STORE_NAME)) {
            db.createObjectStore(BOOKMARK_STORE_NAME, { keyPath: "id" });
            console.log(`Object store ${BOOKMARK_STORE_NAME} created`);
          }
        },
      });

      DB_VERSION = db.version;
      console.log(`Database structure ensured, current version: ${DB_VERSION}`);

      db.close();

      return true;
    } catch (error) {
      console.error("Error ensuring database structure:", error);
      return false;
    }
  }
}

const idbService = new IndexedDBService();
export default idbService;
