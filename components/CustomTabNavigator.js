import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";

import MainScreen from "./tabs/MainScreen";
import SavedScreen from "./tabs/SavedScreen";
import SettingsScreen from "./tabs/SettingsScreen";

function TabNavigatorContent() {
  const { t, locale } = useLanguage();
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState("main");

  const tabs = [
    { key: "main", title: t("tabs.main"), icon: "🏠", component: MainScreen },
    {
      key: "saved",
      title: t("tabs.saved"),
      icon: "👤",
      component: SavedScreen,
    },
    {
      key: "settings",
      title: t("tabs.settings"),
      icon: "⚙️",
      component: SettingsScreen,
    },
  ];

  const renderScreen = () => {
    const activeTabConfig = tabs.find((tab) => tab.key === activeTab);
    const Component = activeTabConfig?.component || MainScreen;
    return <Component key={`screen-${activeTab}-${locale}`} />;
  };

  const TabButton = ({ tab }) => {
    const isActive = activeTab === tab.key;

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab(tab.key)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabIcon,
            {
              color: isActive ? themeColors.primary : themeColors.textSecondary,
            },
          ]}
        >
          {tab.icon}
        </Text>
        <Text
          style={[
            styles.tabText,
            {
              color: isActive ? themeColors.primary : themeColors.textSecondary,
            },
            isActive && styles.activeTabText,
          ]}
        >
          {tab.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const styles = createStyles(themeColors);

  return (
    <View style={styles.container} key={`container-${locale}`}>
      <View style={styles.contentContainer}>{renderScreen()}</View>

      <View
        style={[
          styles.tabBar,
          { paddingBottom: Platform.OS === "ios" ? 5 : 0 },
        ]}
      >
        {tabs.map((tab) => (
          <TabButton key={tab.key} tab={tab} />
        ))}
      </View>
    </View>
  );
}

export default function CustomTabNavigator() {
  const { themeColors } = useTheme();
  // Принудительный перерендер при смене темы через key
  return <TabNavigatorContent key={`navigator-${themeColors.background}`} />;
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      flex: 1,
    },
    tabBar: {
      flexDirection: "row",
      height: 60,
      backgroundColor: colors.tabBarBackground,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
