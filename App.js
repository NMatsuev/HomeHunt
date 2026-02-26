import { StyleSheet, View, ActivityIndicator } from "react-native";
import * as Font from "expo-font";
import { useState, useEffect } from "react";
import CustomTabNavigator from "./components/CustomTabNavigator";
import { LanguageProvider } from "./i18n/LanguageContext";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";

function AppContent() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingBottom: insets.bottom,
          paddingRight: insets.right,
          flex: 1,
        }}
      >
        <CustomTabNavigator />
      </View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "mt-bold": require("./assets/fonts/Montserrat-Bold.ttf"),
        "mt-light": require("./assets/fonts/Montserrat-Light.ttf"),
      });
      setTimeout(() => {
        setFontsLoaded(true);
      }, 3000);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
