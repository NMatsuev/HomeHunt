import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import * as SecureStore from "expo-secure-store";
import i18n from "../i18n/i18n";
import { LANGUAGE_STORAGE_KEY } from "../config/StorageKeys";

const LanguageContext = createContext();

export const LanguageProvider = ({ children, initialLanguage = "ru" }) => {
  const [locale, setLocaleState] = useState(initialLanguage);
  const [updateKey, setUpdateKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    i18n.locale = locale;
    setIsInitialized(true);
  }, []);

  const saveLanguagePreference = async (newLocale) => {
    try {
      await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, newLocale);
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  const setLocale = useCallback((newLocale) => {
    i18n.locale = newLocale;
    setLocaleState(newLocale);
    setUpdateKey((prev) => prev + 1);
    saveLanguagePreference(newLocale);
  }, []);

  const availableLanguages = useCallback(() => {
    return Object.keys(i18n.translations).map((code) => ({
      code,
      name: i18n.translations[code].language,
      flag: i18n.translations[code].flag,
    }));
  }, [updateKey]);

  if (!isInitialized) {
    return null;
  }

  const value = {
    locale,
    setLocale,
    updateKey,
    availableLanguages: availableLanguages(),
    t: (key, options) => i18n.t(key, options),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
