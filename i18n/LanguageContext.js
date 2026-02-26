import { createContext, useContext, useState, useCallback } from "react";
import i18n from "./i18n";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(i18n.locale);
  const [updateKey, setUpdateKey] = useState(0);

  const setLocale = useCallback((newLocale) => {
    i18n.locale = newLocale;
    setLocaleState(newLocale);
    setUpdateKey((prev) => prev + 1);
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
