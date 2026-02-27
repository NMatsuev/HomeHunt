import { useState } from "react";
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
} from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function SettingsScreen() {
  const { t, setLocale, locale, availableLanguages } = useLanguage();
  const { theme, setTheme, themeColors } = useTheme();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);
  const [changingTheme, setChangingTheme] = useState(false);

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

  const changeLanguage = async (selectedLocale) => {
    if (selectedLocale === locale) {
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
    availableLanguages.find((lang) => lang.code === locale) ||
    availableLanguages[0];

  const currentTheme =
    themeOptions.find((opt) => opt.key === theme) || themeOptions[0];

  const styles = createStyles(themeColors);

  return (
    <View style={styles.container}>
      {/* Заголовок экрана */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
      </View>

      {/* Основной контент */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                            locale === item.code && styles.languageItemActive,
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
                                  locale === item.code &&
                                    styles.languageItemNameActive,
                                ]}
                              >
                                {item.name}
                              </Text>
                            </View>
                          </View>
                          {locale === item.code && !changingLanguage && (
                            <View style={styles.modalCheckmark}>
                              <Text style={styles.modalCheckmarkText}>✓</Text>
                            </View>
                          )}
                          {changingLanguage && locale === item.code && (
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
    // Стили для комбобокса
    combobox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
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
      marginRight: 20,
    },
    comboboxTextContainer: {
      flex: 1,
    },
    comboboxName: {
      fontSize: 16,
      fontFamily: "mt-bold",
      color: colors.text,
    },
    comboboxNative: {
      fontSize: 12,
      fontFamily: "mt-light",
      color: colors.textSecondary,
    },
    comboboxArrow: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    // Стили для модального окна
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
    // Стили для элементов языка
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
    languageItemNative: {
      fontSize: 12,
      fontFamily: "mt-light",
      color: colors.textSecondary,
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
