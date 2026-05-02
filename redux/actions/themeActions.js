import * as SecureStore from "expo-secure-store";
import { THEME_STORAGE_KEY } from "../../config/StorageConfig";
import { lightTheme, darkTheme } from "../../utils/themes";

export const THEME_LOADING = "THEME_LOADING";
export const THEME_LOADED = "THEME_LOADED";
export const THEME_ERROR = "THEME_ERROR";
export const THEME_SET = "THEME_SET";

export const initializeTheme = () => async (dispatch) => {
  try {
    dispatch({ type: THEME_LOADING });

    let savedTheme = null;

    try {
      savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      console.log("Saved theme from SecureStore:", savedTheme);
    } catch (error) {
      console.error("Error reading theme from SecureStore:", error);
    }

    const themeName = savedTheme || "light";
    const themeData = themeName === "dark" ? darkTheme : lightTheme;

    dispatch({
      type: THEME_LOADED,
      payload: {
        theme: themeName,
        colors: themeData.colors,
        isDark: themeData.dark,
      },
    });
  } catch (error) {
    console.error("Theme initialization error:", error);
    dispatch({ type: THEME_ERROR, payload: error.message });
  }
};

export const setTheme = (themeName) => async (dispatch) => {
  try {
    console.log("Setting theme to:", themeName);

    const themeData = themeName === "dark" ? darkTheme : lightTheme;

    // Сохраняем в SecureStore
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, themeName);

    dispatch({
      type: THEME_SET,
      payload: {
        theme: themeName,
        colors: themeData.colors,
        isDark: themeData.dark,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error setting theme:", error);
    dispatch({ type: THEME_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Переключение темы
export const toggleTheme = () => async (dispatch, getState) => {
  try {
    const currentTheme = getState().theme?.theme || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    return await dispatch(setTheme(newTheme));
  } catch (error) {
    console.error("Error toggling theme:", error);
    return { success: false, error: error.message };
  }
};
