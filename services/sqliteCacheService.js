import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("kufar_cache.db");

class SQLiteCacheService {
  async initDatabase() {
    try {
      // Создаем таблицу для кэша
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS cache (
          key TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          expires_at INTEGER
        );
        
        CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(key);
        CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at);
      `);
      console.log("Cache database initialized");
    } catch (error) {
      console.error("Database init error:", error);
    }
  }

  // Сохранение данных в кэш
  async set(key, data, ttlSeconds = 86400) {
    try {
      const timestamp = Date.now();
      const expiresAt = timestamp + ttlSeconds;
      const dataString = JSON.stringify(data);

      await db.runAsync(
        `INSERT OR REPLACE INTO cache (key, data, timestamp, expires_at) 
         VALUES (?, ?, ?, ?)`,
        [key, dataString, timestamp, expiresAt],
      );
      return true;
    } catch (error) {
      console.error("Error saving to cache:", error);
      return false;
    }
  }

  // Получение данных из кэша
  async get(key) {
    try {
      const result = await db.getFirstAsync(
        "SELECT * FROM cache WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)",
        [key, Date.now()],
      );

      if (!result) return null;

      return JSON.parse(result.data);
    } catch (error) {
      console.error("Error loading from cache:", error);
      return null;
    }
  }

  // Удаление данных из кэша
  async delete(key) {
    try {
      await db.runAsync("DELETE FROM cache WHERE key = ?", [key]);
      return true;
    } catch (error) {
      console.error("Error deleting from cache:", error);
      return false;
    }
  }

  // Очистка просроченного кэша
  async cleanExpired() {
    try {
      const result = await db.runAsync(
        "DELETE FROM cache WHERE expires_at <= ?",
        [Date.now()],
      );
      console.log(`Cleaned expired cache: ${result.changes || 0} rows`);
      return true;
    } catch (error) {
      console.error("Error cleaning expired cache:", error);
      return false;
    }
  }

  async getCacheAge(key) {
    try {
      const result = await db.getFirstAsync(
        "SELECT timestamp FROM cache WHERE key = ?",
        [key],
      );
      if (!result) return null;
      return Date.now() - result.timestamp;
    } catch (error) {
      console.error("Error getting cache age:", error);
      return null;
    }
  }

  // Проверить, нуждается ли кэш в обновлении
  async needsRefresh(key, maxAgeSeconds = 3600) {
    const age = await this.getCacheAge(key);
    if (age === null) return true; // нет кэша
    return age > maxAgeSeconds * 1000;
  }

  // Получение всей информации о кэше
  async getCacheInfo() {
    try {
      const total = await db.getFirstAsync(
        "SELECT COUNT(*) as count FROM cache",
      );
      const expired = await db.getFirstAsync(
        "SELECT COUNT(*) as count FROM cache WHERE expires_at <= ?",
        [Date.now()],
      );
      const size = await db.getFirstAsync(
        "SELECT SUM(LENGTH(data)) as size FROM cache",
      );

      return {
        totalCount: total?.count || 0,
        expiredCount: expired?.count || 0,
        totalSize: size?.size || 0,
      };
    } catch (error) {
      console.error("Error getting cache info:", error);
      return null;
    }
  }

  // Очистка всего кэша
  async clearAll() {
    try {
      await db.runAsync("DELETE FROM cache");
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }
}

export default new SQLiteCacheService();
