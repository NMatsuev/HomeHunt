// i18n/LanguageContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
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

  const value = {
    locale,
    setLocale,
    updateKey,
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
