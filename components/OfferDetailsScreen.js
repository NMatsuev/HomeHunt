import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import useThemeViewModel from "../viewModels/themeViewModel";
import useLanguageViewModel from "../viewModels/languageViewModel";
import useOffersViewModel from "../viewModels/offersViewModel";
import OfferForm from "../components/forms/OfferForm";
import CustomAlert from "../components/CustomAlert";

export default function OfferDetailsScreen({ route, navigation }) {
  const { offer, activeTab } = route.params;
  const { themeColors } = useThemeViewModel();
  const { t } = useLanguageViewModel();
  const { deleteOffer, updateOffer } = useOffersViewModel();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const isKufarOffer = activeTab === "kufar";

  // Получаем URL изображения
  const imageUrl = offer.imageUrl;

  const handleDelete = () => {
    setAlertVisible(true);
  };

  const confirmDelete = () => {
    deleteOffer(offer.id);
    setAlertVisible(false);
    navigation.goBack();
  };

  const handleEdit = (editedOffer) => {
    updateOffer(editedOffer);
    setEditModalVisible(false);
    navigation.goBack();
  };

  const styles = createStyles(themeColors);

  // Компонент изображения в зависимости от типа объявления
  const renderImage = () => {
    return (
      <View style={styles.imageWrapper}>
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        )}
        <Image
          source={!isKufarOffer ? { uri: offer.image } : offer.image}
          style={styles.image}
          resizeMode="cover"
          onLoadStart={() => {
            setImageLoading(true);
            setImageError(false);
          }}
          onLoadEnd={() => setImageLoading(false)}
          onError={(e) => {
            console.error("Kufar image load error:", e.nativeEvent.error);
            setImageError(true);
            setImageLoading(false);
          }}
        />
        {imageError && (
          <View style={styles.imageErrorContainer}>
            <Text
              style={[
                styles.imageErrorText,
                { color: themeColors.textSecondary },
              ]}
            >
              📷 {t("offerDetails.imageLoadError")}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Шапка с кнопкой назад */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: themeColors.primary }]}>
            ← {t("offerDetails.back")}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {t("offerDetails.title")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Изображение */}
        <View style={styles.imageContainer}>{renderImage()}</View>

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
                {offer.rooms
                  ? t("mainScreen.rooms", { count: offer.rooms })
                  : t("offerDetails.noRooms")}
              </Text>
            </View>
          </View>

          {/* Характеристики */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              {t("offerDetails.characteristics")}
            </Text>
            <View style={styles.characteristicsGrid}>
              <View style={styles.characteristicItem}>
                <View>
                  <Text
                    style={[
                      styles.characteristicLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {t("offerDetails.area")}
                  </Text>
                  <Text
                    style={[
                      styles.characteristicValue,
                      { color: themeColors.text },
                    ]}
                  >
                    {offer.area > 0
                      ? t("offerDetails.areaValue", { value: offer.area })
                      : "—"}
                  </Text>
                </View>
              </View>

              <View style={styles.characteristicItem}>
                <View>
                  <Text
                    style={[
                      styles.characteristicLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {t("offerDetails.floor")}
                  </Text>
                  <Text
                    style={[
                      styles.characteristicValue,
                      { color: themeColors.text },
                    ]}
                  >
                    {offer.floor && offer.floorCount
                      ? t("offerDetails.floorValue", {
                          current: offer.floor,
                          total: offer.floorCount,
                        })
                      : "—"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Адрес */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              {t("offerDetails.address")}
            </Text>
            <View style={styles.addressContainer}>
              <Text style={[styles.address, { color: themeColors.text }]}>
                {offer.address || "—"}
              </Text>
            </View>
          </View>

          {/* Описание */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              {t("offerDetails.description")}
            </Text>
            <Text
              style={[styles.description, { color: themeColors.textSecondary }]}
            >
              {offer.description || t("offerDetails.noDescription")}
            </Text>
          </View>

          {/* Дополнительная информация */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              {t("offerDetails.additional")}
            </Text>
            <View style={styles.additionalInfo}>
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {t("offerDetails.id")}:
                </Text>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>
                  {offer.id}
                </Text>
              </View>
              {offer.created_at && (
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {t("offerDetails.date")}:
                  </Text>
                  <Text style={[styles.infoValue, { color: themeColors.text }]}>
                    {new Date(offer.created_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {offer.userEmail && !isKufarOffer && (
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {t("offerDetails.author")}:
                  </Text>
                  <Text style={[styles.infoValue, { color: themeColors.text }]}>
                    {offer.userEmail}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {!isKufarOffer && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.editButton,
                { backgroundColor: themeColors.primary },
              ]}
              onPress={() => setEditModalVisible(true)}
            >
              <Text style={styles.actionButtonText}>
                ✏️ {t("offerDetails.edit")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.deleteButton,
                { backgroundColor: themeColors.error },
              ]}
              onPress={handleDelete}
            >
              <Text style={styles.actionButtonText}>
                🗑️ {t("offerDetails.delete")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Кастомный Alert для подтверждения удаления */}
      <CustomAlert
        visible={alertVisible}
        title={t("offerDetails.deleteTitle")}
        message={t("offerDetails.deleteMessage")}
        onCancel={() => setAlertVisible(false)}
        onConfirm={confirmDelete}
        cancelText={t("offerDetails.cancel")}
        confirmText={t("offerDetails.confirmDelete")}
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
                ← {t("offerDetails.back")}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {t("offerDetails.editTitle")}
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
      height: 250,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 16,
      backgroundColor: colors.inputBackground,
    },
    imageWrapper: {
      flex: 1,
      position: "relative",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    imageLoader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      zIndex: 1,
    },
    imageErrorContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
    },
    imageErrorText: {
      fontSize: 14,
      fontFamily: "mt-light",
    },
    imagePlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
    },
    imagePlaceholderText: {
      fontSize: 16,
      fontFamily: "mt-light",
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
