import { useState } from "react";
import { StyleSheet, View } from "react-native";
import CustomTabNavigator from "./components/CustomTabNavigator";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { OffersProvider } from "./context/OffersContext";
import { useLoadResources } from "./hooks/useLoadResources";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import CustomSplashScreen from "./components/CustomSplashScreen";
import { NavigationContainer } from "@react-navigation/native";

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
        <NavigationContainer>
          <CustomTabNavigator />
        </NavigationContainer>
      </View>
    </View>
  );
}

export default function App() {
  const { isLoading, themePreference, languagePreference } = useLoadResources();
  const [splashVisible, setSplashVisible] = useState(true);

  const handleSplashFinish = () => {
    setSplashVisible(false);
  };

  if (isLoading || splashVisible) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <CustomSplashScreen onFinish={handleSplashFinish} />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider initialLanguage={languagePreference}>
        <ThemeProvider initialTheme={themePreference}>
          <OffersProvider>
            <AppContent />
          </OffersProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
