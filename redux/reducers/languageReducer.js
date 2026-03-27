import {
  LANGUAGE_LOADING,
  LANGUAGE_LOADED,
  LANGUAGE_ERROR,
  LANGUAGE_SET,
} from "../actions/languageActions";

// ✅ Начальное состояние с дефолтными значениями
const initialState = {
  currentLocale: "ru",
  availableLanguages: [
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "en", name: "English", flag: "🇬🇧" },
  ],
  isLoading: false,
  error: null,
  isInitialized: false,
};

const languageReducer = (state = initialState, action) => {
  console.log("Language reducer action:", action.type, action.payload);

  switch (action.type) {
    case LANGUAGE_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case LANGUAGE_LOADED:
      return {
        ...state,
        currentLocale: action.payload.locale,
        availableLanguages:
          action.payload.availableLanguages || state.availableLanguages,
        isLoading: false,
        isInitialized: true,
        error: null,
      };

    case LANGUAGE_SET:
      return {
        ...state,
        currentLocale: action.payload.locale,
        availableLanguages:
          action.payload.availableLanguages || state.availableLanguages,
        isLoading: false,
        error: null,
      };

    case LANGUAGE_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default languageReducer;
