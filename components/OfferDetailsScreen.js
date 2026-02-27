// screens/OfferDetailsScreen.js
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { useLanguage } from "../i18n/LanguageContext";
import { useOffers } from "../context/OffersContext";
import OfferForm from "../components/forms/OfferForm";
import CustomAlert from "../components/CustomAlert";

export default function OfferDetailsScreen({ route, navigation }) {
  const { offer } = route.params;
  const { themeColors } = useTheme();
  const { t } = useLanguage();
  const { deleteOffer, editOffer } = useOffers();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const handleDelete = () => {
    setAlertVisible(true);
  };

  const confirmDelete = () => {
    deleteOffer(offer.id);
    setAlertVisible(false);
    navigation.goBack();
  };

  const handleEdit = (editedOffer) => {
    editOffer(editedOffer);
    setEditModalVisible(false);
    navigation.goBack();
  };

  const styles = createStyles(themeColors);

  return (
    <View style={styles.container}>
      {/* Шапка с кнопкой назад */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: themeColors.primary }]}>
            ← Назад
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          Детали объявления
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Изображение */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: offer.image }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Основная информация */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {offer.title}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: themeColors.primary }]}>
              {offer.price}
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: `${themeColors.primary}20` },
              ]}
            >
              <Text style={[styles.badgeText, { color: themeColors.primary }]}>
                {t("mainScreen.rooms", { count: offer.rooms })}
              </Text>
            </View>
          </View>

          {/* Характеристики */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Характеристики
            </Text>
            <View style={styles.characteristicsGrid}>
              <View style={styles.characteristicItem}>
                <Text
                  style={[
                    styles.characteristicIcon,
                    { color: themeColors.primary },
                  ]}
                >
                  📐
                </Text>
                <View>
                  <Text
                    style={[
                      styles.characteristicLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Площадь
                  </Text>
                  <Text
                    style={[
                      styles.characteristicValue,
                      { color: themeColors.text },
                    ]}
                  >
                    {offer.area} м²
                  </Text>
                </View>
              </View>

              <View style={styles.characteristicItem}>
                <Text
                  style={[
                    styles.characteristicIcon,
                    { color: themeColors.primary },
                  ]}
                >
                  📌
                </Text>
                <View>
                  <Text
                    style={[
                      styles.characteristicLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Этаж
                  </Text>
                  <Text
                    style={[
                      styles.characteristicValue,
                      { color: themeColors.text },
                    ]}
                  >
                    {offer.floor}/{offer.floorCount}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Адрес */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Адрес
            </Text>
            <View style={styles.addressContainer}>
              <Text
                style={[styles.addressIcon, { color: themeColors.primary }]}
              >
                📍
              </Text>
              <Text style={[styles.address, { color: themeColors.text }]}>
                {offer.address}
              </Text>
            </View>
          </View>

          {/* Описание */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Описание
            </Text>
            <Text
              style={[styles.description, { color: themeColors.textSecondary }]}
            >
              {offer.description}
            </Text>
          </View>

          {/* Дополнительная информация */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Дополнительно
            </Text>
            <View style={styles.additionalInfo}>
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  ID объявления:
                </Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>
                  {offer.id}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Дата добавления:
                </Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Кнопки действий */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.editButton,
              { backgroundColor: themeColors.primary },
            ]}
            onPress={() => setEditModalVisible(true)}
          >
            <Text style={styles.actionButtonText}>✏️ Редактировать</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              { backgroundColor: themeColors.error },
            ]}
            onPress={handleDelete}
          >
            <Text style={styles.actionButtonText}>🗑️ Удалить</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Кастомный Alert для подтверждения удаления */}
      <CustomAlert
        visible={alertVisible}
        title="Удаление объявления"
        message="Вы уверены, что хотите удалить это объявление?"
        onCancel={() => setAlertVisible(false)}
        onConfirm={confirmDelete}
        cancelText="Отмена"
        confirmText="Удалить"
        confirmStyle="destructive"
      />

      {/* Модальное окно редактирования на весь экран */}
      <Modal
        animationType="slide"
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: themeColors.background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: themeColors.headerBackground,
                borderBottomColor: themeColors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text
                style={[styles.modalBackText, { color: themeColors.primary }]}
              >
                ← Назад
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              Редактировать объявление
            </Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <OfferForm
            initialOffer={offer}
            onSubmit={handleEdit}
            onCancel={() => setEditModalVisible(false)}
            isEditing={true}
          />
        </SafeAreaView>
      </Modal>
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
    },
    backButtonText: {
      fontSize: 16,
      fontFamily: "mt-bold",
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: "mt-bold",
    },
    placeholder: {
      width: 50,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    imageContainer: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 16,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    card: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    title: {
      fontSize: 24,
      fontFamily: "mt-bold",
      marginBottom: 12,
    },
    priceContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    price: {
      fontSize: 28,
      fontFamily: "mt-bold",
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    badgeText: {
      fontSize: 14,
      fontFamily: "mt-bold",
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "mt-bold",
      marginBottom: 12,
    },
    characteristicsGrid: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    characteristicItem: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    characteristicIcon: {
      fontSize: 24,
      marginRight: 8,
    },
    characteristicLabel: {
      fontSize: 12,
      fontFamily: "mt-light",
      marginBottom: 2,
    },
    characteristicValue: {
      fontSize: 16,
      fontFamily: "mt-bold",
    },
    addressContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    addressIcon: {
      fontSize: 20,
      marginRight: 8,
    },
    address: {
      fontSize: 16,
      fontFamily: "mt-light",
      flex: 1,
    },
    description: {
      fontSize: 14,
      fontFamily: "mt-light",
      lineHeight: 20,
    },
    additionalInfo: {
      backgroundColor: colors.inputBackground,
      padding: 12,
      borderRadius: 8,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 4,
    },
    infoLabel: {
      fontSize: 14,
      fontFamily: "mt-light",
    },
    infoValue: {
      fontSize: 14,
      fontFamily: "mt-bold",
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    actionButton: {
      flex: 1,
      height: 50,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 4,
    },
    editButton: {
      elevation: 3,
    },
    deleteButton: {
      elevation: 3,
    },
    actionButtonText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "mt-bold",
    },
    // Стили для модального окна на весь экран
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    modalBackButton: {
      padding: 8,
    },
    modalBackText: {
      fontSize: 16,
      fontFamily: "mt-bold",
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "mt-bold",
    },
    modalPlaceholder: {
      width: 50,
    },
  });
