import firestoreService from "../../services/firestoreWebService";

export const OFFERS_LOADING = "OFFERS_LOADING";
export const OFFERS_LOADED = "OFFERS_LOADED";
export const OFFERS_ERROR = "OFFERS_ERROR";
export const OFFER_ADDED = "OFFER_ADDED";
export const OFFER_UPDATED = "OFFER_UPDATED";
export const OFFER_DELETED = "OFFER_DELETED";
export const OFFERS_REALTIME_UPDATE = "OFFERS_REALTIME_UPDATE";
export const OFFERS_SUBSCRIBE = "OFFERS_SUBSCRIBE";
export const OFFERS_UNSUBSCRIBE = "OFFERS_UNSUBSCRIBE";

// Переменная для хранения функции отписки
let unsubscribeFromOffers = null;

// Подписка на обновления в реальном времени
export const subscribeToOffers = () => async (dispatch) => {
  try {
    console.log("Subscribing to real-time updates...");

    // Если уже есть подписка, отписываемся
    if (unsubscribeFromOffers) {
      unsubscribeFromOffers();
      unsubscribeFromOffers = null;
    }

    // Создаем новую подписку
    unsubscribeFromOffers = firestoreService.subscribeToOffers(
      (offers) => {
        // При получении обновлений отправляем в Redux
        dispatch({
          type: OFFERS_REALTIME_UPDATE,
          payload: offers,
        });
        console.log("Real-time update received:", offers.length, "offers");
      },
      (error) => {
        console.error("Subscription error:", error);
        dispatch({ type: OFFERS_ERROR, payload: error.message });
      },
    );

    dispatch({ type: OFFERS_SUBSCRIBE });
    return { success: true };
  } catch (error) {
    console.error("Error subscribing to offers:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Отписка от обновлений
export const unsubscribeFromOffersRealTime = () => async (dispatch) => {
  try {
    if (unsubscribeFromOffers) {
      unsubscribeFromOffers();
      unsubscribeFromOffers = null;
      console.log("Unsubscribed from real-time updates");
    }
    dispatch({ type: OFFERS_UNSUBSCRIBE });
    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return { success: false, error: error.message };
  }
};

// Загрузка объявлений (для начальной загрузки)
export const loadOffers = () => async (dispatch) => {
  try {
    console.log("Loading offers...");
    dispatch({ type: OFFERS_LOADING });
    const offers = await firestoreService.getOffers();
    dispatch({ type: OFFERS_LOADED, payload: offers });
    return { success: true, offers };
  } catch (error) {
    console.error("Error loading offers:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Добавление объявления (с автоматическим обновлением через подписку)
export const addOffer = (offer) => async (dispatch) => {
  try {
    const result = await firestoreService.addOffer(offer);
    if (result.success) {
      // Не нужно обновлять Redux вручную - подписка сделает это автоматически
      console.log("Offer added, waiting for real-time update...");
    }
    return result;
  } catch (error) {
    console.error("Error adding offer:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Обновление объявления
export const updateOffer = (offer) => async (dispatch) => {
  try {
    const result = await firestoreService.updateOffer(offer);
    if (result.success) {
      console.log("Offer updated, waiting for real-time update...");
    }
    return result;
  } catch (error) {
    console.error("Error updating offer:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Удаление объявления
export const deleteOffer = (offerId) => async (dispatch) => {
  try {
    const result = await firestoreService.deleteOffer(offerId);
    if (result.success) {
      console.log("Offer deleted, waiting for real-time update...");
    }
    return result;
  } catch (error) {
    console.error("Error deleting offer:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Инициализация базы данных с подпиской
export const initializeDatabase = () => async (dispatch) => {
  try {
    console.log("Initializing database...");
    dispatch({ type: OFFERS_LOADING });

    // Инициализируем таблицу/коллекцию
    await firestoreService.initDatabase();

    // Загружаем начальные данные
    await dispatch(loadOffers());

    // Подписываемся на обновления в реальном времени
    await dispatch(subscribeToOffers());

    console.log("Database initialized with real-time updates");
  } catch (error) {
    console.error("Database initialization error:", error);
    dispatch({ type: OFFERS_ERROR, payload: error.message });
  }
};
