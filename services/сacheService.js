// services/cacheService.js
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("app_cache.db");

class CacheService {
  async initDatabase() {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS cache (
          key TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          timestamp INTEGER NOT NULL
        );
      `);
      console.log("Cache database initialized");
    } catch (error) {
      console.error("Database init error:", error);
    }
  }

  async set(key, data) {
    try {
      const dataString = JSON.stringify(data);
      await db.runAsync(
        `INSERT OR REPLACE INTO cache (key, data, timestamp) VALUES (?, ?, ?)`,
        [key, dataString, Date.now()],
      );
      return true;
    } catch (error) {
      console.error("Error saving to cache:", error);
      return false;
    }
  }

  async get(key) {
    try {
      const result = await db.getFirstAsync(
        "SELECT * FROM cache WHERE key = ?",
        [key],
      );
      if (!result) return null;
      return {
        data: JSON.parse(result.data),
        timestamp: result.timestamp,
      };
    } catch (error) {
      console.error("Error loading from cache:", error);
      return null;
    }
  }

  async clear() {
    try {
      await db.runAsync("DELETE FROM cache");
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }
}

export default new CacheService();
