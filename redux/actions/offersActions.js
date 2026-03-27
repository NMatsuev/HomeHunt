import databaseService from "../../services/databaseService";

export const OFFERS_LOADING = "OFFERS_LOADING";
export const OFFERS_LOADED = "OFFERS_LOADED";
export const OFFERS_ERROR = "OFFERS_ERROR";
export const OFFER_ADDED = "OFFER_ADDED";
export const OFFER_UPDATED = "OFFER_UPDATED";
export const OFFER_DELETED = "OFFER_DELETED";

const INITIAL_OFFERS_DATA = [];

export const initializeDatabase = () => async (dispatch) => {
  try {
    console.log("Initializing database...");
    dispatch({ type: OFFERS_LOADING });

    // Инициализируем таблицу
    await databaseService.initDatabase();

    // Проверяем, есть ли данные в базе
    const count = await databaseService.getOffersCount();

    // Загружаем все предложения
    await dispatch(loadOffers());
  } catch (error) {
    console.error("Database initialization error:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
  }
};

// Загрузка предложений
export const loadOffers = () => async (dispatch) => {
  try {
    console.log("Loading offers...");
    dispatch({ type: OFFERS_LOADING });
    const offers = await databaseService.getOffers();
    console.log("Loaded offers from DB:", offers.length);
    console.log("First offer:", offers[0]?.title);

    dispatch({ type: OFFERS_LOADED, payload: offers });
    console.log("Dispatched OFFERS_LOADED with", offers.length, "offers");
  } catch (error) {
    console.error("Error loading offers:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
  }
};

// Добавление предложения
export const addOffer = (offer) => async (dispatch) => {
  try {
    await databaseService.addOffer(offer);
    dispatch({ type: OFFER_ADDED, payload: offer });
    return { success: true };
  } catch (error) {
    console.error("Error adding offer:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Обновление предложения
export const updateOffer = (offer) => async (dispatch) => {
  try {
    await databaseService.updateOffer(offer);
    dispatch({ type: OFFER_UPDATED, payload: offer });
    return { success: true };
  } catch (error) {
    console.error("Error updating offer:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Удаление предложения
export const deleteOffer = (offerId) => async (dispatch) => {
  try {
    await databaseService.deleteOffer(offerId);
    dispatch({ type: OFFER_DELETED, payload: offerId });
    return { success: true };
  } catch (error) {
    console.error("Error deleting offer:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};
