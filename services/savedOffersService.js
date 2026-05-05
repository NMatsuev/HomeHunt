import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./firestoreWebService";
import { SAVED_OFFERS_KEY_PREFIX } from "../config/StorageConfig";

class SavedOffersService {
  constructor() {
    this.auth = auth;
  }

  // Получение текущего userId
  getCurrentUserId() {
    const user = this.auth.currentUser;
    return user ? user.uid : null;
  }

  // Получение ключа для хранения (уникальный для каждого пользователя)
  getStorageKey() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return null;
    }
    return `${SAVED_OFFERS_KEY_PREFIX}${userId}`;
  }

  // Получение всех сохраненных ID для текущего пользователя
  async getSavedIds() {
    try {
      const storageKey = this.getStorageKey();
      if (!storageKey) {
        return [];
      }

      const saved = await AsyncStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error getting saved IDs:", error);
      return [];
    }
  }

  // Проверка, сохранено ли объявление для текущего пользователя
  async isSaved(offerId) {
    const savedIds = await this.getSavedIds();
    return savedIds.includes(offerId);
  }

  // Добавление в сохраненные для текущего пользователя
  async addSaved(offerId) {
    try {
      const storageKey = this.getStorageKey();
      if (!storageKey) {
        return { success: false, error: "User not authenticated" };
      }

      const savedIds = await this.getSavedIds();

      if (!savedIds.includes(offerId)) {
        savedIds.push(offerId);
        await AsyncStorage.setItem(storageKey, JSON.stringify(savedIds));
      }

      return { success: true };
    } catch (error) {
      console.error("Error adding saved:", error);
      return { success: false, error: error.message };
    }
  }

  // Удаление из сохраненных для текущего пользователя
  async removeSaved(offerId) {
    try {
      const storageKey = this.getStorageKey();
      if (!storageKey) {
        return { success: false, error: "User not authenticated" };
      }

      const savedIds = await this.getSavedIds();
      const filtered = savedIds.filter((id) => id !== offerId);

      await AsyncStorage.setItem(storageKey, JSON.stringify(filtered));

      return { success: true };
    } catch (error) {
      console.error("Error removing saved:", error);
      return { success: false, error: error.message };
    }
  }

  // Переключение статуса сохранения для текущего пользователя
  async toggleSaved(offerId) {
    const isSavedNow = await this.isSaved(offerId);
    if (isSavedNow) {
      return await this.removeSaved(offerId);
    } else {
      return await this.addSaved(offerId);
    }
  }

  // Получение полных данных сохраненных объявлений для текущего пользователя
  async getSavedOffers(allOffers) {
    const savedIds = await this.getSavedIds();
    return allOffers.filter((offer) => savedIds.includes(offer.id));
  }

  // Миграция данных с устройства на пользователя (при первом входе)
  async migrateFromDeviceToUser() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const oldKey = `${SAVED_OFFERS_KEY_PREFIX.slice(0, -1)}`;
      const oldSaved = await AsyncStorage.getItem(oldKey);

      if (oldSaved) {
        const oldSavedIds = JSON.parse(oldSaved);
        if (oldSavedIds.length > 0 && this.getStorageKey()) {
          const storageKey = this.getStorageKey();
          const currentSaved = await this.getSavedIds();
          const mergedIds = [...new Set([...currentSaved, ...oldSavedIds])];

          await AsyncStorage.setItem(storageKey, JSON.stringify(mergedIds));
          console.log(
            `Migrated ${oldSavedIds.length} saved offers to user ${userId}`,
          );

          // Удаляем старые данные
          await AsyncStorage.removeItem(oldKey);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error migrating saved:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new SavedOffersService();
