import databaseService from "../../services/databaseService";

// Action Types
export const OFFERS_LOADING = "OFFERS_LOADING";
export const OFFERS_LOADED = "OFFERS_LOADED";
export const OFFERS_ERROR = "OFFERS_ERROR";
export const OFFER_ADDED = "OFFER_ADDED";
export const OFFER_UPDATED = "OFFER_UPDATED";
export const OFFER_DELETED = "OFFER_DELETED";

// Начальные данные
const INITIAL_OFFERS_DATA = [
  {
    id: "1",
    title: "Квартира в центре",
    price: "12 500 000 ₽",
    rooms: 3,
    area: 75,
    floor: "5",
    floorCount: 12,
    address: "ул. Тверская, 15, Москва",
    description:
      "Просторная квартира с панорамными окнами, отличный вариант для семьи. Рядом метро, парк и вся необходимая инфраструктура.",
    image: require("../../assets/logo.png"),
  },
  {
    id: "2",
    title: "Студия в новостройке",
    price: "8 200 000 ₽",
    rooms: 1,
    area: 32,
    floor: "8",
    floorCount: 25,
    address: "ул. Ленина, 42, Москва",
    description:
      "Уютная студия с чистовой отделкой, подходит для инвестиций или проживания. Дом сдан, можно заезжать.",
    image: require("../../assets/logo.png"),
  },
  {
    id: "3",
    title: "Двухуровневая квартира",
    price: "18 700 000 ₽",
    rooms: 4,
    area: 120,
    floor: "14-15",
    floorCount: 15,
    address: "пр. Мира, 87, Москва",
    description:
      "Эксклюзивное предложение - двухуровневая квартира с террасой и прекрасным видом на город.",
    image: require("../../assets/logo.png"),
  },
  {
    id: "4",
    title: "Квартира у парка",
    price: "9 900 000 ₽",
    rooms: 2,
    area: 54,
    floor: "3",
    floorCount: 9,
    address: "ул. Парковая, 5, Москва",
    description:
      "Светлая квартира с выходом на парк. Хороший ремонт, встроенная кухня, кондиционер.",
    image: require("../../assets/logo.png"),
  },
  {
    id: "5",
    title: "Пентхаус с террасой",
    price: "25 000 000 ₽",
    rooms: 5,
    area: 150,
    floor: "16",
    floorCount: 16,
    address: "наб. Тараса Шевченко, 3, Москва",
    description:
      "Роскошный пентхаус с собственной террасой 50 м², панорамным остеклением и видом на Москва-Сити.",
    image: require("../../assets/logo.png"),
  },
];

export const initializeDatabase = () => async (dispatch) => {
  try {
    console.log("Initializing database...");
    dispatch({ type: OFFERS_LOADING });

    // Инициализируем таблицу
    await databaseService.initDatabase();

    // Проверяем, есть ли данные в базе
    const count = await databaseService.getOffersCount();
    console.log("Current offers count:", count);

    // Если данных нет, добавляем начальные
    if (count === 0) {
      console.log("No offers found, inserting initial data...");
      for (const offer of INITIAL_OFFERS_DATA) {
        await databaseService.addOffer(offer);
      }
      console.log("Initial offers inserted successfully");
    }

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

    // ✅ Убедитесь, что диспатчим правильный тип и данные
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
