import * as SQLite from "expo-sqlite";

class DatabaseService {
  constructor() {
    this.db = SQLite.openDatabaseSync("offers.db");
  }

  async initDatabase() {
    try {
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS offers (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          price TEXT NOT NULL,
          rooms INTEGER,
          area REAL,
          floor TEXT,
          floorCount INTEGER,
          address TEXT NOT NULL,
          description TEXT,
          image TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );
      `);
      console.log("Database table created/verified");
    } catch (error) {
      console.error("Database init error:", error);
      throw error;
    }
  }

  async getOffers() {
    try {
      const result = await this.db.getAllAsync(
        "SELECT * FROM offers ORDER BY created_at DESC",
      );
      console.log(`Loaded ${result.length} offers from database`);
      return result;
    } catch (error) {
      console.error("Error loading offers:", error);
      return [];
    }
  }

  async addOffer(offer) {
    try {
      // ✅ Исправляем количество параметров (было 10, а нужно 12)
      await this.db.runAsync(
        `INSERT INTO offers (
          id, title, price, rooms, area, floor, 
          floorCount, address, description, image, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          offer.id,
          offer.title,
          offer.price,
          offer.rooms,
          offer.area,
          offer.floor,
          offer.floorCount,
          offer.address,
          offer.description,
          offer.image,
          Date.now(),
          Date.now(),
        ],
      );
      console.log("Offer added:", offer.id);
      return { success: true };
    } catch (error) {
      console.error("Error adding offer:", error);
      throw error;
    }
  }

  async updateOffer(offer) {
    try {
      await this.db.runAsync(
        `UPDATE offers 
         SET title = ?, price = ?, rooms = ?, area = ?, floor = ?, 
             floorCount = ?, address = ?, description = ?, image = ?, updated_at = ?
         WHERE id = ?`,
        [
          offer.title,
          offer.price,
          offer.rooms,
          offer.area,
          offer.floor,
          offer.floorCount,
          offer.address,
          offer.description,
          offer.image,
          Date.now(),
          offer.id,
        ],
      );
      console.log("Offer updated:", offer.id);
      return { success: true };
    } catch (error) {
      console.error("Error updating offer:", error);
      throw error;
    }
  }

  async deleteOffer(offerId) {
    try {
      await this.db.runAsync("DELETE FROM offers WHERE id = ?", [offerId]);
      console.log("Offer deleted:", offerId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting offer:", error);
      throw error;
    }
  }

  async getOfferById(offerId) {
    try {
      const result = await this.db.getFirstAsync(
        "SELECT * FROM offers WHERE id = ?",
        [offerId],
      );
      return result;
    } catch (error) {
      console.error("Error getting offer by id:", error);
      throw error;
    }
  }

  async getOffersCount() {
    try {
      const result = await this.db.getFirstAsync(
        "SELECT COUNT(*) as count FROM offers",
      );
      console.log("Total offers count:", result.count);
      return result.count;
    } catch (error) {
      console.error("Error getting offers count:", error);
      return 0;
    }
  }
}

export default new DatabaseService();
