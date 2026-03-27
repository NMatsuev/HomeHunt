import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useState } from "react";
import { gStyle } from "../../styles/style";
import useThemeViewModel from "../../viewModels/themeViewModel";
import useOffersViewModel from "../../viewModels/offersViewModel";
import useLanguageViewModel from "../../viewModels/languageViewModel";
import { useNavigation } from "@react-navigation/native";
import OfferForm from "../forms/OfferForm";

export default function MainScreen() {
  const { t } = useLanguageViewModel();
  const { themeColors } = useThemeViewModel();
  const navigation = useNavigation();
  const { offers, addOffer } = useOffersViewModel();
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddOffer = (newOffer) => {
    addOffer(newOffer);
    setModalVisible(false);
  };

  const renderOffer = ({ item }) => (
    <TouchableOpacity
      style={[styles.offerCard, { backgroundColor: themeColors.card }]}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate("OfferDetails", {
          offer: item,
        })
      }
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          {item.title}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: themeColors.primary }]}>
            {item.price}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: `${themeColors.primary}20` },
            ]}
          >
            <Text style={[styles.badgeText, { color: themeColors.primary }]}>
              {t("mainScreen.rooms", { count: item.rooms })}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text
              style={[styles.detailText, { color: themeColors.textSecondary }]}
            >
              {t("mainScreen.area", { value: item.area })}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text
              style={[styles.detailText, { color: themeColors.textSecondary }]}
            >
              {t("mainScreen.floor", {
                current: item.floor,
                total: item.floorCount,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.addressContainer}>
          <Text
            style={[styles.address, { color: themeColors.textSecondary }]}
            numberOfLines={1}
          >
            {t("mainScreen.address", { address: item.address })}
          </Text>
        </View>

        <Text
          style={[styles.description, { color: themeColors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const styles = createStyles(themeColors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[gStyle.title, { color: themeColors.text }]}>
            {t("mainScreen.title")}
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: themeColors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.counter, { color: themeColors.textSecondary }]}>
          {t("mainScreen.found", { count: offers.length })}
        </Text>
      </View>

      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => (
          <View
            style={[styles.separator, { backgroundColor: themeColors.border }]}
          />
        )}
      />

      {/* Модальное окно на весь экран */}
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
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
            onPress={() => setModalVisible(false)}
          >
            <Text
              style={[styles.modalBackText, { color: themeColors.primary }]}
            >
              ← {t("mainScreen.back")}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: themeColors.text }]}>
            {t("mainScreen.add")}
          </Text>
          <View style={styles.modalPlaceholder} />
        </View>

        <OfferForm
          onSubmit={handleAddOffer}
          onCancel={() => setModalVisible(false)}
          isEditing={false}
        />
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
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    addButtonText: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "bold",
    },
    counter: {
      fontSize: 14,
      marginTop: 4,
      fontFamily: "mt-light",
    },
    listContainer: {
      padding: 16,
    },
    separator: {
      height: 12,
    },
    offerCard: {
      flexDirection: "row",
      borderRadius: 12,
      padding: 12,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    imageContainer: {
      width: 100,
      height: 130,
      borderRadius: 8,
      overflow: "hidden",
      marginRight: 12,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    infoContainer: {
      flex: 1,
      justifyContent: "space-between",
    },
    title: {
      fontSize: 16,
      fontFamily: "mt-bold",
      marginBottom: 4,
    },
    priceContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    price: {
      fontSize: 18,
      fontFamily: "mt-bold",
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: "mt-bold",
    },
    detailsRow: {
      flexDirection: "row",
      marginBottom: 8,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    detailIcon: {
      fontSize: 14,
      marginRight: 4,
    },
    detailText: {
      fontSize: 13,
      fontFamily: "mt-light",
    },
    addressContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    addressIcon: {
      fontSize: 14,
      marginRight: 4,
    },
    address: {
      fontSize: 12,
      fontFamily: "mt-light",
      flex: 1,
    },
    description: {
      fontSize: 12,
      fontFamily: "mt-light",
      lineHeight: 16,
    },
    // Стили для модального окна на весь экран
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
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
