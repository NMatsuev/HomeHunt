// i18n/useTranslation.js
import { useCallback } from "react";
import { useLanguage } from "./LanguageContext";
import i18n from "./i18n";

export const useTranslation = () => {
  const { locale, setLocale, updateKey } = useLanguage();

  const t = useCallback(
    (key, options = {}) => {
      return i18n.t(key, options);
    },
    [updateKey],
  ); // Зависимость от updateKey

  const availableLanguages = useCallback(() => {
    return Object.keys(i18n.translations).map((code) => ({
      code,
      name: i18n.t(`languages.${code}`),
      nativeName: i18n.t(`languages.native.${code}`),
      flag: getFlagForLocale(code),
    }));
  }, [updateKey]);

  const getFlagForLocale = (code) => {
    const flags = {
      ru: "🇷🇺",
      en: "🇬🇧",
    };
    return flags[code] || "🌐";
  };

  return {
    t,
    setLocale,
    currentLocale: locale,
    availableLanguages: availableLanguages(),
    updateKey,
  };
};
