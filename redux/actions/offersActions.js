import firestoreService from "../../services/firestoreWebService";

export const OFFERS_LOADING = "OFFERS_LOADING";
export const OFFERS_LOADED = "OFFERS_LOADED";
export const OFFERS_ERROR = "OFFERS_ERROR";
export const OFFER_ADDED = "OFFER_ADDED";
export const OFFER_UPDATED = "OFFER_UPDATED";
export const OFFER_DELETED = "OFFER_DELETED";

export const initializeDatabase = () => async (dispatch) => {
  try {
    console.log("Initializing Firestore...");
    dispatch({ type: OFFERS_LOADING });

    // Инициализируем соединение с Firestore
    await firestoreService.initDatabase();

    // Загружаем все предложения
    await dispatch(loadOffers());
  } catch (error) {
    console.error("Firestore initialization error:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
  }
};

// Загрузка предложений
export const loadOffers = () => async (dispatch) => {
  try {
    console.log("Loading offers from Firestore...");
    dispatch({ type: OFFERS_LOADING });
    const offers = await firestoreService.getOffers();
    console.log("Loaded offers from Firestore:", offers.length);
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
    const result = await firestoreService.addOffer(offer);
    // Получаем добавленное предложение с реальным ID из Firestore
    const addedOffer = { ...offer, id: result.id };
    dispatch({ type: OFFER_ADDED, payload: addedOffer });
    return { success: true, id: result.id };
  } catch (error) {
    console.error("Error adding offer:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Обновление предложения
export const updateOffer = (offer) => async (dispatch) => {
  try {
    await firestoreService.updateOffer(offer);
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
    await firestoreService.deleteOffer(offerId);
    dispatch({ type: OFFER_DELETED, payload: offerId });
    return { success: true };
  } catch (error) {
    console.error("Error deleting offer:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};
