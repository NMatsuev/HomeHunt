import { useState } from "react";
import { StyleSheet, View } from "react-native";
import CustomTabNavigator from "./components/CustomTabNavigator";
import { LanguageProvider } from "./i18n/LanguageContext";
import { ThemeProvider } from "./theme/ThemeContext";
import { useLoadResources } from "./hooks/useLoadResources";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import CustomSplashScreen from "./components/CustomSplashScreen";

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
          <AppContent />
        </ThemeProvider>
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
