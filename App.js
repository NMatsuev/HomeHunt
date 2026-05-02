import { useState, useEffect } from "react";
import { View } from "react-native";
import { Provider, useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import store from "./redux/store";
import CustomTabNavigator from "./components/CustomTabNavigator";
import AuthScreen from "./components/AuthScreen";
import CustomSplashScreen from "./components/CustomSplashScreen";
import { useLoadResources } from "./hooks/useLoadResources";
import useLanguageViewModel from "./viewModels/languageViewModel";
import authService from "./services/authService";

function AppContent() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showAuth, setShowAuth] = useState(!isAuthenticated);
  const { t } = useLanguageViewModel();

  // Устанавливаем функцию перевода для сервиса
  useEffect(() => {
    authService.setTranslateFunction(t);
  }, [t]);

  useEffect(() => {
    setShowAuth(!isAuthenticated);
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

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
          {showAuth ? (
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          ) : (
            <CustomTabNavigator />
          )}
        </NavigationContainer>
      </View>
    </View>
  );
}

function AppWrapper() {
  const { isLoading } = useLoadResources();
  const [splashVisible, setSplashVisible] = useState(true);

  const handleSplashFinish = () => {
    setSplashVisible(false);
  };

  if (isLoading || splashVisible) {
    return (
      <SafeAreaProvider>
        <Provider store={store}>
          <CustomSplashScreen onFinish={handleSplashFinish} />
        </Provider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return <AppWrapper />;
}
