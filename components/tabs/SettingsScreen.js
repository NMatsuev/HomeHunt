import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useTranslation } from "../../i18n/useTranslation";

export default function SettingsScreen() {
  const { t, setLocale, currentLocale, availableLanguages } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);

  const changeLanguage = async (locale) => {
    if (locale === currentLocale) {
      setModalVisible(false);
      return;
    }

    setChangingLanguage(true);

    try {
      setLocale(locale);

      // Небольшая задержка для плавности
      setTimeout(() => {
        setModalVisible(false);
        setChangingLanguage(false);
      }, 300);
    } catch (error) {
      console.error("Ошибка смены языка:", error);
      Alert.alert("Ошибка", "Не удалось изменить язык. Попробуйте еще раз.");
      setChangingLanguage(false);
    }
  };

  // Находим текущий язык для отображения
  const currentLanguage =
    availableLanguages.find((lang) => lang.code === currentLocale) ||
    availableLanguages[0];

  return (
    <View style={styles.container}>
      {/* Заголовок экрана */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ {t("settings.title")}</Text>
      </View>

      {/* Основной контент */}
      <View style={styles.content}>
        {/* Секция выбора языка */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🌐</Text>
            <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
          </View>

          {/* Комбобокс */}
          <TouchableOpacity
            style={styles.combobox}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
            disabled={changingLanguage}
          >
            <View style={styles.comboboxContent}>
              <Text style={styles.comboboxFlag}>{currentLanguage?.flag}</Text>
              <View style={styles.comboboxTextContainer}>
                <Text style={styles.comboboxName}>{currentLanguage?.name}</Text>
                <Text style={styles.comboboxNative}>
                  {currentLanguage?.nativeName}
                </Text>
              </View>
            </View>
            <Text style={styles.comboboxArrow}>▼</Text>
          </TouchableOpacity>

          {/* Модальное окно */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => !changingLanguage && setModalVisible(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => !changingLanguage && setModalVisible(false)}
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
                          !changingLanguage && setModalVisible(false)
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
                              <Text style={styles.languageItemNative}>
                                {item.nativeName}
                              </Text>
                            </View>
                          </View>
                          {currentLocale === item.code && !changingLanguage && (
                            <View style={styles.modalCheckmark}>
                              <Text style={styles.modalCheckmarkText}>✓</Text>
                            </View>
                          )}
                          {changingLanguage && currentLocale === item.code && (
                            <ActivityIndicator size="small" color="tomato" />
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

        {/* Секция с информацией */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>ℹ️</Text>
            <Text style={styles.sectionTitle}>{t("settings.about")}</Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("settings.version")}</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("settings.build")}</Text>
              <Text style={styles.infoValue}>2024.02.25</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
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
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    shadowColor: "#000",
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
    borderBottomColor: "#f0f0f0",
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "mt-bold",
    color: "#333",
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
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
  comboboxTextContainer: {
    flex: 1,
  },
  comboboxName: {
    fontSize: 16,
    fontFamily: "mt-bold",
    color: "#333",
    marginBottom: 2,
  },
  comboboxNative: {
    fontSize: 12,
    fontFamily: "mt-light",
    color: "#666",
  },
  comboboxArrow: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  // Стили для модального окна
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
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
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "mt-bold",
    color: "#333",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    color: "#666",
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
    backgroundColor: "rgba(255, 99, 71, 0.1)",
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
    color: "#333",
    marginBottom: 2,
  },
  languageItemNameActive: {
    color: "tomato",
  },
  languageItemNative: {
    fontSize: 12,
    fontFamily: "mt-light",
    color: "#666",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  modalCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "tomato",
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
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "mt-light",
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "mt-bold",
    color: "#333",
  },
});
