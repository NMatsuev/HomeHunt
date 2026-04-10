import { useState, useEffect } from "react";
import * as Font from "expo-font";

export const useLoadResources = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState({
    fontsLoaded: false,
  });

  useEffect(() => {
    async function loadResources() {
      try {
        const [fonts] = await Promise.all([
          Font.loadAsync({
            "mt-bold": require("../assets/fonts/Montserrat-Bold.ttf"),
            "mt-light": require("../assets/fonts/Montserrat-Light.ttf"),
          }),
        ]);

        setResources({
          fontsLoaded: true,
        });
      } catch (error) {
        console.error("Error loading resources:", error);
        setResources({
          fontsLoaded: true,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadResources();
  }, []);

  return { isLoading, ...resources };
};
