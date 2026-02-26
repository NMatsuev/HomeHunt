import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useTranslation } from "../i18n/useTranslation";

// Импорт экранов
import MainScreen from "./tabs/MainScreen";
import SavedScreen from "./tabs/SavedScreen";
import SettingsScreen from "./tabs/SettingsScreen";

function TabNavigatorContent() {
  const { t, currentLocale } = useTranslation();
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
    return <Component />;
  };

  const TabButton = ({ tab }) => {
    const isActive = activeTab === tab.key;

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab(tab.key)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>
          {tab.icon}
        </Text>
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {tab.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
  return <TabNavigatorContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
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
  activeTabIcon: {
    color: "tomato",
  },
  tabText: {
    fontSize: 11,
    color: "#666",
    fontFamily: "mt-light",
  },
  activeTabText: {
    color: "tomato",
    fontFamily: "mt-bold",
  },
});
