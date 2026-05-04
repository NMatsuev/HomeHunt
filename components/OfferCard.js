import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import useSavedViewModel from "../viewModels/savedViewModel";
import shareService from "../services/shareService";

export const OfferCard = ({ item, isLocalOffer, onPress, themeColors, t }) => {
  const { isSaved, toggleSaveOffer } = useSavedViewModel();
  const isOfferSaved = isSaved(item.id);

  const styles = createStyles(themeColors);

  const handleSavePress = async (e) => {
    e.stopPropagation();
    const result = await toggleSaveOffer(item.id);
    if (result.success) {
      console.log(isOfferSaved ? "Removed from saved" : "Added to saved");
    }
  };

  const handleSharePress = async (e) => {
    e.stopPropagation();
    const result = await shareService.shareOffer(item, t);
    if (!result.success && !result.dismissed) {
      console.log("Share failed:", result.error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.offerCard, { backgroundColor: themeColors.card }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={isLocalOffer ? { uri: item.image } : item.image}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.infoContainer}>
        <Text
          style={[styles.title, { color: themeColors.text }]}
          numberOfLines={1}
        >
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
              {item.type || t("mainScreen.rooms", { count: item.rooms })}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Text
            style={[styles.detailText, { color: themeColors.textSecondary }]}
          >
            {item.area > 0 ? t("mainScreen.area", { value: item.area }) : "—"}
          </Text>
          <Text
            style={[styles.detailText, { color: themeColors.textSecondary }]}
          >
            {item.floor && item.floorCount
              ? t("mainScreen.floor", {
                  current: item.floor,
                  total: item.floorCount,
                })
              : "—"}
          </Text>
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
      {/* Кнопка сохранения */}
      {isLocalOffer && (
        <>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: isOfferSaved
                  ? themeColors.primary
                  : "rgba(166, 160, 160, 0.26)",
              },
            ]}
            onPress={handleSavePress}
          >
            <Text style={styles.saveButtonText}>
              {isOfferSaved ? "❤️" : "🤍"}
            </Text>
          </TouchableOpacity>
          {/* Кнопка поделиться */}
          <TouchableOpacity
            style={[
              styles.iconButton,
              styles.shareButton,
              { backgroundColor: "rgba(166, 160, 160, 0.26)" },
            ]}
            onPress={handleSharePress}
          >
            <Text style={styles.iconButtonText}>📤</Text>
          </TouchableOpacity>
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    offerCard: {
      flexDirection: "row",
      borderRadius: 12,
      padding: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
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
      position: "relative",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    saveButton: {
      position: "absolute",
      bottom: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    shareButton: {
      position: "absolute",
      bottom: 8,
      right: 44,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    saveButtonText: {
      fontSize: 16,
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
      justifyContent: "space-between",
      marginBottom: 8,
    },
    detailText: {
      fontSize: 13,
      fontFamily: "mt-light",
    },
    addressContainer: {
      marginBottom: 6,
    },
    address: {
      fontSize: 12,
      fontFamily: "mt-light",
    },
    description: {
      fontSize: 12,
      fontFamily: "mt-light",
      lineHeight: 16,
    },
  });
