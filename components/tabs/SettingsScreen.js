import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useLanguageViewModel from "../../viewModels/languageViewModel";
import useThemeViewModel from "../../viewModels/themeViewModel";
import * as Notifications from "expo-notifications";

// Настройка обработчика уведомлений для foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function SettingsScreen() {
  const { t, setLocale, currentLocale, availableLanguages } =
    useLanguageViewModel();
  const { theme, setTheme, themeColors } = useThemeViewModel();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);
  const [changingTheme, setChangingTheme] = useState(false);

  // Состояния для уведомлений
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState("daily");
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notificationPermission, setNotificationPermission] = useState(false);

  const themeOptions = [
    {
      key: "light",
      label: t("settings.theme.light") || "Светлая",
      icon: "☀️",
    },
    {
      key: "dark",
      label: t("settings.theme.dark") || "Темная",
      icon: "🌙",
    },
  ];

  const frequencyOptions = [
    { key: "daily", label: "Ежедневно" },
    { key: "weekly", label: "Еженедельно" },
    { key: "monthly", label: "Ежемесячно" },
  ];

  // Запрос разрешения на уведомления
  const requestNotificationPermissions = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Ошибка", "Не удалось получить разрешение на уведомления");
      return false;
    }

    setNotificationPermission(true);
    return true;
  };

  // Загрузка настроек уведомлений
  const loadNotificationSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("notificationSettings");
      if (saved) {
        const settings = JSON.parse(saved);
        setNotificationsEnabled(settings.enabled);
        setNotificationTime(new Date(settings.time));
        setNotificationFrequency(settings.frequency);
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  // Сохранение настроек уведомлений
  const saveNotificationSettings = async (enabled, time, frequency) => {
    try {
      const settings = {
        enabled,
        time: time.toISOString(),
        frequency,
      };
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(settings),
      );

      if (enabled) {
        await scheduleNotification(time, frequency);
      } else {
        await cancelAllNotifications();
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  const scheduleNotification = async (time, frequency) => {
    await cancelAllNotifications();

    const now = new Date();
    const triggerTime = new Date(time);
    triggerTime.setSeconds(0);
    triggerTime.setMilliseconds(0);

    if (triggerTime <= now) {
      triggerTime.setDate(triggerTime.getDate() + 1);
    }

    let trigger;

    switch (frequency) {
      case "daily":
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: triggerTime.getHours(),
          minute: triggerTime.getMinutes(),
        };
        break;

      case "weekly":
        // Получаем день недели (1 - понедельник, 7 - воскресенье)
        let weekday = triggerTime.getDay();
        if (weekday === 0) weekday = 7;
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: weekday,
          hour: triggerTime.getHours(),
          minute: triggerTime.getMinutes(),
        };
        break;

      case "monthly":
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
          day: triggerTime.getDate(),
          hour: triggerTime.getHours(),
          minute: triggerTime.getMinutes(),
        };
        break;

      default:
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: triggerTime.getHours(),
          minute: triggerTime.getMinutes(),
        };
    }

    console.log("Scheduling notification with trigger:", trigger);

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Новые объявления! 🏠",
          body: "Появились свежие предложения, которые могут вас заинтересовать",
          data: { screen: "MainScreen", type: "new_offers" },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: trigger,
      });

      console.log("Notification scheduled with ID:", notificationId);
      Alert.alert("Успех", "Уведомления настроены успешно!");
    } catch (error) {
      console.error("Error scheduling notification:", error);
      Alert.alert(
        "Ошибка",
        "Не удалось настроить уведомления: " + error.message,
      );
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications cancelled");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  };

  // Инициализация
  useEffect(() => {
    loadNotificationSettings();

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received in foreground:", notification);
      },
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const handleNotificationToggle = async (value) => {
    if (value && !notificationPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        setNotificationsEnabled(false);
        return;
      }
    }

    setNotificationsEnabled(value);
    await saveNotificationSettings(
      value,
      notificationTime,
      notificationFrequency,
    );
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setNotificationTime(selectedDate);
      if (notificationsEnabled) {
        saveNotificationSettings(
          notificationsEnabled,
          selectedDate,
          notificationFrequency,
        );
      }
    }
  };

  const handleFrequencyChange = (frequency) => {
    setNotificationFrequency(frequency);
    setFrequencyModalVisible(false);
    if (notificationsEnabled) {
      saveNotificationSettings(
        notificationsEnabled,
        notificationTime,
        frequency,
      );
    }
  };

  const changeLanguage = async (selectedLocale) => {
    if (selectedLocale === currentLocale) {
      setLanguageModalVisible(false);
      return;
    }

    setChangingLanguage(true);

    try {
      setLocale(selectedLocale);

      setTimeout(() => {
        setLanguageModalVisible(false);
        setChangingLanguage(false);
      }, 300);
    } catch (error) {
      console.error("Ошибка смены языка:", error);
      Alert.alert("Ошибка", "Не удалось изменить язык. Попробуйте еще раз.");
      setChangingLanguage(false);
    }
  };

  const changeTheme = async (selectedTheme) => {
    if (selectedTheme === theme) {
      setThemeModalVisible(false);
      return;
    }

    setChangingTheme(true);

    try {
      await setTheme(selectedTheme);

      setTimeout(() => {
        setThemeModalVisible(false);
        setChangingTheme(false);
      }, 300);
    } catch (error) {
      console.error("Error changing theme:", error);
      setChangingTheme(false);
    }
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

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={styles.container}>
      {/* Заголовок экрана */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
      </View>

      {/* Основной контент */}
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
              {/* Выбор времени */}
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

              {/* Выбор периодичности */}
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
                      {t(
                        `settings.notifications.frequencyOptions.${currentFrequency.key}`,
                      )}
                    </Text>
                  </View>
                </View>
                <Text style={styles.comboboxArrow}>▼</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

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
                          <Text style={styles.languageItemFlag}>
                            {item.icon}
                          </Text>
                          <View style={styles.languageItemTextContainer}>
                            <Text
                              style={[
                                styles.languageItemName,
                                notificationFrequency === item.key &&
                                  styles.languageItemNameActive,
                              ]}
                            >
                              {t(
                                `settings.notifications.frequencyOptions.${item.key}`,
                              )}
                            </Text>
                          </View>
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

        {/* Секция выбора языка */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
          </View>

          {/* Комбобокс языка */}
          <TouchableOpacity
            style={styles.combobox}
            onPress={() => setLanguageModalVisible(true)}
            activeOpacity={0.7}
            disabled={changingLanguage}
          >
            <View style={styles.comboboxContent}>
              <Text style={styles.comboboxFlag}>{currentLanguage?.flag}</Text>
              <View style={styles.comboboxTextContainer}>
                <Text style={styles.comboboxName}>{currentLanguage?.name}</Text>
              </View>
            </View>
            <Text style={styles.comboboxArrow}>▼</Text>
          </TouchableOpacity>

          {/* Модальное окно выбора языка */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={languageModalVisible}
            onRequestClose={() =>
              !changingLanguage && setLanguageModalVisible(false)
            }
          >
            <TouchableWithoutFeedback
              onPress={() =>
                !changingLanguage && setLanguageModalVisible(false)
              }
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        {t("settings.selectLanguage")}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          !changingLanguage && setLanguageModalVisible(false)
                        }
                        style={styles.modalCloseButton}
                        disabled={changingLanguage}
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
                            changingLanguage && styles.disabledItem,
                          ]}
                          onPress={() => changeLanguage(item.code)}
                          disabled={changingLanguage}
                        >
                          <View style={styles.languageItemContent}>
                            <Text style={styles.languageItemFlag}>
                              {item.flag}
                            </Text>
                            <View style={styles.languageItemTextContainer}>
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
                          </View>
                          {currentLocale === item.code && !changingLanguage && (
                            <View style={styles.modalCheckmark}>
                              <Text style={styles.modalCheckmarkText}>✓</Text>
                            </View>
                          )}
                          {changingLanguage && currentLocale === item.code && (
                            <ActivityIndicator
                              size="small"
                              color={themeColors.primary}
                            />
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

        {/* Секция выбора темы */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("settings.theme.title") || "Тема"}
            </Text>
          </View>

          {/* Комбобокс темы */}
          <TouchableOpacity
            style={styles.combobox}
            onPress={() => setThemeModalVisible(true)}
            activeOpacity={0.7}
            disabled={changingTheme}
          >
            <View style={styles.comboboxContent}>
              <Text style={styles.comboboxIcon}>{currentTheme.icon}</Text>
              <View style={styles.comboboxTextContainer}>
                <Text style={styles.comboboxName}>{currentTheme.label}</Text>
              </View>
            </View>
            <Text style={styles.comboboxArrow}>▼</Text>
          </TouchableOpacity>

          {/* Модальное окно выбора темы */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={themeModalVisible}
            onRequestClose={() => !changingTheme && setThemeModalVisible(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => !changingTheme && setThemeModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        {t("settings.theme.select") || "Выберите тему"}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          !changingTheme && setThemeModalVisible(false)
                        }
                        style={styles.modalCloseButton}
                        disabled={changingTheme}
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
                            changingTheme && styles.disabledItem,
                          ]}
                          onPress={() => changeTheme(item.key)}
                          disabled={changingTheme}
                        >
                          <View style={styles.themeItemContent}>
                            <Text style={styles.themeItemIcon}>
                              {item.icon}
                            </Text>
                            <View style={styles.themeItemTextContainer}>
                              <Text
                                style={[
                                  styles.themeItemLabel,
                                  theme === item.key &&
                                    styles.themeItemLabelActive,
                                ]}
                              >
                                {item.label}
                              </Text>
                            </View>
                          </View>
                          {theme === item.key && !changingTheme && (
                            <View style={styles.modalCheckmark}>
                              <Text style={styles.modalCheckmarkText}>✓</Text>
                            </View>
                          )}
                          {changingTheme && theme === item.key && (
                            <ActivityIndicator
                              size="small"
                              color={themeColors.primary}
                            />
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

        {/* Секция с информацией о приложении */}
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
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 3,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: "mt-bold",
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 20,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
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
    notificationInfo: {
      flex: 1,
      marginRight: 16,
    },
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
    comboboxContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    comboboxFlag: {
      fontSize: 30,
      marginRight: 12,
    },
    comboboxIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    comboboxTextContainer: {
      flex: 1,
    },
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
    comboboxArrow: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 8,
    },
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
    modalTitle: {
      fontSize: 18,
      fontFamily: "mt-bold",
      color: colors.text,
    },
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
    languageItemActive: {
      backgroundColor: colors.primaryLight,
    },
    languageItemContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    languageItemFlag: {
      fontSize: 30,
      marginRight: 12,
    },
    languageItemTextContainer: {
      flex: 1,
    },
    languageItemName: {
      fontSize: 16,
      fontFamily: "mt-bold",
      color: colors.text,
      marginBottom: 2,
    },
    languageItemNameActive: {
      color: colors.primary,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
    modalCheckmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    modalCheckmarkText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
    },
    disabledItem: {
      opacity: 0.5,
    },
    themeItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    themeItemActive: {
      backgroundColor: colors.primaryLight,
    },
    themeItemContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    themeItemIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    themeItemTextContainer: {
      flex: 1,
    },
    themeItemLabel: {
      fontSize: 16,
      fontFamily: "mt-bold",
      color: colors.text,
    },
    themeItemLabelActive: {
      color: colors.primary,
    },
    infoContainer: {
      gap: 12,
    },
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
    infoValue: {
      fontSize: 14,
      fontFamily: "mt-bold",
      color: colors.text,
    },
  });
