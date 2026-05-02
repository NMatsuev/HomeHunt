import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  ScrollView,
  Switch,
  Platform,
  ActivityIndicator,
  Alert, // Добавлен Alert
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import useLanguageViewModel from "../../viewModels/languageViewModel";
import useThemeViewModel from "../../viewModels/themeViewModel";
import useNotificationViewModel from "../../viewModels/notificationViewModel";
import useAuthViewModel from "../../viewModels/authViewModel"; // Добавлен импорт

export default function SettingsScreen() {
  const { t, setLocale, currentLocale, availableLanguages } =
    useLanguageViewModel();
  const { theme, setTheme, themeColors } = useThemeViewModel();
  const {
    enabled: notificationsEnabled,
    time: notificationTime,
    frequency: notificationFrequency,
    isLoading: notificationsLoading,
    toggleNotificationsEnabled,
    updateNotificationTime,
    updateNotificationFrequency,
    formatTime,
  } = useNotificationViewModel();

  // Добавлен хук аутентификации
  const { user, logoutUser } = useAuthViewModel();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);

  const themeOptions = [
    { key: "light", label: t("settings.theme.light") || "Светлая", icon: "☀️" },
    { key: "dark", label: t("settings.theme.dark") || "Темная", icon: "🌙" },
  ];

  const frequencyOptions = [
    {
      key: "daily",
      label: t("settings.notifications.frequencyOptions.daily"),
      icon: "📅",
    },
    {
      key: "weekly",
      label: t("settings.notifications.frequencyOptions.weekly"),
      icon: "📆",
    },
    {
      key: "monthly",
      label: t("settings.notifications.frequencyOptions.monthly"),
      icon: "📊",
    },
  ];

  const handleNotificationToggle = async (value) => {
    await toggleNotificationsEnabled(value);
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      updateNotificationTime(selectedDate);
    }
  };

  const handleFrequencyChange = (frequency) => {
    updateNotificationFrequency(frequency);
    setFrequencyModalVisible(false);
  };

  const changeLanguage = async (selectedLocale) => {
    if (selectedLocale !== currentLocale) {
      setLocale(selectedLocale);
    }
    setLanguageModalVisible(false);
  };

  const changeTheme = async (selectedTheme) => {
    if (selectedTheme !== theme) {
      await setTheme(selectedTheme);
    }
    setThemeModalVisible(false);
  };

  const currentLanguage =
    availableLanguages.find((lang) => lang.code === currentLocale) ||
    availableLanguages[0];
  const currentTheme =
    themeOptions.find((opt) => opt.key === theme) || themeOptions[0];
  const currentFrequency =
    frequencyOptions.find((opt) => opt.key === notificationFrequency) ||
    frequencyOptions[0];

  const styles = createStyles(themeColors);

  if (notificationsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Секция уведомлений */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              🔔 {t("settings.notifications.title")}
            </Text>
          </View>

          <View style={styles.notificationRow}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationLabel}>
                {t("settings.notifications.enable")}
              </Text>
              <Text style={styles.notificationDescription}>
                {t("settings.notifications.description")}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: "#767577", true: themeColors.primary }}
              thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
            />
          </View>

          {notificationsEnabled && (
            <>
              <TouchableOpacity
                style={styles.combobox}
                onPress={() => setShowTimePicker(true)}
              >
                <View style={styles.comboboxContent}>
                  <Text style={styles.comboboxIcon}>⏰</Text>
                  <View style={styles.comboboxTextContainer}>
                    <Text style={styles.comboboxName}>
                      {t("settings.notifications.time")}
                    </Text>
                    <Text style={styles.comboboxValue}>
                      {formatTime(notificationTime)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.comboboxArrow}>✎</Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={notificationTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleTimeChange}
                />
              )}

              <TouchableOpacity
                style={styles.combobox}
                onPress={() => setFrequencyModalVisible(true)}
              >
                <View style={styles.comboboxContent}>
                  <Text style={styles.comboboxIcon}>
                    {currentFrequency.icon}
                  </Text>
                  <View style={styles.comboboxTextContainer}>
                    <Text style={styles.comboboxName}>
                      {t("settings.notifications.frequency")}
                    </Text>
                    <Text style={styles.comboboxValue}>
                      {currentFrequency.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.comboboxArrow}>▼</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Секция языка */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
          </View>
          <TouchableOpacity
            style={styles.combobox}
            onPress={() => setLanguageModalVisible(true)}
          >
            <View style={styles.comboboxContent}>
              <Text style={styles.comboboxFlag}>{currentLanguage?.flag}</Text>
              <View style={styles.comboboxTextContainer}>
                <Text style={styles.comboboxName}>{currentLanguage?.name}</Text>
              </View>
            </View>
            <Text style={styles.comboboxArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Секция темы */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("settings.theme.title") || "Тема"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.combobox}
            onPress={() => setThemeModalVisible(true)}
          >
            <View style={styles.comboboxContent}>
              <Text style={styles.comboboxIcon}>{currentTheme.icon}</Text>
              <View style={styles.comboboxTextContainer}>
                <Text style={styles.comboboxName}>{currentTheme.label}</Text>
              </View>
            </View>
            <Text style={styles.comboboxArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Секция аккаунта */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("settings.account") || "Аккаунт"}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t("settings.email") || "Email"}
              </Text>
              <Text style={styles.infoValue}>{user?.email || "-"}</Text>
            </View>

            {user?.displayName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {t("settings.name") || "Имя"}
                </Text>
                <Text style={styles.infoValue}>{user.displayName}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.logoutButton,
                { backgroundColor: themeColors.error },
              ]}
              onPress={() => {
                Alert.alert(
                  t("settings.logout") || "Выход",
                  t("settings.logoutConfirm") ||
                    "Вы уверены, что хотите выйти?",
                  [
                    { text: t("common.cancel") || "Отмена", style: "cancel" },
                    {
                      text: t("common.yes") || "Да",
                      onPress: async () => {
                        const result = await logoutUser();
                        if (result.success) {
                          Alert.alert(
                            t("common.success") || "Успех",
                            t("settings.logoutSuccess") ||
                              "Вы вышли из аккаунта",
                          );
                        }
                      },
                    },
                  ],
                );
              }}
            >
              <Text style={styles.logoutButtonText}>
                {t("settings.logout") || "Выйти"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* О приложении */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("settings.about")}</Text>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("settings.version")}</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Модальное окно выбора языка */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setLanguageModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {t("settings.selectLanguage")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setLanguageModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={availableLanguages}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.languageItem,
                        currentLocale === item.code &&
                          styles.languageItemActive,
                      ]}
                      onPress={() => changeLanguage(item.code)}
                    >
                      <View style={styles.languageItemContent}>
                        <Text style={styles.languageItemFlag}>{item.flag}</Text>
                        <Text
                          style={[
                            styles.languageItemName,
                            currentLocale === item.code &&
                              styles.languageItemNameActive,
                          ]}
                        >
                          {item.name}
                        </Text>
                      </View>
                      {currentLocale === item.code && (
                        <View style={styles.modalCheckmark}>
                          <Text style={styles.modalCheckmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Модальное окно выбора темы */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={themeModalVisible}
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setThemeModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {t("settings.theme.select") || "Выберите тему"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setThemeModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={themeOptions}
                  keyExtractor={(item) => item.key}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.themeItem,
                        theme === item.key && styles.themeItemActive,
                      ]}
                      onPress={() => changeTheme(item.key)}
                    >
                      <View style={styles.themeItemContent}>
                        <Text style={styles.themeItemIcon}>{item.icon}</Text>
                        <Text
                          style={[
                            styles.themeItemLabel,
                            theme === item.key && styles.themeItemLabelActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>
                      {theme === item.key && (
                        <View style={styles.modalCheckmark}>
                          <Text style={styles.modalCheckmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Модальное окно выбора периодичности */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={frequencyModalVisible}
        onRequestClose={() => setFrequencyModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setFrequencyModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {t("settings.notifications.selectFrequency")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setFrequencyModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={frequencyOptions}
                  keyExtractor={(item) => item.key}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.languageItem,
                        notificationFrequency === item.key &&
                          styles.languageItemActive,
                      ]}
                      onPress={() => handleFrequencyChange(item.key)}
                    >
                      <View style={styles.languageItemContent}>
                        <Text style={styles.languageItemFlag}>{item.icon}</Text>
                        <Text
                          style={[
                            styles.languageItemName,
                            notificationFrequency === item.key &&
                              styles.languageItemNameActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>
                      {notificationFrequency === item.key && (
                        <View style={styles.modalCheckmark}>
                          <Text style={styles.modalCheckmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 24, fontFamily: "mt-bold", color: colors.text },
    content: { flex: 1, padding: 16 },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 20,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "mt-bold",
      color: colors.text,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    notificationRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    notificationInfo: { flex: 1, marginRight: 16 },
    notificationLabel: {
      fontSize: 16,
      fontFamily: "mt-bold",
      color: colors.text,
      marginBottom: 4,
    },
    notificationDescription: {
      fontSize: 12,
      fontFamily: "mt-light",
      color: colors.textSecondary,
    },
    combobox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 12,
    },
    comboboxContent: { flexDirection: "row", alignItems: "center", flex: 1 },
    comboboxFlag: { fontSize: 30, marginRight: 12 },
    comboboxIcon: { fontSize: 24, marginRight: 12 },
    comboboxTextContainer: { flex: 1 },
    comboboxName: {
      fontSize: 14,
      fontFamily: "mt-bold",
      color: colors.text,
      marginBottom: 2,
    },
    comboboxValue: {
      fontSize: 12,
      fontFamily: "mt-light",
      color: colors.textSecondary,
    },
    comboboxArrow: { fontSize: 16, color: colors.textSecondary, marginLeft: 8 },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.modalBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: { fontSize: 18, fontFamily: "mt-bold", color: colors.text },
    modalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
      justifyContent: "center",
      alignItems: "center",
    },
    modalCloseText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: "bold",
    },
    languageItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    languageItemActive: { backgroundColor: colors.primaryLight },
    languageItemContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    languageItemFlag: { fontSize: 30, marginRight: 12 },
    languageItemName: {
      fontSize: 16,
      fontFamily: "mt-bold",
      color: colors.text,
    },
    languageItemNameActive: { color: colors.primary },
    themeItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    themeItemActive: { backgroundColor: colors.primaryLight },
    themeItemContent: { flexDirection: "row", alignItems: "center", flex: 1 },
    themeItemIcon: { fontSize: 24, marginRight: 12 },
    themeItemLabel: { fontSize: 16, fontFamily: "mt-bold", color: colors.text },
    themeItemLabelActive: { color: colors.primary },
    separator: { height: 1, backgroundColor: colors.border },
    modalCheckmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    modalCheckmarkText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
    infoContainer: { gap: 12 },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      fontSize: 14,
      fontFamily: "mt-light",
      color: colors.textSecondary,
    },
    infoValue: { fontSize: 14, fontFamily: "mt-bold", color: colors.text },
    logoutButton: {
      marginTop: 12,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    logoutButtonText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "mt-bold",
    },
  });
