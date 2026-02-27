import { createContext, useContext, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { THEME_STORAGE_KEY } from "../config/StorageKeys";

export const lightTheme = {
  dark: false,
  colors: {
    primary: "tomato",
    primaryLight: "rgba(255, 99, 71, 0.1)",
    background: "#f5f5f5",
    card: "#ffffff",
    text: "#333333",
    textSecondary: "#666666",
    textLight: "#999999",
    border: "#e0e0e0",
    borderLight: "#f0f0f0",
    notification: "tomato",
    headerBackground: "#ffffff",
    tabBarBackground: "#ffffff",
    modalBackground: "#ffffff",
    inputBackground: "#f8f8f8",
    placeholder: "#999999",
    shadow: "#000000",
    success: "#4CAF50",
    error: "#f44336",
    warning: "#ff9800",
    info: "#2196F3",
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: "tomato",
    primaryLight: "rgba(255, 99, 71, 0.2)",
    background: "#121212",
    card: "#1e1e1e",
    text: "#ffffff",
    textSecondary: "#b0b0b0",
    textLight: "#808080",
    border: "#333333",
    borderLight: "#2c2c2c",
    notification: "tomato",
    headerBackground: "#1e1e1e",
    tabBarBackground: "#1e1e1e",
    modalBackground: "#1e1e1e",
    inputBackground: "#2c2c2c",
    placeholder: "#666666",
    shadow: "#000000",
    success: "#4CAF50",
    error: "#f44336",
    warning: "#ff9800",
    info: "#2196F3",
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children, initialTheme = "light" }) => {
  const [theme, setThemeState] = useState(initialTheme);

  const saveThemePreference = async (newTheme) => {
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const getCurrentTheme = () => {
    return theme === "dark" ? darkTheme : lightTheme;
  };

  const themeColors = getCurrentTheme().colors;

  const setTheme = (newTheme) => {
    saveThemePreference(newTheme);
  };

  const value = {
    theme,
    themeColors,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
