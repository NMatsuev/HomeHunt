import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Определяем цвета для темной темы
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

const THEME_STORAGE_KEY = "@app_theme_preference";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState("light");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    //loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (newTheme) => {
    try {
      //await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
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

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const value = {
    theme, // 'light', 'dark'
    themeColors, // цвета текущей темы
    isSystemTheme: theme === "system",
    isDarkMode: getCurrentTheme().dark,
    setTheme,
    toggleTheme,
    isLoading,
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
