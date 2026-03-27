import { useState } from "react";
import { View } from "react-native";
import CustomTabNavigator from "./components/CustomTabNavigator";
import { useLoadResources } from "./hooks/useLoadResources";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import CustomSplashScreen from "./components/CustomSplashScreen";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import store from "./redux/store";

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
