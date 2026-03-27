import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeLanguage,
  setLanguage as setLanguageAction,
} from "../redux/actions/languageActions";
import i18n from "../i18n/i18n";

const useLanguageViewModel = () => {
  const dispatch = useDispatch();
  const languageState = useSelector((state) => state.language);

  const currentLocale = languageState?.currentLocale || "ru";
  const availableLanguages = languageState?.availableLanguages || [
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "en", name: "English", flag: "🇬🇧" },
  ];
  const isLoading = languageState?.isLoading || false;
  const error = languageState?.error || null;
  const isInitialized = languageState?.isInitialized || false;

  // ✅ Используем ref для предотвращения бесконечного цикла
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && !isInitialized) {
      initializedRef.current = true;
      console.log("Initializing language...");
      dispatch(initializeLanguage());
    }
  }, [dispatch, isInitialized]);

  // ✅ t функция без зависимости от currentLocale
  const t = useCallback((key, options = {}) => {
    try {
      if (i18n && typeof i18n.t === "function") {
        return i18n.t(key, options);
      }
      return key;
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return key;
    }
  }, []); // Пустой массив

  const setLocale = useCallback(
    async (newLocale) => {
      if (newLocale === currentLocale) {
        return { success: true, message: "Language already set" };
      }

      console.log("Setting language to:", newLocale);
      try {
        const result = await dispatch(setLanguageAction(newLocale));
        return result;
      } catch (error) {
        console.error("Error setting language:", error);
        return { success: false, error: error.message };
      }
    },
    [dispatch, currentLocale],
  );

  const getCurrentLanguageInfo = useCallback(() => {
    const currentLang = availableLanguages.find(
      (lang) => lang.code === currentLocale,
    );
    return (
      currentLang || { code: currentLocale, name: currentLocale, flag: "🌐" }
    );
  }, [currentLocale, availableLanguages]);

  const isLanguageSupported = useCallback(
    (languageCode) => {
      return availableLanguages.some((lang) => lang.code === languageCode);
    },
    [availableLanguages],
  );

  const toggleLanguage = useCallback(async () => {
    if (availableLanguages.length >= 2) {
      const nextLanguage = availableLanguages.find(
        (lang) => lang.code !== currentLocale,
      );
      if (nextLanguage) {
        return await setLocale(nextLanguage.code);
      }
    }
    return { success: false, error: "No alternative language available" };
  }, [availableLanguages, currentLocale, setLocale]);

  return {
    locale: currentLocale,
    currentLocale,
    availableLanguages,
    isLoading,
    error,
    isInitialized,
    t,
    setLocale,
    toggleLanguage,
    getCurrentLanguageInfo,
    isLanguageSupported,
  };
};

export default useLanguageViewModel;
