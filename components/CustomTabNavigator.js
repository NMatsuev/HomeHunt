import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useLanguageViewModel from "../viewModels/languageViewModel";
import useThemeViewModel from "../viewModels/themeViewModel";
import OfferDetailsScreen from "../components/OfferDetailsScreen";
import OfferForm from "../components/forms/OfferForm";
import MainScreen from "./tabs/MainScreen";
import SavedScreen from "./tabs/SavedScreen";
import SettingsScreen from "./tabs/SettingsScreen";

const Stack = createNativeStackNavigator();

function MainStackScreen() {
  const { themeColors } = useThemeViewModel();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
      }}
    >
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} />
      <Stack.Screen name="EditOffer" component={OfferForm} />
    </Stack.Navigator>
  );
}

function SavedStackScreen() {
  const { themeColors } = useThemeViewModel();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
      }}
    >
      <Stack.Screen name="SavedScreen" component={SavedScreen} />
      <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} />
    </Stack.Navigator>
  );
}

export default function CustomTabNavigator() {
  const { t } = useLanguageViewModel();
  const { themeColors } = useThemeViewModel();
  const [activeTab, setActiveTab] = useState("main");

  const tabs = [
    {
      key: "main",
      title: t("tabs.main"),
      icon: "🏠",
      component: MainStackScreen,
    },
    {
      key: "saved",
      title: t("tabs.saved"),
      icon: "⭐",
      component: SavedStackScreen,
    },
    {
      key: "settings",
      title: t("tabs.settings"),
      icon: "⚙️",
      component: SettingsScreen,
    },
  ];

  const ActiveComponent =
    tabs.find((tab) => tab.key === activeTab)?.component || MainStackScreen;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    contentContainer: {
      flex: 1,
    },
    tabBar: {
      flexDirection: "row",
      height: 60,
      backgroundColor: themeColors.tabBarBackground,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    tabButton: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    tabIcon: {
      fontSize: 24,
      marginBottom: 2,
    },
    tabText: {
      fontSize: 11,
      fontFamily: "mt-light",
    },
    activeTabText: {
      fontFamily: "mt-bold",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <ActiveComponent />
      </View>

      <View
        style={[
          styles.tabBar,
          { paddingBottom: Platform.OS === "ios" ? 5 : 0 },
        ]}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabIcon,
                {
                  color:
                    activeTab === tab.key
                      ? themeColors.primary
                      : themeColors.textSecondary,
                },
              ]}
            >
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab.key
                      ? themeColors.primary
                      : themeColors.textSecondary,
                },
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
