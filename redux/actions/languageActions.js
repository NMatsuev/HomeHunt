import * as SecureStore from "expo-secure-store";
import i18n from "../../i18n/i18n";
import { LANGUAGE_STORAGE_KEY } from "../../config/StorageKeys";

// Action Types
export const LANGUAGE_LOADING = "LANGUAGE_LOADING";
export const LANGUAGE_LOADED = "LANGUAGE_LOADED";
export const LANGUAGE_ERROR = "LANGUAGE_ERROR";
export const LANGUAGE_SET = "LANGUAGE_SET";

// Получение доступных языков
const getAvailableLanguages = () => {
  try {
    // Проверяем, что i18n существует и имеет translations
    if (i18n && i18n.translations) {
      const translations = i18n.translations;
      return Object.keys(translations).map((code) => ({
        code,
        name: translations[code]?.language || code,
        flag: translations[code]?.flag || "🌐",
      }));
    }
  } catch (error) {
    console.error("Error getting available languages:", error);
  }

  // Дефолтные языки
  return [
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "en", name: "English", flag: "🇬🇧" },
  ];
};

// Инициализация языка
export const initializeLanguage = () => async (dispatch) => {
  try {
    console.log("Initializing language...");
    dispatch({ type: LANGUAGE_LOADING });

    let savedLanguage = null;

    try {
      savedLanguage = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
      console.log("Saved language from SecureStore:", savedLanguage);
    } catch (error) {
      console.error("Error reading language from SecureStore:", error);
    }

    const locale = savedLanguage || "ru";

    // Устанавливаем язык в i18n
    if (i18n) {
      i18n.locale = locale;
    }

    const availableLanguages = getAvailableLanguages();
    console.log("Available languages:", availableLanguages);

    dispatch({
      type: LANGUAGE_LOADED,
      payload: {
        locale,
        availableLanguages,
      },
    });
  } catch (error) {
    console.error("Language initialization error:", error);
    dispatch({ type: LANGUAGE_ERROR, payload: error.message });
  }
};

// Установка языка
export const setLanguage = (newLocale) => async (dispatch) => {
  try {
    console.log("Setting language to:", newLocale);

    // Меняем язык в i18n
    if (i18n) {
      i18n.locale = newLocale;
    }

    // Сохраняем в SecureStore
    await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, newLocale);

    const availableLanguages = getAvailableLanguages();

    dispatch({
      type: LANGUAGE_SET,
      payload: {
        locale: newLocale,
        availableLanguages,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error setting language:", error);
    dispatch({ type: LANGUAGE_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Функция перевода
export const t = (key, options = {}) => {
  try {
    if (i18n && typeof i18n.t === "function") {
      return i18n.t(key, options);
    }
    return key;
  } catch (error) {
    console.error(`Translation error for key "${key}":`, error);
    return key;
  }
};
