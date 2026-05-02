// services/cacheService.js
import * as SQLite from "expo-sqlite";
import { CACHE_DB_NAME, CACHE_TABLE_NAME } from "../config/StorageConfig";

const db = SQLite.openDatabaseSync(CACHE_DB_NAME);

class CacheService {
  async initDatabase() {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${CACHE_TABLE_NAME} (
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
        `INSERT OR REPLACE INTO ${CACHE_TABLE_NAME} (key, data, timestamp) VALUES (?, ?, ?)`,
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
        `SELECT * FROM ${CACHE_TABLE_NAME} WHERE key = ?`,
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
      await db.runAsync(`DELETE FROM ${CACHE_TABLE_NAME}`);
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }
}

export default new CacheService();
