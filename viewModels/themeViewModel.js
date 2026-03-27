import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeTheme,
  setTheme as setThemeAction,
  toggleTheme as toggleThemeAction,
} from "../redux/actions/themeActions";

const useThemeViewModel = () => {
  const dispatch = useDispatch();

  const themeState = useSelector((state) => state.theme);

  const theme = themeState?.theme || "light";
  const themeColors = themeState?.colors || {};
  const isDark = themeState?.isDark || false;
  const isLoading = themeState?.isLoading || false;
  const error = themeState?.error || null;
  const isInitialized = themeState?.isInitialized || false;

  const initializedRef = useRef(false);

  // Инициализация темы при первом запуске
  useEffect(() => {
    if (!initializedRef.current && !isInitialized) {
      initializedRef.current = true;
      console.log("Initializing theme...");
      dispatch(initializeTheme());
    }
  }, [dispatch, isInitialized]);

  // Установка темы
  const setTheme = useCallback(
    async (newTheme) => {
      if (newTheme === theme) {
        return { success: true, message: "Theme already set" };
      }

      console.log("Setting theme to:", newTheme);
      try {
        const result = await dispatch(setThemeAction(newTheme));
        return result;
      } catch (error) {
        console.error("Error setting theme:", error);
        return { success: false, error: error.message };
      }
    },
    [dispatch, theme],
  );

  // Переключение темы
  const toggleTheme = useCallback(async () => {
    console.log("Toggling theme...");
    try {
      const result = await dispatch(toggleThemeAction());
      return result;
    } catch (error) {
      console.error("Error toggling theme:", error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Получение информации о текущей теме
  const getCurrentThemeInfo = useCallback(() => {
    return {
      name: theme,
      isDark,
      colors: themeColors,
    };
  }, [theme, isDark, themeColors]);

  // Проверка, является ли тема темной
  const isDarkTheme = useCallback(() => {
    return isDark;
  }, [isDark]);

  return {
    // Данные
    theme,
    themeColors,
    isDark,
    isLoading,
    error,
    isInitialized,

    // Методы
    setTheme,
    toggleTheme,
    getCurrentThemeInfo,
    isDarkTheme,
  };
};

export default useThemeViewModel;
