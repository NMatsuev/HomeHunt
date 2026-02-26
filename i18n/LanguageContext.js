import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import * as SecureStore from "expo-secure-store";
import i18n from "./i18n";

const LANGUAGE_STORAGE_KEY = "app_language_preference";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(i18n.locale);
  const [updateKey, setUpdateKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage =
        await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        setLocaleState(savedLanguage);
      }
    } catch (error) {
      console.error("Error loading language preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLanguagePreference = async (newLocale) => {
    try {
      await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, newLocale);
      setLocaleState(newLocale);
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

  const value = {
    locale,
    setLocale,
    updateKey,
    isLoading,
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
