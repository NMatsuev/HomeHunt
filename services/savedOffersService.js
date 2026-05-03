import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_OFFERS_KEY = "saved_offers";

class SavedOffersService {
  // Получение всех сохраненных ID
  async getSavedIds() {
    try {
      const saved = await AsyncStorage.getItem(SAVED_OFFERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error getting saved IDs:", error);
      return [];
    }
  }

  // Проверка, сохранено ли объявление
  async isSaved(offerId) {
    const savedIds = await this.getSavedIds();
    return savedIds.includes(offerId);
  }

  // Добавление в сохраненные
  async addSaved(offerId) {
    try {
      const savedIds = await this.getSavedIds();
      if (!savedIds.includes(offerId)) {
        savedIds.push(offerId);
        await AsyncStorage.setItem(SAVED_OFFERS_KEY, JSON.stringify(savedIds));
      }
      return { success: true };
    } catch (error) {
      console.error("Error adding saved:", error);
      return { success: false, error: error.message };
    }
  }

  // Удаление из сохраненных
  async removeSaved(offerId) {
    try {
      const savedIds = await this.getSavedIds();
      const filtered = savedIds.filter((id) => id !== offerId);
      await AsyncStorage.setItem(SAVED_OFFERS_KEY, JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      console.error("Error removing saved:", error);
      return { success: false, error: error.message };
    }
  }

  // Переключение статуса сохранения
  async toggleSaved(offerId) {
    const isSavedNow = await this.isSaved(offerId);
    if (isSavedNow) {
      return await this.removeSaved(offerId);
    } else {
      return await this.addSaved(offerId);
    }
  }

  // Получение полных данных сохраненных объявлений
  async getSavedOffers(allOffers) {
    const savedIds = await this.getSavedIds();
    return allOffers.filter((offer) => savedIds.includes(offer.id));
  }
}

export default new SavedOffersService();
