import { useState, useEffect } from "react";
import * as Font from "expo-font";
import * as SecureStore from "expo-secure-store";
import { THEME_STORAGE_KEY, LANGUAGE_STORAGE_KEY } from "../config/StorageKeys";

export const useLoadResources = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState({
    fontsLoaded: false,
    themePreference: "light",
    languagePreference: "ru",
  });

  useEffect(() => {
    async function loadResources() {
      try {
        const [fonts, savedTheme, savedLanguage] = await Promise.all([
          Font.loadAsync({
            "mt-bold": require("../assets/fonts/Montserrat-Bold.ttf"),
            "mt-light": require("../assets/fonts/Montserrat-Light.ttf"),
          }),
          SecureStore.getItemAsync(THEME_STORAGE_KEY),
          SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY),
        ]);

        setResources({
          fontsLoaded: true,
          themePreference: savedTheme || "light",
          languagePreference: savedLanguage || "ru",
        });
      } catch (error) {
        console.error("Error loading resources:", error);
        setResources({
          fontsLoaded: true,
          themePreference: "light",
          languagePreference: "ru",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadResources();
  }, []);

  return { isLoading, ...resources };
};
